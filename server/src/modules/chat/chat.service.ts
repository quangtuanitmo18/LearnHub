import OpenAI from 'openai';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
    this.modelName = this.configService.get<string>('openrouter.model') || 'google/gemini-2.5-flash';

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
          { role: 'user', content: userMessage }
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
      return 'Không có khóa học nào phù hợp trong danh sách.';
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
      return 'Người dùng chưa có đơn hàng nào trong hệ thống.';
    }

    const itemNames = order.items?.map((i: any) => i.title).join(', ') || 'N/A';

    return `Đơn hàng mới nhất:
- Mã đơn: ${order.code}
- Trạng thái: ${order.status}
- Tổng tiền: ${order.totalAmount}
- Các khóa học: ${itemNames}
- Ngày tạo: ${order.createdAt}`;
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
Bạn là trợ lý tư vấn khóa học lập trình cho nền tảng học online.

[NGỮ CẢNH KHOÁ HỌC]
${courseContext}

[YÊU CẦU NGƯỜI DÙNG]
"${message}"

[NHIỆM VỤ]
1. Hiểu mục tiêu, trình độ và chủ đề mà học viên quan tâm.
2. Chọn tối đa 3 khóa học trong NGỮ CẢNH KHOÁ HỌC phù hợp nhất.
3. Viết câu trả lời thân thiện, dễ hiểu, bằng tiếng Việt.
4. Tạo 3–4 câu hỏi gợi ý (suggestions) để người dùng bấm tiếp tục.

[ĐỊNH DẠNG OUTPUT]
Chỉ trả về JSON:

{
  "answer": "string - câu trả lời cho người dùng",
  "suggestions": ["string", "..."],
  "courseIds": ["id1", "id2"]
}
`;
    }

    if (intent === 'ORDER_STATUS') {
      return `
[ROLE]
Bạn là nhân viên hỗ trợ khách hàng cho nền tảng khóa học online.

[NGỮ CẢNH ĐƠN HÀNG]
${orderContext}

[YÊU CẦU NGƯỜI DÙNG]
"${message}"

[NHIỆM VỤ]
1. Dựa vào NGỮ CẢNH ĐƠN HÀNG để giải thích trạng thái đơn hàng hiện tại.
2. Nói rõ bước tiếp theo mà học viên nên làm.
3. Nếu không thấy đơn hàng trong context, hãy nói rõ và gợi ý kiểm tra lại email/mã đơn.

[ĐỊNH DẠNG OUTPUT]
Chỉ trả về JSON:

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
Bạn là trợ lý thân thiện.

[YÊU CẦU NGƯỜI DÙNG]
"${message}"

[NHIỆM VỤ]
1. Trả lời chào hỏi thân thiện, ngắn gọn.
2. Sau đó gợi ý người dùng hỏi về khóa học hoặc lộ trình học lập trình.

[ĐỊNH DẠNG OUTPUT]
Chỉ JSON:

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
Bạn là trợ lý giới hạn phạm vi hỗ trợ trong lĩnh vực khóa học lập trình và đơn hàng.

[YÊU CẦU NGƯỜI DÙNG]
"${message}"

[NHIỆM VỤ]
1. Lịch sự từ chối trả lời vì câu hỏi ngoài phạm vi.
2. Gợi ý họ hỏi về khóa học, lộ trình học lập trình hoặc đơn hàng.

[ĐỊNH DẠNG OUTPUT]
Chỉ JSON:

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
        'Bạn muốn học về ngôn ngữ lập trình nào?',
        'Bạn quan tâm đến lập trình front-end, back-end hay fullstack?',
        'Ngân sách của bạn là bao nhiêu cho một khóa học?',
        'Bạn đang ở cấp độ nào (beginner, intermediate, advanced)?',
      ];
    }

    if (intent === 'ORDER_STATUS') {
      return [
        'Kiểm tra trạng thái đơn hàng gần nhất',
        'Tôi bị trừ tiền nhưng chưa vào học được',
        'Tôi muốn xuất hóa đơn cho khóa học',
      ];
    }

    return [
      'Tư vấn giúp mình lộ trình học lập trình từ đầu',
      'Gợi ý khóa học JavaScript cho người mới',
      'Kiểm tra đơn hàng mua khóa học gần đây',
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
          'Xin chào! Tôi là trợ lý tư vấn khóa học. Hiện tại hệ thống đang bận, vui lòng thử lại sau hoặc liên hệ hỗ trợ qua email.',
        suggestions: [
          'Tư vấn khóa học lập trình',
          'Xem các khóa học phổ biến',
          'Liên hệ hỗ trợ',
        ],
        courseIds: [],
      });
    }

    if (intent === 'ORDER_STATUS') {
      return JSON.stringify({
        answer:
          'Xin lỗi, tôi không thể kiểm tra đơn hàng của bạn ngay bây giờ. Vui lòng liên hệ bộ phận hỗ trợ để được giúp đỡ.',
        suggestions: ['Liên hệ hỗ trợ', 'Xem lịch sử đơn hàng trong tài khoản'],
        courseIds: [],
      });
    }

    return JSON.stringify({
      answer: 'Xin chào! Tôi có thể giúp gì cho bạn về khóa học lập trình?',
      suggestions: [
        'Tư vấn khóa học',
        'Kiểm tra đơn hàng',
        'Xem các khóa học phổ biến',
      ],
      courseIds: [],
    });
  }
}
