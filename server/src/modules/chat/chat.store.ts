import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
};

type SessionData = {
  messages: ChatMessage[];
  updatedAt: number;
};

const MAX_MESSAGES_PER_USER = 50;
const TTL_SEC = 2 * 60 * 60; // 2 hours in seconds

@Injectable()
export class ChatStore implements OnModuleDestroy {
  private redis: Redis;

  constructor(private configService: ConfigService) {
    const isTls = this.configService.get<string>('REDIS_TLS') === 'true';
    this.redis = new Redis({
      host: this.configService.get<string>('REDIS_HOST') || 'localhost',
      port: this.configService.get<number>('REDIS_PORT') || 6379,
      password: this.configService.get<string>('REDIS_PASSWORD') || undefined,
      tls: isTls ? {} : undefined,
    });
  }

  onModuleDestroy() {
    void this.redis.quit();
  }

  /**
   * Get all messages for a user
   */
  async getMessages(userId: string): Promise<ChatMessage[]> {
    const data = await this.redis.get(`chat_session:${userId}`);
    if (!data) return [];

    try {
      const session = JSON.parse(data) as SessionData;
      return session.messages;
    } catch {
      return [];
    }
  }

  /**
   * Append a message to user's history (keeps max 50 messages)
   */
  async append(userId: string, msg: ChatMessage): Promise<void> {
    const data = await this.redis.get(`chat_session:${userId}`);
    let session: SessionData = { messages: [], updatedAt: Date.now() };

    if (data) {
      try {
        session = JSON.parse(data);
      } catch {
        // Corrupted session data, start fresh
      }
    }

    const next = [...session.messages, msg];
    // Keep only the last MAX_MESSAGES_PER_USER messages
    session.messages = next.slice(-MAX_MESSAGES_PER_USER);
    session.updatedAt = Date.now();

    await this.redis.set(
      `chat_session:${userId}`,
      JSON.stringify(session),
      'EX',
      TTL_SEC,
    );
  }

  /**
   * Clear all messages for a user
   */
  async clear(userId: string): Promise<void> {
    await this.redis.del(`chat_session:${userId}`);
  }

  /**
   * Get the number of messages for a user
   */
  async getMessageCount(userId: string): Promise<number> {
    const data = await this.redis.get(`chat_session:${userId}`);
    if (!data) return 0;
    try {
      const session = JSON.parse(data) as SessionData;
      return session.messages.length;
    } catch {
      return 0;
    }
  }
}
