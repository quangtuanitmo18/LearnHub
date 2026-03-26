import { Injectable } from '@nestjs/common';

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
const TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

@Injectable()
export class ChatStore {
  private store = new Map<string, SessionData>(); // key = userId ("guest" if not logged in)

  /**
   * Get or initialize a session for a user
   */
  private getOrInit(userId: string): SessionData {
    const now = Date.now();
    const existing = this.store.get(userId);

    // If no existing session, create a new one
    if (!existing) {
      const fresh: SessionData = { messages: [], updatedAt: now };
      this.store.set(userId, fresh);
      return fresh;
    }

    // If session is expired (older than TTL), reset it
    if (now - existing.updatedAt > TTL_MS) {
      const fresh: SessionData = { messages: [], updatedAt: now };
      this.store.set(userId, fresh);
      return fresh;
    }

    return existing;
  }

  /**
   * Get all messages for a user
   */
  getMessages(userId: string): ChatMessage[] {
    return this.getOrInit(userId).messages;
  }

  /**
   * Append a message to user's history (keeps max 50 messages)
   */
  append(userId: string, msg: ChatMessage): void {
    const session = this.getOrInit(userId);
    const next = [...session.messages, msg];
    // Keep only the last MAX_MESSAGES_PER_USER messages
    session.messages = next.slice(-MAX_MESSAGES_PER_USER);
    session.updatedAt = Date.now();
    this.store.set(userId, session);
  }

  /**
   * Clear all messages for a user
   */
  clear(userId: string): void {
    this.store.delete(userId);
  }

  /**
   * Get the number of messages for a user
   */
  getMessageCount(userId: string): number {
    return this.getOrInit(userId).messages.length;
  }
}
