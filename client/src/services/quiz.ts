import { ApiService } from '@/lib/api-service';
import {
  QuizAdmin,
  QuizQuestionAdmin,
  StartAttemptResponse,
  LoadAttemptResponse,
  SaveAnswersResponse,
  SubmitAttemptResponse,
  AttemptResultResponse,
  AttemptsListResponse,
  AnswerPayload,
} from '@/types/quiz';

// ========== ENDPOINTS ==========

const ENDPOINTS = {
  // Admin endpoints (quiz management)
  QUIZZES: '/quiz-questions',
  QUIZ: (id: string) => `/quiz-questions/${id}`,
  QUIZ_BY_LESSON: (lessonId: string) => `/quiz-questions/lesson/${lessonId}`,
  QUIZ_QUESTIONS: (quizId: string) => `/quiz-questions/${quizId}/questions`,
  QUIZ_QUESTION: (quizId: string, questionId: string) =>
    `/quiz-questions/${quizId}/questions/${questionId}`,
  QUIZ_PUBLISH: (id: string) => `/quiz-questions/${id}/publish`,
  QUIZ_UNPUBLISH: (id: string) => `/quiz-questions/${id}/unpublish`,

  // User quiz attempt endpoints (new API structure)
  START_ATTEMPT: (lessonId: string) => `/quizzes/${lessonId}/attempts/start`,
  LOAD_ATTEMPT: (attemptId: string) => `/attempts/${attemptId}`,
  SAVE_ANSWERS: (attemptId: string) => `/attempts/${attemptId}/answers`,
  SUBMIT_ATTEMPT: (attemptId: string) => `/attempts/${attemptId}/submit`,
  ATTEMPT_RESULT: (attemptId: string) => `/attempts/${attemptId}/result`,
  LIST_ATTEMPTS: (lessonId: string) => `/quizzes/${lessonId}/attempts`,
} as const;

// ========== SERVICE CLASS ==========

export class QuizService {
  // ========== USER QUIZ TAKING (New API) ==========

  /**
   * Start or resume a quiz attempt
   * POST /api/quizzes/:lessonId/attempts/start
   */
  static async startAttempt(lessonId: string): Promise<StartAttemptResponse> {
    return ApiService.post<StartAttemptResponse>(ENDPOINTS.START_ATTEMPT(lessonId), {});
  }

  /**
   * Load attempt with questions and saved answers
   * GET /api/attempts/:attemptId
   */
  static async loadAttempt(attemptId: string): Promise<LoadAttemptResponse> {
    return ApiService.get<LoadAttemptResponse>(ENDPOINTS.LOAD_ATTEMPT(attemptId));
  }

  /**
   * Autosave answers during quiz taking
   * PUT /api/attempts/:attemptId/answers
   */
  static async saveAnswers(
    attemptId: string,
    answers: AnswerPayload[],
  ): Promise<SaveAnswersResponse> {
    return ApiService.put<SaveAnswersResponse, { answers: AnswerPayload[] }>(
      ENDPOINTS.SAVE_ANSWERS(attemptId),
      { answers },
    );
  }

  /**
   * Submit attempt for grading
   * POST /api/attempts/:attemptId/submit
   */
  static async submitAttempt(
    attemptId: string,
    answers: AnswerPayload[],
  ): Promise<SubmitAttemptResponse> {
    return ApiService.post<SubmitAttemptResponse, { answers: AnswerPayload[] }>(
      ENDPOINTS.SUBMIT_ATTEMPT(attemptId),
      { answers },
    );
  }

  /**
   * Get attempt result for review
   * GET /api/attempts/:attemptId/result
   */
  static async getAttemptResult(attemptId: string): Promise<AttemptResultResponse> {
    return ApiService.get<AttemptResultResponse>(ENDPOINTS.ATTEMPT_RESULT(attemptId));
  }

  /**
   * List all attempts for a lesson quiz
   * GET /api/quizzes/:lessonId/attempts
   */
  static async listAttempts(lessonId: string): Promise<AttemptsListResponse> {
    try {
      return await ApiService.get<AttemptsListResponse>(ENDPOINTS.LIST_ATTEMPTS(lessonId));
    } catch {
      return {
        lessonId,
        maxAttempts: null,
        usedAttempts: 0,
        attempts: [],
      };
    }
  }

  // ========== ADMIN QUIZ MANAGEMENT (Legacy) ==========

  /**
   * Get quiz by lesson (admin)
   */
  static async getQuizByLesson(lessonId: string): Promise<QuizAdmin | null> {
    try {
      return await ApiService.get<QuizAdmin>(ENDPOINTS.QUIZ_BY_LESSON(lessonId));
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get quiz by ID (admin)
   */
  static async getQuiz(quizId: string): Promise<QuizAdmin> {
    return ApiService.get<QuizAdmin>(ENDPOINTS.QUIZ(quizId));
  }

  /**
   * Save quiz questions (admin)
   */
  static async saveQuizQuestions(questions: QuizQuestionAdmin[]): Promise<QuizAdmin> {
    return ApiService.post<QuizAdmin, { questions: QuizQuestionAdmin[] }>(ENDPOINTS.QUIZZES, {
      questions,
    });
  }

  /**
   * Update quiz questions (admin)
   */
  static async updateQuizQuestions(
    quizId: string,
    questions: QuizQuestionAdmin[],
  ): Promise<QuizAdmin> {
    return ApiService.put<QuizAdmin, { questions: QuizQuestionAdmin[] }>(
      `${ENDPOINTS.QUIZ(quizId)}/questions`,
      { questions },
    );
  }

  /**
   * Delete quiz (admin)
   */
  static async deleteQuiz(quizId: string): Promise<void> {
    return ApiService.delete<void>(ENDPOINTS.QUIZ(quizId));
  }

  /**
   * Publish quiz (admin)
   */
  static async publishQuiz(quizId: string): Promise<QuizAdmin> {
    return ApiService.put<QuizAdmin>(ENDPOINTS.QUIZ_PUBLISH(quizId));
  }

  /**
   * Unpublish quiz (admin)
   */
  static async unpublishQuiz(quizId: string): Promise<QuizAdmin> {
    return ApiService.put<QuizAdmin>(ENDPOINTS.QUIZ_UNPUBLISH(quizId));
  }

  /**
   * Add question (admin)
   */
  static async addQuestion(
    quizId: string,
    question: QuizQuestionAdmin,
  ): Promise<QuizQuestionAdmin> {
    return ApiService.post<QuizQuestionAdmin, QuizQuestionAdmin>(
      ENDPOINTS.QUIZ_QUESTIONS(quizId),
      question,
    );
  }

  /**
   * Update question (admin)
   */
  static async updateQuestion(
    quizId: string,
    questionId: string,
    question: QuizQuestionAdmin,
  ): Promise<QuizQuestionAdmin> {
    return ApiService.put<QuizQuestionAdmin, QuizQuestionAdmin>(
      ENDPOINTS.QUIZ_QUESTION(quizId, questionId),
      question,
    );
  }

  /**
   * Delete question (admin)
   */
  static async deleteQuestion(quizId: string, questionId: string): Promise<void> {
    return ApiService.delete<void>(ENDPOINTS.QUIZ_QUESTION(quizId, questionId));
  }

  /**
   * Reorder questions (admin)
   */
  static async reorderQuestions(quizId: string, questionIds: string[]): Promise<QuizAdmin> {
    return ApiService.put<QuizAdmin, { questionIds: string[] }>(
      `${ENDPOINTS.QUIZ(quizId)}/reorder-questions`,
      { questionIds },
    );
  }
}

export default QuizService;
