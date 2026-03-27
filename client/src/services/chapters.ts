import { ApiService } from '@/lib/api-service';
import type {
  ChapterFormData,
  ChaptersFilterParams,
  CreateChapterRequest,
  IChapter,
  ReorderChaptersRequest,
  UpdateChapterRequest,
} from '@/types/chapter';

const ENDPOINTS = {
  CHAPTERS: '/chapters',
  CHAPTER: (id: string) => `/chapters/${id}`,
  COURSE_CHAPTERS: (courseId: string) => `/chapters/course/${courseId}`,
  CHAPTER_REORDER: '/chapters/reorder',
} as const;

export class ChaptersService {
  // Get chapters with filtering
  static async getChapters(params?: ChaptersFilterParams): Promise<IChapter[]> {
    try {
      return await ApiService.get<IChapter[]>(ENDPOINTS.CHAPTERS, params);
    } catch {
      return [];
    }
  }

  // Get course chapters
  static async getChaptersByCourse(courseId: string): Promise<IChapter[]> {
    try {
      return await ApiService.get<IChapter[]>(ENDPOINTS.COURSE_CHAPTERS(courseId));
    } catch {
      return [];
    }
  }

  // Get chapter by ID
  static async getChapter(id: string): Promise<IChapter> {
    return ApiService.get<IChapter>(ENDPOINTS.CHAPTER(id));
  }

  // Create chapter
  static async createChapter(chapterData: CreateChapterRequest): Promise<IChapter> {
    return ApiService.post<IChapter, CreateChapterRequest>(ENDPOINTS.CHAPTERS, chapterData);
  }

  // Update chapter
  static async updateChapter(chapterData: UpdateChapterRequest): Promise<IChapter> {
    const { id, ...updateData } = chapterData;
    return ApiService.put<IChapter, ChapterFormData>(ENDPOINTS.CHAPTER(id), updateData);
  }

  // Delete chapter
  static async deleteChapter(id: string): Promise<void> {
    return ApiService.delete<void>(ENDPOINTS.CHAPTER(id));
  }

  // Reorder chapters
  static async reorderChapters(reorderData: ReorderChaptersRequest): Promise<IChapter[]> {
    return ApiService.put<IChapter[], ReorderChaptersRequest>(
      ENDPOINTS.CHAPTER_REORDER,
      reorderData,
    );
  }

  // Toggle publish status
  static async toggleChapterPublish(id: string): Promise<IChapter> {
    return ApiService.put<IChapter>(ENDPOINTS.CHAPTER(id) + '/toggle-publish');
  }

  // Get public chapters for course
  static async getPublishedChaptersByCourse(courseId: string): Promise<IChapter[]> {
    try {
      const response = await ApiService.get<IChapter[]>(`/chapters/course/${courseId}/published`);
      return response || [];
    } catch {
      return [];
    }
  }
}

export default ChaptersService;
