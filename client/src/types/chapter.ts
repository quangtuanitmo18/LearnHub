// Chapter types

import { LessonType } from './lesson';

// Chapter interface (matches new API response)
export interface IChapter {
  id: string;
  title: string;
  description: string;
  order: number;
  isPublished: boolean;
  courseId: string;
  createdAt: string;
  updatedAt: string;
  course?: {
    id: string;
    title: string;
    slug: string;
  };
  // Summary statistics (returned by /chapters/course/{courseId})
  totalLessons: number;
  totalPublishedLessons: number;
  totalDuration: number;
}

// Legacy chapter with embedded lessons (for backward compatibility)
export interface IChapterWithLessons extends IChapter {
  lessonIds?: string[];
  lessons?: Array<{
    id: string;
    title: string;
    contentType: LessonType;
    isPublished: boolean;
    preview: boolean;
    order: number;
    duration?: number;
    resource?: {
      description?: string;
      url?: string;
      totalAttemptsAllowed?: number;
      passingScorePercentage?: number;
    };
  }>;
}

// Chapter form data
export interface ChapterFormData {
  title: string;
  description: string;
  isPublished: boolean;
}

// Chapter request types
export interface CreateChapterRequest extends ChapterFormData {
  courseId: string;
}

export interface UpdateChapterRequest extends ChapterFormData {
  id: string;
}

export interface ReorderChaptersRequest {
  chapters: Array<{ id: string; order: number }>;
}

export interface ChaptersFilterParams {
  courseId?: string;
  isPublished?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  [key: string]: unknown;
}

// Chapter list response (for consistency with other services)
export interface ChaptersListResponse {
  chapters: IChapter[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
  };
}
