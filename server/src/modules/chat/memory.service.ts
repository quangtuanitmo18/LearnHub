import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/shared/services/prisma.service';
import { z } from 'zod';

/**
 * Manages long-term user memory across chat sessions.
 * After each session, summarizes the conversation into a persistent profile.
 */
@Injectable()
export class MemoryService {
  private readonly logger = new Logger(MemoryService.name);
  private readonly llm: ChatOpenAI | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const routerKey = this.configService.get<string>('openrouter.apiKey');
    const model =
      this.configService.get<string>('openrouter.model') ||
      'google/gemini-2.5-flash';

    if (routerKey) {
      this.llm = new ChatOpenAI({
        model: model,
        configuration: {
          apiKey: routerKey,
          baseURL: 'https://openrouter.ai/api/v1',
        },
        maxTokens: 500,
      });
    }
  }

  /**
   * Load existing memory for a user. Returns empty string if none exists.
   */
  async loadMemory(userId: string): Promise<string> {
    if (!userId || userId === 'guest') return '';

    try {
      const memory = await this.prisma.userMemory.findUnique({
        where: { userId },
      });

      if (!memory) return '';

      return `[STUDENT PROFILE FROM PREVIOUS SESSIONS]\n${memory.summary}`;
    } catch (error) {
      this.logger.warn('Failed to load memory', error);
      return '';
    }
  }

  /**
   * Summarize a chat session and upsert into UserMemory.
   * This is designed to be called fire-and-forget after a response.
   */
  async saveMemory(
    userId: string,
    chatHistory: { role: string; content: string }[],
  ): Promise<void> {
    if (!this.llm || !userId || userId === 'guest') return;
    // Only save memory every 4 messages (2 full exchanges) to save tokens
    if (chatHistory.length < 4 || chatHistory.length % 4 !== 0) return;

    try {
      // Load existing memory
      const existing = await this.prisma.userMemory.findUnique({
        where: { userId },
      });

      const historyText = chatHistory
        .slice(-10) // Last 10 messages only
        .map((m) => `${m.role}: ${m.content.substring(0, 200)}`)
        .join('\n');

      const structuredLlm = this.llm.withStructuredOutput(
        z.object({
          summary: z
            .string()
            .describe(
              'Updated student profile summary in 3-5 sentences. Include their skill level, interests, learning goals, and any patterns observed.',
            ),
          traits: z.object({
            level: z
              .string()
              .optional()
              .describe('Skill level: beginner, intermediate, advanced'),
            interests: z
              .array(z.string())
              .optional()
              .describe('Topics they are interested in'),
            weaknesses: z
              .array(z.string())
              .optional()
              .describe('Areas they struggle with'),
            preferredStyle: z
              .string()
              .optional()
              .describe('Learning style: practical, theoretical, visual'),
          }),
        }),
        { name: 'memory_update' },
      );

      const result = await structuredLlm.invoke([
        new SystemMessage(
          `You are analyzing a chat session between a student and an AI tutor on a programming course platform.
${existing ? `Previous profile: ${existing.summary}` : 'This is a new student with no prior profile.'}

Based on the conversation below, generate an UPDATED student profile. 
Merge new observations with the existing profile. Be concise and factual.`,
        ),
        new HumanMessage(historyText),
      ]);

      await this.prisma.userMemory.upsert({
        where: { userId },
        create: {
          userId,
          summary: result.summary,
          traits: result.traits as any,
        },
        update: {
          summary: result.summary,
          traits: result.traits as any,
        },
      });

      this.logger.debug(`Memory updated for user ${userId}`);
    } catch (error) {
      this.logger.warn('Failed to save memory', error);
    }
  }
}
