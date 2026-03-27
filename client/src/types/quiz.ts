// ========== ENUMS ==========

export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
  SINGLE_CHOICE = 'SINGLE_CHOICE',
}

// Helper function to convert QuestionType to backend type (identity function since they match)
export function toBackendQuestionType(type: QuestionType): QuestionType {
  return type;
}

export enum AttemptStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
  EXPIRED = 'EXPIRED',
}

// ========== QUIZ QUESTION & OPTIONS ==========

export interface QuizOption {
  id: string;
  text: string;
  order: number;
  isCorrect?: boolean; // Only included in result review
}

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  text: string;
  order: number;
  points: number;
  options: QuizOption[];
}

// ========== QUIZ (LESSON QUIZ SETTINGS) ==========

export interface LessonQuiz {
  lessonId: string;
  durationSec?: number | null;
  passScore?: number | null;
  maxAttempts?: number | null;
  questions: QuizQuestion[];
}

// ========== QUIZ ATTEMPT ==========

export interface QuizAttempt {
  attemptId: string;
  lessonId: string;
  attemptNo: number;
  status: AttemptStatus;
  startedAt: string;
  expiresAt?: string | null;
  submittedAt?: string | null;
  score?: number | null;
  maxScore?: number | null;
  passed?: boolean | null;
  correctCount?: number | null;
  totalCount?: number | null;
}

// ========== SAVED ANSWER (during quiz taking) ==========

export interface SavedAnswer {
  questionId: string;
  selectedOptionIds: string[];
}

// ========== ATTEMPT ANSWER (in result) ==========

export interface AttemptAnswerResult {
  questionId: string;
  question: {
    type: QuestionType;
    text: string;
    points: number;
    options: QuizOption[];
  };
  selectedOptionIds: string[];
  isCorrect: boolean;
  earnedScore: number;
}

// ========== API REQUEST PAYLOADS ==========

export interface AnswerPayload {
  questionId: string;
  selectedOptionIds: string[];
}

export interface SaveAnswersPayload {
  answers: AnswerPayload[];
}

export interface SubmitAttemptPayload {
  answers: AnswerPayload[];
}

// ========== API RESPONSES ==========

// Response from POST /api/quizzes/:lessonId/attempts/start
export interface StartAttemptResponse {
  attemptId: string;
  lessonId: string;
  attemptNo: number;
  status: AttemptStatus;
  startedAt: string;
  expiresAt?: string | null;
}

// Response from GET /api/attempts/:attemptId
export interface LoadAttemptResponse {
  attemptId: string;
  lessonId: string;
  status: AttemptStatus;
  expiresAt?: string | null;
  questions: QuizQuestion[];
  savedAnswers: SavedAnswer[];
}

// Response from PUT /api/attempts/:attemptId/answers
export interface SaveAnswersResponse {
  ok: boolean;
}

// Response from POST /api/attempts/:attemptId/submit
export interface SubmitAttemptResponse {
  attemptId: string;
  status: AttemptStatus;
  score: number;
  maxScore: number;
  passed: boolean;
  correctCount: number;
  totalCount: number;
  startedAt: string;
  submittedAt: string;
}

// Response from GET /api/attempts/:attemptId/result
export interface AttemptResultResponse {
  attemptId: string;
  lessonId: string;
  attemptNo: number;
  status: AttemptStatus;
  score: number;
  maxScore: number;
  passed: boolean;
  correctCount: number;
  totalCount: number;
  startedAt: string;
  submittedAt: string;
  answers: AttemptAnswerResult[];
}

// Response from GET /api/quizzes/:lessonId/attempts
export interface AttemptsListResponse {
  lessonId: string;
  maxAttempts: number | null;
  usedAttempts: number;
  attempts: QuizAttempt[];
}

// ========== LEGACY TYPES (for admin/editing - can be kept separate) ==========

export interface QuizQuestionAdmin {
  _id?: string;
  quizId: string;
  question: string;
  explanation: string;
  type: QuestionType;
  options: string[];
  correctAnswers: number[];
  point: number;
}

export interface QuizAdmin {
  _id?: string;
  lessonId: string;
  questions: QuizQuestionAdmin[];
  createdAt?: string;
  updatedAt?: string;
}
