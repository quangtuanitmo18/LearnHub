// Lesson types

import type { QuestionType } from '@/types/quiz';

export enum LessonType {
  VIDEO = 'VIDEO',
  QUIZ = 'QUIZ',
  ARTICLE = 'ARTICLE',
}

// Lesson resource interface
export interface ILessonResource {
  _id?: string;
  title?: string;
  description?: string;
  url?: string; // for video
  totalAttemptsAllowed?: number; // for quiz
  passingScorePercentage?: number; // for quiz
  questions?: QuizQuestionForm[]; // for quiz
}

// Quiz question interface for form management (frontend)
export interface QuizQuestionForm {
  id?: string; // Backend ID for existing questions
  text: string; // Question text (matches backend "text" field)
  explanation?: string | null;
  type: QuestionType;
  order: number;
  points: number; // Points awarded for correct answer
  options: Array<{
    id?: string; // Backend ID for existing options
    text: string;
    order: number;
    isCorrect: boolean;
  }>;
}

// Backend API response structure
export interface ILesson {
  id: string;
  type: LessonType;
  title: string;
  description: string | null;
  slug: string;
  order: number;
  published: boolean;
  durationSec: number;
  courseId: string;
  chapterId: string;
  createdAt: string;
  updatedAt: string;
  course?: {
    id: string;
    title: string;
    slug: string;
  };
  chapter?: {
    id: string;
    title: string;
    order: number;
  };
  article: BackendArticleContent | null;
  video: BackendVideoContent | null;
  quiz: BackendQuizContent | null;
}

export interface BackendArticleContent {
  lessonId: string;
  content: string;
  durationSec: number;
}

export interface BackendVideoContent {
  lessonId: string;
  url: string;
  durationSec: number;
}

export interface BackendQuizQuestion {
  id: string;
  quizId: string;
  type: 'TRUE_FALSE' | 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE';
  text: string;
  explanation: string | null;
  order: number;
  points: number;
  options: Array<{
    id: string;
    questionId: string;
    text: string;
    order: number;
    isCorrect: boolean;
  }>;
}

export interface BackendQuizContent {
  lessonId: string;
  durationSec: number;
  passScore: number;
  maxAttempts: number | null;
  questions: BackendQuizQuestion[];
}

// Main lesson interface (API response) - keeping for backward compatibility

// Display lesson interface (for UI components)

// Lesson form data interface (legacy - keeping for backward compatibility)
export interface LessonFormData {
  _id?: string;
  title: string;
  chapterId: string;
  courseId: string;
  resourceId?: string;
  contentType: LessonType;
  order: number;
  preview: boolean;
  isPublished: boolean;
  duration?: number; // in seconds
  resource?: ILessonResource;
}

// New backend request structure
export interface CreateLessonRequest {
  courseId: string;
  chapterId: string;
  lesson: {
    type: LessonType;
    title: string;
    description?: string | null;
    slug?: string; // Optional, backend can generate
    order?: number; // Optional, backend can assign
    published: boolean;
  };
  content: VideoContent | ArticleContent | QuizContent;
}

export interface UpdateLessonRequest {
  id: string;
  courseId: string;
  chapterId: string;
  lesson: {
    type: LessonType;
    title: string;
    description?: string | null;
    slug?: string;
    order?: number;
    published: boolean;
  };
  content: VideoContent | ArticleContent | QuizContent;
}

// Content types for requests
export interface VideoContent {
  url: string;
  durationSec: number;
}

export interface ArticleContent {
  content: string;
  durationSec: number;
}

export interface QuizQuestionRequest {
  id?: string; // For existing questions (on update)
  type: 'TRUE_FALSE' | 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE';
  text: string;
  order: number;
  points: number;
  options: Array<{
    id?: string; // For existing options (on update)
    text: string;
    order: number;
    isCorrect: boolean;
  }>;
  explanation?: string | null;
}

export interface QuizContent {
  durationSec: number;
  passScore: number;
  questions: QuizQuestionRequest[];
}

export interface ReorderLessonsRequest {
  lessons: Array<{ id: string; order: number }>;
}

export interface LessonsFilterParams {
  chapterId?: string;
  courseId?: string;
  isPublished?: boolean;
  contentType?: LessonType;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  [key: string]: unknown;
}

// Lesson list response (for consistency with other services)
export interface LessonsListResponse {
  lessons: ILesson[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
  };
}

// Keep BackendLessonData and ApiLesson as aliases for backward compatibility
export type BackendLessonData = LessonFormData;
