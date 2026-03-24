export interface ITrack {
  id: string;
  userId: string;
  courseId: string;
  lessonId: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CreateTrackRequest {
  courseId: string;
  lessonId: string;
}

export interface DeleteTrackRequest {
  courseId: string;
  lessonId: string;
}

export interface ToggleTrackRequest {
  courseId: string;
  lessonId: string;
}

