import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { z } from 'zod';

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
  private llm: ChatOpenAI | null = null;
  private modelName: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('openrouter.apiKey');
    this.modelName =
      this.configService.get<string>('openrouter.model') ||
      'google/gemini-2.5-flash';
    if (!apiKey) {
      return;
    }

    this.llm = new ChatOpenAI({
      model: this.modelName,
      configuration: {
        apiKey: apiKey,
        baseURL: 'https://openrouter.ai/api/v1',
      },
      maxTokens: 50,
      temperature: 0,
    });
  }

  /**
   * Classify user message intent using Gemini via OpenRouter
   */
  async classify(message: string): Promise<Intent> {
    if (!this.llm) {
      return 'COURSE_ADVICE';
    }

    try {
      const prompt = this.buildIntentPrompt(message);

      const structuredLlm = this.llm.withStructuredOutput(
        z.object({
          intent: z
            .enum([
              'COURSE_ADVICE',
              'ORDER_STATUS',
              'SMALL_TALK',
              'OUT_OF_SCOPE',
            ])
            .describe('The classified intent of the user message'),
        }),
        { name: 'classify_intent' },
      );

      const result = await structuredLlm.invoke([new SystemMessage(prompt)]);

      if (result?.intent && VALID_INTENTS.includes(result.intent as Intent)) {
        return result.intent as Intent;
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
}
