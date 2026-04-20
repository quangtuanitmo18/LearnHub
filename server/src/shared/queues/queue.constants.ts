/**
 * Centralized queue name constants.
 * All BullMQ queue names are defined here to avoid string duplication.
 */

export const QUEUE_NAMES = {
  GAMIFICATION: 'gamification',
  QUIZ_ATTEMPT: 'quiz-attempt',
  AUTH: 'auth-queue',
  EMAIL: 'email-queue',
  ORDER: 'order-queue',
  AI_EMBED: 'ai-embed',
  AI_CONCEPT: 'ai-concept',
  CONTEST: 'contest-queue',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];
