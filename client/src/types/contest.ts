import { QuestionType } from './quiz';

export enum ContestStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

export interface ContestQuestionOption {
  id: string;
  text: string;
  order: number;
  isCorrect: boolean;
}

export interface ContestQuestion {
  id: string;
  contestId: string;
  type: QuestionType;
  text: string;
  explanation?: string | null;
  order: number;
  points: number;
  options: ContestQuestionOption[];
}

export interface Contest {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  imageId?: string | null;
  passScore?: number | null;
  maxAttempts?: number | null;
  durationSec?: number | null;
  startTime?: string | null;
  endTime?: string | null;
  showResultDate?: string | null;
  isMembership: boolean;
  status: ContestStatus;
  createdAt: string;
  updatedAt: string;
  questions?: ContestQuestion[];
  _count?: { questions: number };
}

export interface CreateContestRequest {
  title: string;
  slug: string;
  description?: string;
  imageId?: string;
  passScore?: number;
  maxAttempts?: number;
  durationSec?: number;
  startTime?: string;
  endTime?: string;
  showResultDate?: string;
  isMembership?: boolean;
}

export interface UpdateContestRequest extends Partial<CreateContestRequest> {
  id: string;
  status?: ContestStatus;
}

export interface CreateContestQuestionRequest {
  type: QuestionType;
  text: string;
  explanation?: string;
  order?: number;
  points?: number;
  options: { text: string; order: number; isCorrect: boolean }[];
}

export interface UpdateContestQuestionRequest extends CreateContestQuestionRequest {
  id: string;
}

// Pagination / filter types
export interface ContestsFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ContestsListResponse {
  result: Contest[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface MyContestHistory {
  contest: {
    id: string;
    title: string;
    slug: string;
    imageId: string | null;
    passScore: number | null;
    endTime: string | null;
  };
  bestScore: number;
  bestAttemptStatus: string;
  totalAttempts: number;
  lastAttemptAt: string;
}

export interface AdminContestAttempt {
  id: string;
  attemptNo: number;
  status: string;
  score: number | null;
  maxScore: number | null;
  passed: boolean | null;
  startedAt: string;
  submittedAt: string | null;
  user: {
    id: string;
    username: string;
    email: string;
    avatar: string | null;
  };
}

export interface AdminContestAttemptsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface AdminContestAttemptsResponse {
  result: AdminContestAttempt[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}
