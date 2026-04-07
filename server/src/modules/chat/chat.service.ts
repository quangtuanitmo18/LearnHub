import {
  AIMessage,
  HumanMessage,
  SystemMessage,
  ToolMessage,
} from '@langchain/core/messages';
import { Annotation, END, START, StateGraph } from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { z } from 'zod';
import { CourseRepository } from '../course/course.repository';
import { OrderRepository } from '../order/order.repository';
import { ChatMessage, ChatStore } from './chat.store';
import { ChatCourseDto, ChatReplyDto } from './dto/chat-response.dto';
import { Intent, IntentService } from './intent.service';
import { KnowledgeGraphService } from './knowledge-graph.service';
import { MemoryService } from './memory.service';
import { RetrievalService } from './retrieval.service';
import { ToolsService } from './tools.service';

const GraphState = Annotation.Root({
  messages: Annotation<any[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  intent: Annotation<Intent>({
    reducer: (x, y) => y ?? x,
    default: () => 'SMALL_TALK',
  }),
  courseContext: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => '',
  }),
  orderContext: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => '',
  }),
  rawText: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => '',
  }),
  expandedQuery: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => '',
  }),
  courses: Annotation<any[]>({
    reducer: (x, y) => y ?? x,
    default: () => [],
  }),
});

interface CourseWithTags extends ChatCourseDto {
  tags?: string[];
}

interface GeminiParsedResponse {
  answer: string;
  suggestions: string[];
  courseIds: string[];
}

