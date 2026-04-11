import { ApiService } from '@/lib/api-service';
import { INote } from '@/types/note';

const ENDPOINTS = {
  CREATE: '/notes',
  BY_LESSON: (lessonId: string) => `/notes/lesson/${lessonId}`,
  UPDATE: (id: string) => `/notes/${id}`,
  DELETE: (id: string) => `/notes/${id}`,
} as const;

export class NoteService {
  static async create(data: {
    lessonId: string;
    content: string;
    timestamp?: number;
  }): Promise<INote> {
    return ApiService.post<INote, typeof data>(ENDPOINTS.CREATE, data);
  }

  static async findAllByLesson(lessonId: string): Promise<INote[]> {
    return ApiService.get<INote[]>(ENDPOINTS.BY_LESSON(lessonId));
  }

  static async update(id: string, data: { content?: string; timestamp?: number }): Promise<INote> {
    return ApiService.put<INote, typeof data>(ENDPOINTS.UPDATE(id), data);
  }

  static async remove(id: string): Promise<void> {
    return ApiService.delete<void>(ENDPOINTS.DELETE(id));
  }
}

export default NoteService;
