import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { QuizService } from '@/services/quiz';
import {
  QuizQuestionAdmin,
  AttemptsListResponse,
  LoadAttemptResponse,
  AttemptResultResponse,
  AnswerPayload,
} from '@/types/quiz';

// ========== QUERY KEYS ==========

export const QUIZ_QUERY_KEYS = {
  // User quiz taking
  ATTEMPTS_LIST: (lessonId: string) => ['quiz', 'attempts', 'list', lessonId],
  ATTEMPT: (attemptId: string) => ['quiz', 'attempt', attemptId],
  ATTEMPT_RESULT: (attemptId: string) => ['quiz', 'attempt', 'result', attemptId],

  // Admin quiz management
  QUIZ_BY_LESSON: (lessonId: string) => ['quiz', 'lesson', lessonId],
  QUIZ: (quizId: string) => ['quiz', quizId],
} as const;

// ========== USER QUIZ TAKING HOOKS ==========

/**
 * Hook to list all attempts for a lesson quiz
 * GET /api/quizzes/:lessonId/attempts
 */
export function useAttemptsList(lessonId: string, options?: { enabled?: boolean }) {
  return useQuery<AttemptsListResponse>({
    queryKey: QUIZ_QUERY_KEYS.ATTEMPTS_LIST(lessonId),
    queryFn: () => QuizService.listAttempts(lessonId),
    enabled: !!lessonId && (options?.enabled ?? true),
  });
}

/**
 * Hook to load attempt with questions and saved answers
 * GET /api/attempts/:attemptId
 */
export function useLoadAttempt(attemptId: string | null, options?: { enabled?: boolean }) {
  return useQuery<LoadAttemptResponse>({
    queryKey: QUIZ_QUERY_KEYS.ATTEMPT(attemptId || ''),
    queryFn: () => QuizService.loadAttempt(attemptId!),
    enabled: !!attemptId && (options?.enabled ?? true),
  });
}

/**
 * Hook to get attempt result for review
 * GET /api/attempts/:attemptId/result
 */
export function useAttemptResult(attemptId: string | null, options?: { enabled?: boolean }) {
  return useQuery<AttemptResultResponse>({
    queryKey: QUIZ_QUERY_KEYS.ATTEMPT_RESULT(attemptId || ''),
    queryFn: () => QuizService.getAttemptResult(attemptId!),
    enabled: !!attemptId && (options?.enabled ?? true),
  });
}

/**
 * Hook to start or resume a quiz attempt
 * POST /api/quizzes/:lessonId/attempts/start
 */
export function useStartAttempt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lessonId: string) => QuizService.startAttempt(lessonId),
    onSuccess: (data) => {
      // Invalidate attempts list to refresh
      queryClient.invalidateQueries({
        queryKey: QUIZ_QUERY_KEYS.ATTEMPTS_LIST(data.lessonId),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to start quiz');
    },
  });
}

/**
 * Hook to autosave answers during quiz taking
 * PUT /api/attempts/:attemptId/answers
 */
export function useSaveAnswers() {
  return useMutation({
    mutationFn: ({ attemptId, answers }: { attemptId: string; answers: AnswerPayload[] }) =>
      QuizService.saveAnswers(attemptId, answers),
    // Silent - no toast on success/error for autosave
  });
}

/**
 * Hook to submit attempt for grading
 * POST /api/attempts/:attemptId/submit
 */
export function useSubmitAttempt() {
  return useMutation({
    mutationFn: ({ attemptId, answers }: { attemptId: string; answers: AnswerPayload[] }) =>
      QuizService.submitAttempt(attemptId, answers),
    onSuccess: (data) => {
      toast.success('Quiz submitted successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit quiz');
    },
  });
}

// ========== ADMIN QUIZ MANAGEMENT HOOKS ==========

/**
 * Get quiz by lesson ID (admin)
 */
export function useQuizByLesson(lessonId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: QUIZ_QUERY_KEYS.QUIZ_BY_LESSON(lessonId),
    queryFn: () => QuizService.getQuizByLesson(lessonId),
    enabled: !!lessonId && (options?.enabled ?? true),
  });
}

/**
 * Get quiz by ID (admin)
 */
export function useQuiz(quizId: string) {
  return useQuery({
    queryKey: QUIZ_QUERY_KEYS.QUIZ(quizId),
    queryFn: () => QuizService.getQuiz(quizId),
    enabled: !!quizId,
  });
}

/**
 * Save quiz questions (admin)
 */
export function useSaveQuizQuestions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ questions }: { questions: QuizQuestionAdmin[] }) =>
      QuizService.saveQuizQuestions(questions),
    onSuccess: (updatedQuiz) => {
      queryClient.invalidateQueries({
        queryKey: QUIZ_QUERY_KEYS.QUIZ_BY_LESSON(updatedQuiz.lessonId),
      });
      if (updatedQuiz._id) {
        queryClient.setQueryData(QUIZ_QUERY_KEYS.QUIZ(updatedQuiz._id), updatedQuiz);
      }
      toast.success('Questions saved successfully');
    },
    onError: (error) => {
      console.error('Save quiz questions error:', error);
      toast.error('Failed to save questions');
    },
  });
}

