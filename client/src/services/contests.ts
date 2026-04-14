import { ApiService } from '@/lib/api-service';
import {
  Contest,
  ContestQuestion,
  ContestsFilterParams,
  ContestsListResponse,
  CreateContestQuestionRequest,
  CreateContestRequest,
  MyContestHistory,
  UpdateContestQuestionRequest,
  UpdateContestRequest,
  AdminContestAttemptsParams,
  AdminContestAttemptsResponse,
} from '@/types/contest';

const ENDPOINTS = {
  // Public & User
  PUBLIC_CONTESTS: '/contests',
  PUBLIC_CONTEST_DETAIL: (slug: string) => `/contests/detail/${slug}`,
  CONTEST_HISTORY: '/contests/me/history',
  START_ATTEMPT: (id: string) => `/contests/${id}/attempts/start`,
  LIST_ATTEMPTS: (id: string) => `/contests/${id}/attempts`,

  // Admin
  ADMIN_CONTESTS: '/contests/admin/list',
  ADMIN_CONTEST: (id: string) => `/contests/admin/${id}`,
  ADMIN_CREATE: '/contests/admin',
  ADMIN_BULK_DELETE: '/contests/admin/bulk-delete',
  ADMIN_QUESTIONS: (id: string) => `/contests/admin/${id}/questions`,
  ADMIN_QUESTION: (id: string, qId: string) => `/contests/admin/${id}/questions/${qId}`,
  ADMIN_REORDER: (id: string) => `/contests/admin/${id}/reorder-questions`,
  ADMIN_ATTEMPTS: (id: string, query: string) => `/contests/admin/${id}/attempts?${query}`,
  ADMIN_ATTEMPT: (id: string, attemptId: string) => `/contests/admin/${id}/attempts/${attemptId}`,
} as const;

export class ContestsService {
  // ─── Public APIs ──────────────────────────────────────────────

  static async getPublicContests(): Promise<Contest[]> {
    return ApiService.get<Contest[]>(ENDPOINTS.PUBLIC_CONTESTS);
  }

  static async getContestDetail(slug: string): Promise<Contest> {
    return ApiService.get<Contest>(ENDPOINTS.PUBLIC_CONTEST_DETAIL(slug));
  }

  static async getMyContestHistory(): Promise<MyContestHistory[]> {
    return ApiService.get<MyContestHistory[]>(ENDPOINTS.CONTEST_HISTORY);
  }

  static async startAttempt(id: string) {
    return ApiService.post(ENDPOINTS.START_ATTEMPT(id), {});
  }

  static async listAttempts(id: string) {
    return ApiService.get(ENDPOINTS.LIST_ATTEMPTS(id));
  }

  // ─── Admin Contest CRUD ───────────────────────────────────────
  static async getContests(params: ContestsFilterParams): Promise<ContestsListResponse> {
    try {
      return await ApiService.get<ContestsListResponse>(
        ENDPOINTS.ADMIN_CONTESTS,
        params as Record<string, unknown>,
      );
    } catch {
      return {
        result: [],
        meta: {
          page: params?.page || 1,
          limit: params?.limit || 10,
          totalItems: 0,
          totalPages: 0,
        },
      };
    }
  }

  static async getContest(id: string): Promise<Contest> {
    return ApiService.get<Contest>(ENDPOINTS.ADMIN_CONTEST(id));
  }

  static async createContest(data: CreateContestRequest): Promise<Contest> {
    return ApiService.post<Contest, CreateContestRequest>(ENDPOINTS.ADMIN_CREATE, data);
  }

  static async updateContest(data: UpdateContestRequest): Promise<Contest> {
    const { id, ...updateData } = data;
    return ApiService.put<Contest, Omit<UpdateContestRequest, 'id'>>(
      ENDPOINTS.ADMIN_CONTEST(id),
      updateData,
    );
  }

  static async deleteContest(id: string): Promise<void> {
    return ApiService.delete<void>(ENDPOINTS.ADMIN_CONTEST(id));
  }

  static async bulkDeleteContests(ids: string[]): Promise<void> {
    return ApiService.delete<void, { ids: string[] }>(ENDPOINTS.ADMIN_BULK_DELETE, { ids });
  }

  // ─── Question Management ────────────────────────────────────

  static async getContestQuestions(contestId: string): Promise<ContestQuestion[]> {
    return ApiService.get<ContestQuestion[]>(ENDPOINTS.ADMIN_QUESTIONS(contestId));
  }

  static async addQuestion(
    contestId: string,
    question: CreateContestQuestionRequest,
  ): Promise<ContestQuestion> {
    return ApiService.post<ContestQuestion, CreateContestQuestionRequest>(
      ENDPOINTS.ADMIN_QUESTIONS(contestId),
      question,
    );
  }

  static async updateQuestion(
    contestId: string,
    questionId: string,
    question: CreateContestQuestionRequest,
  ): Promise<ContestQuestion> {
    return ApiService.put<ContestQuestion, CreateContestQuestionRequest>(
      ENDPOINTS.ADMIN_QUESTION(contestId, questionId),
      question,
    );
  }

  static async deleteQuestion(contestId: string, questionId: string): Promise<void> {
    return ApiService.delete<void>(ENDPOINTS.ADMIN_QUESTION(contestId, questionId));
  }

  static async reorderQuestions(
    contestId: string,
    questionIds: string[],
  ): Promise<ContestQuestion[]> {
    return ApiService.put<ContestQuestion[], { questionIds: string[] }>(
      ENDPOINTS.ADMIN_REORDER(contestId),
      { questionIds },
    );
  }

  // ─── Admin Attempts ──────────────────────────────────────────

  static async getAdminAttempts(
    contestId: string,
    params: AdminContestAttemptsParams,
  ): Promise<AdminContestAttemptsResponse> {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.search) query.append('search', params.search);
    if (params.status) query.append('status', params.status);

    return ApiService.get<AdminContestAttemptsResponse>(
      ENDPOINTS.ADMIN_ATTEMPTS(contestId, query.toString()),
    );
  }

  static async deleteAdminAttempt(contestId: string, attemptId: string): Promise<void> {
    return ApiService.delete<void>(ENDPOINTS.ADMIN_ATTEMPT(contestId, attemptId));
  }
}

export default ContestsService;
