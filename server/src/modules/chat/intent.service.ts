import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

export type Intent =
  | 'COURSE_ADVICE'
  | 'ORDER_STATUS'
  | 'SMALL_TALK'
  | 'OUT_OF_SCOPE';

const VALID_INTENTS: Intent[] = [
  'COURSE_ADVICE',
  'ORDER_STATUS',
  'SMALL_TALK',
  'OUT_OF_SCOPE',
];

@Injectable()
export class IntentService {
  private openai: OpenAI | null = null;
  private modelName: string;

  constructor(private readonly configService: ConfigService) {
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
   * Classify user message intent using Gemini via OpenRouter
   */
  async classify(message: string): Promise<Intent> {
    if (!this.openai) {
      return 'COURSE_ADVICE';
    }

    try {
      const prompt = this.buildIntentPrompt(message);
      const completion = await this.openai.chat.completions.create({
        model: this.modelName,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1500,
      });
      const text = completion.choices[0]?.message?.content || '';

      // Try to parse JSON response
      const parsed = this.safeParseJson(text);
      if (parsed?.intent && VALID_INTENTS.includes(parsed.intent)) {
        return parsed.intent;
      }

      return 'COURSE_ADVICE';
    } catch (error) {
      console.error('Error classifying intent:', error);
      return 'COURSE_ADVICE';
    }
  }

  /**
   * Build prompt for intent classification
   */
  private buildIntentPrompt(message: string): string {
    return `
[ROLE]
Bạn là bộ phân loại intent cho chatbot tư vấn khóa học lập trình.

[CÁC INTENT HỖ TRỢ]
1. COURSE_ADVICE: Người dùng muốn được tư vấn chọn khóa học, hỏi về nội dung khóa, lộ trình học lập trình.
2. ORDER_STATUS: Người dùng hỏi về thanh toán, trạng thái đơn hàng, bị trừ tiền, chưa học được dù đã mua, hóa đơn.
3. SMALL_TALK: Câu chào hỏi, làm quen, hỏi bạn là ai, cảm ơn, v.v.
4. OUT_OF_SCOPE: Câu hỏi không liên quan tới khóa học lập trình hoặc đơn hàng.

[YÊU CẦU NGƯỜI DÙNG]
"${message}"

[NHIỆM VỤ]
- Chọn 1 intent phù hợp nhất trong 4 intent trên.
- Trả về JSON:
{ "intent": "COURSE_ADVICE" | "ORDER_STATUS" | "SMALL_TALK" | "OUT_OF_SCOPE" }

[ĐỊNH DẠNG OUTPUT]
Chỉ trả về JSON, không giải thích thêm.
`;
  }

  /**
   * Safely parse JSON from Gemini response
   */
  private safeParseJson(text: string): { intent?: Intent } | null {
    try {
      // Remove markdown code blocks if present
      const trimmed = text.trim().replace(/```json|```/g, '');
      return JSON.parse(trimmed);
    } catch {
      return null;
    }
  }
}
