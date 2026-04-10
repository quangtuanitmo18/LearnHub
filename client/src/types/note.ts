// Video Note Types

export interface INote {
  id: string;
  userId: string;
  lessonId: string;
  content: string;
  timestamp: number; // in seconds
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteRequest {
  lessonId: string;
  content: string;
  timestamp: number;
}

export interface UpdateNoteRequest {
  content?: string;
  timestamp?: number;
}
