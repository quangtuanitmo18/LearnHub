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
You are an intent classifier for a programming course chatbot.

[SUPPORTED INTENTS]
1. COURSE_ADVICE: User wants advice on choosing courses, asks about course content, programming learning paths.
2. ORDER_STATUS: User asks about payment, order status, being charged, unable to access course after purchase, invoices.
3. SMALL_TALK: Greetings, getting to know you, asking who you are, thanking, etc.
4. OUT_OF_SCOPE: Questions not related to programming courses or orders.

[USER REQUEST]
"${message}"

[TASK]
- Select the 1 most suitable intent from the 4 intents above.
- Return JSON:
{ "intent": "COURSE_ADVICE" | "ORDER_STATUS" | "SMALL_TALK" | "OUT_OF_SCOPE" }

[OUTPUT FORMAT]
Only return JSON, no further explanations.
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
