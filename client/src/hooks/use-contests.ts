import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import ContestsService from '@/services/contests';
import {
  ContestsFilterParams,
  CreateContestQuestionRequest,
  CreateContestRequest,
  UpdateContestRequest,
  AdminContestAttemptsParams,
} from '@/types/contest';

// ─── Query Keys ──────────────────────────────────────────────

export const contestKeys = {
  all: ['contests'] as const,
  lists: () => [...contestKeys.all, 'list'] as const,
  list: (filters: ContestsFilterParams) => [...contestKeys.lists(), filters] as const,
  detail: (id: string) => [...contestKeys.all, 'detail', id] as const,
  questions: (id: string) => [...contestKeys.all, 'questions', id] as const,
  publicLists: () => [...contestKeys.all, 'public-list'] as const,
  publicDetail: (slug: string) => [...contestKeys.all, 'public-detail', slug] as const,
  history: () => [...contestKeys.all, 'history'] as const,
  attempts: (id: string) => [...contestKeys.all, 'attempts', id] as const,
  adminAttempts: (id: string, filters: AdminContestAttemptsParams) =>
    [...contestKeys.all, 'admin-attempts', id, filters] as const,
};

// ─── Public Hooks ──────────────────────────────────────────────

export const usePublicContests = () => {
  return useQuery({
    queryKey: contestKeys.publicLists(),
    queryFn: () => ContestsService.getPublicContests(),
  });
};

export const usePublicContestDetail = (slug: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: contestKeys.publicDetail(slug),
    queryFn: () => ContestsService.getContestDetail(slug),
    enabled: !!slug && enabled,
  });
};

export const useMyContestHistory = () => {
  return useQuery({
    queryKey: contestKeys.history(),
    queryFn: () => ContestsService.getMyContestHistory(),
  });
};

export const useContestAttempts = (contestId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: contestKeys.attempts(contestId),
    queryFn: () => ContestsService.listAttempts(contestId),
    enabled: !!contestId && enabled,
  });
};

export const useStartContestAttempt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contestId: string) => ContestsService.startAttempt(contestId),
    onSuccess: (_, contestId) => {
      queryClient.invalidateQueries({ queryKey: contestKeys.attempts(contestId) });
      queryClient.invalidateQueries({ queryKey: contestKeys.history() });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to start attempt');
    },
  });
};

// ─── Contest CRUD Hooks ──────────────────────────────────────

export function useContests(params: ContestsFilterParams) {
  return useQuery({
    queryKey: contestKeys.list(params),
    queryFn: () => ContestsService.getContests(params),
    placeholderData: keepPreviousData,
  });
}

export function useContest(id: string) {
  return useQuery({
    queryKey: contestKeys.detail(id),
    queryFn: () => ContestsService.getContest(id),
    enabled: !!id,
  });
}

export function useCreateContest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateContestRequest) => ContestsService.createContest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contestKeys.lists() });
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to create contest');
    },
  });
}

export function useUpdateContest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateContestRequest) => ContestsService.updateContest(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: contestKeys.lists() });
      queryClient.invalidateQueries({ queryKey: contestKeys.detail(variables.id) });
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to update contest');
    },
  });
}

export function useDeleteContest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ContestsService.deleteContest(id),
    onSuccess: () => {
      toast.success('Contest deleted successfully!');
      queryClient.invalidateQueries({ queryKey: contestKeys.lists() });
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to delete contest');
    },
  });
}

export function useBulkDeleteContests() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => ContestsService.bulkDeleteContests(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contestKeys.lists() });
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to delete contests');
    },
  });
}

// ─── Question CRUD Hooks ──────────────────────────────────────

export function useContestQuestions(contestId: string) {
  return useQuery({
    queryKey: contestKeys.questions(contestId),
    queryFn: () => ContestsService.getContestQuestions(contestId),
    enabled: !!contestId,
  });
}

export function useAddContestQuestion(contestId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (question: CreateContestQuestionRequest) =>
      ContestsService.addQuestion(contestId, question),
    onSuccess: () => {
      toast.success('Question added successfully!');
      queryClient.invalidateQueries({ queryKey: contestKeys.questions(contestId) });
      queryClient.invalidateQueries({ queryKey: contestKeys.detail(contestId) });
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to add question');
    },
  });
}

export function useUpdateContestQuestion(contestId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      questionId,
      data,
    }: {
      questionId: string;
      data: CreateContestQuestionRequest;
    }) => ContestsService.updateQuestion(contestId, questionId, data),
    onSuccess: () => {
      toast.success('Question updated successfully!');
      queryClient.invalidateQueries({ queryKey: contestKeys.questions(contestId) });
      queryClient.invalidateQueries({ queryKey: contestKeys.detail(contestId) });
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to update question');
    },
  });
}

export function useDeleteContestQuestion(contestId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (questionId: string) => ContestsService.deleteQuestion(contestId, questionId),
    onSuccess: () => {
      toast.success('Question deleted successfully!');
      queryClient.invalidateQueries({ queryKey: contestKeys.questions(contestId) });
      queryClient.invalidateQueries({ queryKey: contestKeys.detail(contestId) });
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to delete question');
    },
  });
}

export function useReorderContestQuestions(contestId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (questionIds: string[]) => ContestsService.reorderQuestions(contestId, questionIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contestKeys.questions(contestId) });
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to reorder questions');
    },
  });
}

// ─── Admin Attempts ──────────────────────────────────────────

export function useAdminContestAttempts(contestId: string, params: AdminContestAttemptsParams) {
  return useQuery({
    queryKey: contestKeys.adminAttempts(contestId, params),
    queryFn: () => ContestsService.getAdminAttempts(contestId, params),
    placeholderData: keepPreviousData,
  });
}

export function useDeleteAdminContestAttempt(contestId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (attemptId: string) => ContestsService.deleteAdminAttempt(contestId, attemptId),
    onSuccess: () => {
      toast.success('Attempt deleted successfully!');
      // Invalidate the list so it updates
      queryClient.invalidateQueries({
        queryKey: [...contestKeys.all, 'admin-attempts', contestId],
      });
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to delete attempt');
    },
  });
}