/**
 * Update quiz questions (admin)
 */
export function useUpdateQuizQuestions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quizId, questions }: { quizId: string; questions: QuizQuestionAdmin[] }) =>
      QuizService.updateQuizQuestions(quizId, questions),
    onSuccess: (updatedQuiz) => {
      if (updatedQuiz._id) {
        queryClient.setQueryData(QUIZ_QUERY_KEYS.QUIZ(updatedQuiz._id), updatedQuiz);
      }
      queryClient.invalidateQueries({
        queryKey: QUIZ_QUERY_KEYS.QUIZ_BY_LESSON(updatedQuiz.lessonId),
      });
      toast.success('Questions updated successfully');
    },
    onError: (error) => {
      console.error('Update quiz questions error:', error);
      toast.error('Failed to update questions');
    },
  });
}

/**
 * Delete quiz (admin)
 */
export function useDeleteQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (quizId: string) => QuizService.deleteQuiz(quizId),
    onSuccess: (_, quizId) => {
      queryClient.removeQueries({ queryKey: QUIZ_QUERY_KEYS.QUIZ(quizId) });
      queryClient.invalidateQueries({ queryKey: ['quiz', 'lesson'] });
      toast.success('Quiz deleted successfully');
    },
    onError: (error) => {
      console.error('Delete quiz error:', error);
      toast.error('Failed to delete quiz');
    },
  });
}

/**
 * Publish quiz (admin)
 */
export function usePublishQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (quizId: string) => QuizService.publishQuiz(quizId),
    onSuccess: (updatedQuiz) => {
      if (updatedQuiz._id) {
        queryClient.setQueryData(QUIZ_QUERY_KEYS.QUIZ(updatedQuiz._id), updatedQuiz);
      }
      queryClient.invalidateQueries({
        queryKey: QUIZ_QUERY_KEYS.QUIZ_BY_LESSON(updatedQuiz.lessonId),
      });
      toast.success('Quiz published successfully');
    },
    onError: (error) => {
      console.error('Publish quiz error:', error);
      toast.error('Failed to publish quiz');
    },
  });
}

/**
 * Unpublish quiz (admin)
 */
export function useUnpublishQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (quizId: string) => QuizService.unpublishQuiz(quizId),
    onSuccess: (updatedQuiz) => {
      if (updatedQuiz._id) {
        queryClient.setQueryData(QUIZ_QUERY_KEYS.QUIZ(updatedQuiz._id), updatedQuiz);
      }
      queryClient.invalidateQueries({
        queryKey: QUIZ_QUERY_KEYS.QUIZ_BY_LESSON(updatedQuiz.lessonId),
      });
      toast.success('Quiz unpublished successfully');
    },
    onError: (error) => {
      console.error('Unpublish quiz error:', error);
      toast.error('Failed to unpublish quiz');
    },
  });
}

/**
 * Add question (admin)
 */
export function useAddQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      quizId,
      question,
    }: {
      quizId: string;
      question: Omit<QuizQuestionAdmin, '_id'>;
    }) => QuizService.addQuestion(quizId, question as QuizQuestionAdmin),
    onSuccess: (_, { quizId }) => {
      queryClient.invalidateQueries({ queryKey: QUIZ_QUERY_KEYS.QUIZ(quizId) });
      toast.success('Question added successfully');
    },
    onError: (error) => {
      console.error('Add question error:', error);
      toast.error('Failed to add question');
    },
  });
}

/**
 * Update question (admin)
 */
export function useUpdateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      quizId,
      questionId,
      question,
    }: {
      quizId: string;
      questionId: string;
      question: Omit<QuizQuestionAdmin, '_id'>;
    }) => QuizService.updateQuestion(quizId, questionId, question as QuizQuestionAdmin),
    onSuccess: (_, { quizId }) => {
      queryClient.invalidateQueries({ queryKey: QUIZ_QUERY_KEYS.QUIZ(quizId) });
      toast.success('Question updated successfully');
    },
    onError: (error) => {
      console.error('Update question error:', error);
      toast.error('Failed to update question');
    },
  });
}

/**
 * Delete question (admin)
 */
export function useDeleteQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quizId, questionId }: { quizId: string; questionId: string }) =>
      QuizService.deleteQuestion(quizId, questionId),
    onSuccess: (_, { quizId }) => {
      queryClient.invalidateQueries({ queryKey: QUIZ_QUERY_KEYS.QUIZ(quizId) });
      toast.success('Question deleted successfully');
    },
    onError: (error) => {
      console.error('Delete question error:', error);
      toast.error('Failed to delete question');
    },
  });
}

/**
 * Reorder questions (admin)
 */
export function useReorderQuestions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quizId, questionIds }: { quizId: string; questionIds: string[] }) =>
      QuizService.reorderQuestions(quizId, questionIds),
    onSuccess: (updatedQuiz) => {
      if (updatedQuiz._id) {
        queryClient.setQueryData(QUIZ_QUERY_KEYS.QUIZ(updatedQuiz._id), updatedQuiz);
      }
      toast.success('Questions reordered successfully');
    },
    onError: (error) => {
      console.error('Reorder questions error:', error);
      toast.error('Failed to reorder questions');
    },
  });
}