@Injectable()
export class ChatService {
  private llm: ChatOpenAI | null = null;
  private modelName: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly store: ChatStore,
    private readonly intentService: IntentService,
    private readonly courseRepository: CourseRepository,
    private readonly orderRepository: OrderRepository,
    private readonly retrievalService: RetrievalService,
    private readonly toolsService: ToolsService,
    private readonly memoryService: MemoryService,
    private readonly knowledgeGraphService: KnowledgeGraphService,
  ) {
    const apiKey = this.configService.get<string>('openrouter.apiKey');
    this.modelName =
      this.configService.get<string>('openrouter.model') ||
      'google/gemini-2.5-flash';

    if (!apiKey) {
      return;
    }

    this.llm = new ChatOpenAI({
      modelName: this.modelName,
      openAIApiKey: apiKey,
      configuration: { baseURL: 'https://openrouter.ai/api/v1' },
      maxTokens: 1500,
    });
  }

  /**
   * Handle user message and generate AI response
   */
  async handleUserMessage(
    userId: string,
    userMessage: string,
  ): Promise<ChatReplyDto> {
    // Orchestrate Using LangGraph StateGraph
    const workflow = new StateGraph(GraphState)
      .addNode('classify', async () => {
        const intent = await this.intentService.classify(userMessage);
        return { intent };
      })
      .addNode('expand', async (state) => {
        // Tier 2: Query Expansion (HyDE) — only for course queries
        if (state.intent === 'COURSE_ADVICE') {
          const expandedQuery =
            await this.retrievalService.expandQuery(userMessage);
          return { expandedQuery };
        }
        return { expandedQuery: userMessage };
      })
      .addNode('retrieve', async (state) => {
        let courseContext = '';
        let orderContext = '';
        let courses: CourseWithTags[] = [];

        if (state.intent === 'COURSE_ADVICE') {
          courses = await this.searchCoursesByMessage(userMessage);
          courseContext = this.buildCourseContext(courses);

          try {
            // Tier 2: Hybrid Search (using expandedQuery from 'expand' node) + LLM Reranking
            const candidates = await this.retrievalService.hybridSearch(
              userMessage,
              state.expandedQuery || userMessage,
              20,
            );
            const chunks = await this.retrievalService.rerank(
              userMessage,
              candidates,
              4,
            );
            if (chunks.length > 0) {
              courseContext +=
                '\n\n[LESSON KNOWLEDGE FROM RAG — Hybrid Search + Reranked]\n' +
                chunks.map((c) => c.content).join('\n---\n');

              // Tier 3: Knowledge Graph enrichment
              const graphContext =
                await this.knowledgeGraphService.enrichContext(
                  userMessage,
                  chunks.map((c) => c.id),
                );
              if (graphContext) courseContext += graphContext;
            }
          } catch (e) {
            console.error('Tier 2/3 RAG error:', e);
          }
        } else if (state.intent === 'ORDER_STATUS') {
          const order = await this.getLatestOrderForUser(userId);
          orderContext = this.buildOrderContext(order);
        }
        return { courseContext, orderContext, courses };
      })
      .addNode('generate', async (state) => {
        if (!this.llm) {
          return { rawText: this.getFallbackResponse(state.intent) };
        }

        // Tier 3: Load long-term memory for personalized system prompt
        const memoryContext = await this.memoryService.loadMemory(userId);

        const prompt = this.buildMainPrompt({
          intent: state.intent,
          message: userMessage,
          courseContext: state.courseContext,
          orderContext: state.orderContext,
        });

        const fullPrompt = memoryContext
          ? `${prompt}\n\n${memoryContext}`
          : prompt;

        const history = this.store.getMessages(userId);
        const messages = [
          new SystemMessage(fullPrompt),
          ...history.map((m) =>
            m.role === 'user'
              ? new HumanMessage(m.content)
              : new AIMessage(m.content),
          ),
          new HumanMessage(userMessage),
        ];

        try {
          // Only bind tools for intents that benefit from system lookups
          const shouldUseTools =
            state.intent === 'COURSE_ADVICE' || state.intent === 'ORDER_STATUS';
          const tools = shouldUseTools
            ? this.toolsService.getTools(userId)
            : [];

          const llmToUse =
            tools.length > 0 ? this.llm.bindTools(tools) : this.llm;
          const response = await llmToUse.invoke(messages);

          // Check if LLM wants to call a tool
          if (response.tool_calls && response.tool_calls.length > 0) {
            // Execute all tool calls
            const toolMessages: ToolMessage[] = [];
            for (const toolCall of response.tool_calls) {
              const tool = tools.find((t) => t.name === toolCall.name);
              if (tool) {
                const toolResult = await tool.invoke(toolCall.args);
                toolMessages.push(
                  new ToolMessage({
                    content: String(toolResult),
                    tool_call_id: toolCall.id || '',
                  }),
                );
              }
            }

            // Second LLM call with tool results + structured output
            const structuredLlm = this.llm.withStructuredOutput(
              z.object({
                answer: z
                  .string()
                  .describe('Friendly, easy-to-understand answer'),
                suggestions: z
                  .array(z.string())
                  .describe('3-4 suggestion questions'),
                courseIds: z
                  .array(z.string())
                  .describe('Array of course IDs if recommended'),
              }),
              { name: 'chat_reply' },
            );

            const finalResponse = await structuredLlm.invoke([
              ...messages,
              response,
              ...toolMessages,
            ]);
            return { rawText: JSON.stringify(finalResponse) };
          }

          // No tool calls — use structured output directly
          const structuredLlm = this.llm.withStructuredOutput(
            z.object({
              answer: z
                .string()
                .describe('Friendly, easy-to-understand answer'),
              suggestions: z
                .array(z.string())
                .describe('3-4 suggestion questions'),
              courseIds: z
                .array(z.string())
                .describe('Array of course IDs if recommended'),
            }),
            { name: 'chat_reply' },
          );
          const structuredResponse = await structuredLlm.invoke(messages);
          return { rawText: JSON.stringify(structuredResponse) };
        } catch (e) {
          console.error('LangGraph LLM error:', e);
          return { rawText: this.getFallbackResponse(state.intent) };
        }
      })
      .addEdge(START, 'classify')
      .addEdge('classify', 'expand')
      .addEdge('expand', 'retrieve')
      .addEdge('retrieve', 'generate')
      .addEdge('generate', END);

    const app = workflow.compile();
    const result = await app.invoke({});

    const intent = result.intent;
    const rawText = result.rawText;
    const courses = result.courses as CourseWithTags[];

    // 6. Parse Gemini JSON response
    const { answer, suggestions, courseIds } =
      this.safeParseGeminiJson(rawText);

    // 7. Save messages to history
    this.store.append(userId, {
      role: 'user',
      content: userMessage,
      createdAt: Date.now(),
    });
    this.store.append(userId, {
      role: 'assistant',
      content: answer,
      createdAt: Date.now(),
    });

    // Tier 3: Fire-and-forget memory save (non-blocking)
    const allMessages = this.store
      .getMessages(userId)
      .map((m) => ({ role: m.role, content: m.content }));
    this.memoryService
      .saveMemory(userId, allMessages)
      .catch((err) => console.error('Memory save failed:', err));

    // 8. Select courses to return
    const matchedCourses =
      intent === 'COURSE_ADVICE'
        ? this.pickCoursesForReply(courses, courseIds)
        : [];

    return {
      response: answer,
      courses: matchedCourses,
      suggestions: this.buildSuggestions(intent, suggestions),
      intent: this.toIntentCode(intent),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Clear chat history for a user
   */
  clearHistory(userId: string): void {
    this.store.clear(userId);
  }

  /**
   * Get chat history for a user
   */
  getHistory(userId: string): ChatMessage[] {
    return this.store.getMessages(userId);
  }

  // ==================== Private Helper Methods ====================

  /**
   * Search courses by user message using repository
   */
  private async searchCoursesByMessage(
    message: string,
  ): Promise<CourseWithTags[]> {
    try {
      // Use existing repository method with search
      const result = await this.courseRepository.findPublishedWithFilters({
        search: message,
        limit: 10,
        page: 1,
      });

      return result.result.map((course: any) => ({
        id: course.id,
        title: course.title,
        price: Number(course.price) || 0,
        oldPrice: course.oldPrice ? Number(course.oldPrice) : undefined,
        image: course.image
          ? `${course.image.cdnBaseUrl}/${course.image.storageKey}`
          : undefined,
        level: course.level,
        author: course.author?.username,
        view: course.view,
        tags: course.category ? [course.category.name] : [],
      }));
    } catch (error) {
      return [];
    }
  }

  /**
   * Get latest order for user
   */
  private async getLatestOrderForUser(userId: string): Promise<any> {
    try {
      if (!userId || userId === 'guest') {
        return null;
      }

      const result = await this.orderRepository.findByUser(userId, {
        page: 1,
        limit: 1,
      });

      return result.result[0] || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Build course context for prompt
   */
  private buildCourseContext(courses: CourseWithTags[]): string {
    if (!courses.length) {
      return 'No suitable courses found in the list.';
    }

    return courses
      .map(
        (c) =>
          `- id: "${c.id}", title: "${c.title}", level: "${c.level ?? ''}", tags: "${(c.tags || []).join(',')}", price: ${c.price}`,
      )
      .join('\n');
  }

  /**
   * Build order context for prompt
   */
  private buildOrderContext(order: any): string {
    if (!order) {
      return 'User has no orders in the system.';
    }

    const itemNames = order.items?.map((i: any) => i.title).join(', ') || 'N/A';

    return `Latest order:
- Order code: ${order.code}
- Status: ${order.status}
- Total amount: ${order.totalAmount}
- Courses: ${itemNames}
- Created at: ${order.createdAt}`;
  }

  /**
   * Build main prompt based on intent
   */
  private buildMainPrompt(params: {
    intent: Intent;
    message: string;
    courseContext: string;
    orderContext: string;
  }): string {
    const { intent, message, courseContext, orderContext } = params;

    if (intent === 'COURSE_ADVICE') {
      return `
[ROLE]
You are a programming course advisor assistant for an online learning platform.

[COURSE CONTEXT]
${courseContext}

[USER REQUEST]
"${message}"

[TASK]
1. Understand the goal, level, and topic the student is interested in.
2. Select up to 3 most suitable courses from the COURSE CONTEXT.
3. Write a friendly, easy-to-understand answer in English.
4. Create 3–4 suggestion questions for the user to click next.

[OUTPUT FORMAT]
Return JSON only:

{
  "answer": "string - answer for the user",
  "suggestions": ["string", "..."],
  "courseIds": ["id1", "id2"]
}
`;
    }

    if (intent === 'ORDER_STATUS') {
      return `
[ROLE]
You are a customer support agent for an online course platform.

[ORDER CONTEXT]
${orderContext}

[USER REQUEST]
"${message}"

[TASK]
1. Explain the current order status based on the ORDER CONTEXT.
2. Clearly state the next step the student should take.
3. If the order is not found in the context, explicitly state so and suggest checking their email/order code.

[OUTPUT FORMAT]
Return JSON only:

{
  "answer": "string",
  "suggestions": ["string", "..."],
  "courseIds": []
}
`;
    }

    if (intent === 'SMALL_TALK') {
      return `
[ROLE]
You are a friendly assistant.

[USER REQUEST]
"${message}"

[TASK]
1. Reply with a friendly, short greeting.
2. Then suggest the user ask about courses or programming learning paths.

[OUTPUT FORMAT]
JSON only:

{
  "answer": "string",
  "suggestions": ["string", "..."],
  "courseIds": []
}
`;
    }

    // OUT_OF_SCOPE
    return `
[ROLE]
You are an assistant with limited scope, supporting only programming courses and orders.

[USER REQUEST]
"${message}"

[TASK]
1. Politely refuse to answer because the question is out of scope.
2. Suggest asking about courses, programming learning paths, or orders.

[OUTPUT FORMAT]
JSON only:

{
  "answer": "string",
  "suggestions": ["string", "..."],
  "courseIds": []
}
`;
  }

  /**
   * Safely parse JSON from Gemini response
   */
  private safeParseGeminiJson(raw: string): GeminiParsedResponse {
    try {
      const trimmed = raw.trim().replace(/```json|```/g, '');
      const parsed = JSON.parse(trimmed);
      return {
        answer: parsed.answer ?? raw,
        suggestions: parsed.suggestions ?? [],
        courseIds: parsed.courseIds ?? [],
      };
    } catch {
      return { answer: raw, suggestions: [], courseIds: [] };
    }
  }

  /**
   * Remove tags from course object for response
   */
  private stripTags(this: void, course: CourseWithTags): ChatCourseDto {
    const { tags, ...rest } = course;
    return rest;
  }

  /**
   * Pick courses to return in response
   */
  private pickCoursesForReply(
    courses: CourseWithTags[],
    courseIds: string[],
  ): ChatCourseDto[] {
    if (!courses.length) return [];

    // If Gemini returned specific course IDs, use those
    if (courseIds && courseIds.length) {
      const map = new Map(courses.map((c) => [c.id, c]));
      const selected = courseIds
        .map((id) => map.get(id))
        .filter((c): c is CourseWithTags => c !== undefined);

      if (selected.length > 0) {
        return selected.map(this.stripTags);
      }
    }

    // Fallback: return first 3 courses
    return courses.slice(0, 3).map(this.stripTags);
  }

  /**
   * Build suggestions based on intent
   */
  private buildSuggestions(
    intent: Intent,
    modelSuggestions: string[],
  ): string[] {
    if (modelSuggestions?.length) return modelSuggestions;

    if (intent === 'COURSE_ADVICE') {
      return [
        'Which programming language do you want to learn?',
        'Are you interested in front-end, back-end, or fullstack programming?',
        'What is your budget for a course?',
        'What is your current level (beginner, intermediate, advanced)?',
      ];
    }

    if (intent === 'ORDER_STATUS') {
      return [
        'Check latest order status',
        'I was charged but cannot access the course',
        'I want an invoice for the course',
      ];
    }

    return [
      'Please advise me on a programming learning path from scratch',
      'Suggest JavaScript courses for beginners',
      'Check recent course orders',
    ];
  }

  /**
   * Convert internal intent to API response code
   */
  private toIntentCode(intent: Intent): string {
    switch (intent) {
      case 'COURSE_ADVICE':
        return 'course_search';
      case 'ORDER_STATUS':
        return 'order_status';
      case 'SMALL_TALK':
        return 'small_talk';
      case 'OUT_OF_SCOPE':
        return 'out_of_scope';
    }
  }

  /**
   * Get fallback response when Gemini is unavailable
   */
  private getFallbackResponse(intent: Intent): string {
    if (intent === 'COURSE_ADVICE') {
      return JSON.stringify({
        answer:
          'Hello! I am the course advisor assistant. The system is currently busy, please try again later or contact support via email.',
        suggestions: [
          'Programming course advice',
          'View popular courses',
          'Contact support',
        ],
        courseIds: [],
      });
    }

    if (intent === 'ORDER_STATUS') {
      return JSON.stringify({
        answer:
          'Sorry, I cannot check your order right now. Please contact support for help.',
        suggestions: ['Contact support', 'View order history in account'],
        courseIds: [],
      });
    }

    return JSON.stringify({
      answer: 'Hello! How can I help you with programming courses?',
      suggestions: ['Course advice', 'Check order', 'View popular courses'],
      courseIds: [],
    });
  }
}
