import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { CourseRepository } from '../course/course.repository';
import { OrderRepository } from '../order/order.repository';
import { ChatMessage, ChatStore } from './chat.store';
import { ChatCourseDto, ChatReplyDto } from './dto/chat-response.dto';
import { Intent, IntentService } from './intent.service';

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
  private openai: OpenAI | null = null;
  private modelName: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly store: ChatStore,
    private readonly intentService: IntentService,
    private readonly courseRepository: CourseRepository,
    private readonly orderRepository: OrderRepository,
  ) {
    const apiKey = this.configService.get<string>('openrouter.apiKey');
    this.modelName =
      this.configService.get<string>('openrouter.model') ||
      'google/gemini-2.5-flash';

    if (!apiKey) {
      return;
    }

    this.openai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: apiKey,
    });
  }

  /**
   * Handle user message and generate AI response
   */
  async handleUserMessage(
    userId: string,
    userMessage: string,
  ): Promise<ChatReplyDto> {
    // 1. Classify intent
    const intent: Intent = await this.intentService.classify(userMessage);

    // 2. Get chat history
    const history = this.store.getMessages(userId);

    // 3. Get domain data based on intent
    let courses: CourseWithTags[] = [];
    let orderContext = '';

    if (intent === 'COURSE_ADVICE') {
      courses = await this.searchCoursesByMessage(userMessage);
    } else if (intent === 'ORDER_STATUS') {
      const order = await this.getLatestOrderForUser(userId);
      orderContext = this.buildOrderContext(order);
    }

    const courseContext = this.buildCourseContext(courses);

    // 4. Build prompt based on intent
    const prompt = this.buildMainPrompt({
      intent,
      message: userMessage,
      courseContext,
      orderContext,
    });

    // 5. Generate response with OpenAI via OpenRouter
    let rawText: string;
    try {
      if (!this.openai) {
        rawText = this.getFallbackResponse(intent);
      } else {
        const messages: any[] = [
          { role: 'system', content: prompt },
          ...history.map((m) => ({ role: m.role, content: m.content })),
          { role: 'user', content: userMessage },
        ];

        const completion = await this.openai.chat.completions.create({
          model: this.modelName,
          messages: messages,
          max_tokens: 1500,
        });
        rawText = completion.choices[0]?.message?.content || '';
      }
    } catch (error) {
      console.error('Error generating OpenRouter response:', error);
      rawText = this.getFallbackResponse(intent);
    }

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
