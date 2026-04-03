import { ApiService } from '@/lib/api-service';
import type {
  IReview,
  CreateReviewRequest,
  UpdateReviewRequest,
  ReviewsFilterParams,
  CourseReviewsResponse,
  CourseReviewStats,
  AdminReviewsFilterParams,
  AdminReviewsListResponse,
} from '@/types/review';

const ENDPOINTS = {
  REVIEWS: '/reviews',
  COURSE_REVIEWS: (courseId: string) => `/reviews/course/${courseId}`,
  COURSE_REVIEW_STATS: (courseId: string) => `/reviews/course/${courseId}/stats`,
  SUBMIT_REVIEW: '/reviews',
} as const;

export class ReviewsService {
  // Submit review
  static async submitReview(data: CreateReviewRequest): Promise<IReview> {
    return ApiService.post<IReview, CreateReviewRequest>(ENDPOINTS.SUBMIT_REVIEW, data);
  }

  // Get course reviews
  static async getCourseReviews(
    courseId: string,
    params?: Pick<ReviewsFilterParams, 'page' | 'limit' | 'minStar'>,
  ): Promise<CourseReviewsResponse> {
    return ApiService.get<CourseReviewsResponse>(
      ENDPOINTS.COURSE_REVIEWS(courseId),
      params as Record<string, unknown>,
    );
  }

  // Get course review statistics
  static async getCourseReviewStats(courseId: string): Promise<CourseReviewStats> {
    return ApiService.get<CourseReviewStats>(ENDPOINTS.COURSE_REVIEW_STATS(courseId));
  }

  // Update review
  static async updateReview(reviewData: UpdateReviewRequest): Promise<IReview> {
    const { id, ...updateData } = reviewData;
    return ApiService.put<IReview, Partial<CreateReviewRequest>>(
      `${ENDPOINTS.REVIEWS}/${id}`,
      updateData,
    );
  }

  // Delete review
  static async deleteReview(reviewId: string): Promise<void> {
    return ApiService.delete<void>(`${ENDPOINTS.REVIEWS}/${reviewId}`);
  }

  // Toggle review like
  static async toggleReviewLike(reviewId: string): Promise<{ liked: boolean; likesCount: number }> {
    return ApiService.post<{ liked: boolean; likesCount: number }>(
      `${ENDPOINTS.REVIEWS}/${reviewId}/like`,
    );
  }

  // ===== ADMIN-SPECIFIC METHODS =====

  // Get admin reviews list
  static async getAdminReviews(
    params: AdminReviewsFilterParams,
  ): Promise<AdminReviewsListResponse> {
    try {
      return await ApiService.get<AdminReviewsListResponse>(
        ENDPOINTS.REVIEWS,
        params as Record<string, unknown>,
      );
    } catch {
      return {
        result: [],
        meta: {
          page: 1,
          limit: 10,
          totalItems: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
    }
  }

  // Update review status
  static async updateReviewStatus(reviewId: string, status: string): Promise<IReview> {
    return ApiService.put<IReview, { status: string }>(`${ENDPOINTS.REVIEWS}/${reviewId}/status`, {
      status,
    });
  }

  // Delete admin review
  static async deleteAdminReview(reviewId: string): Promise<void> {
    return ApiService.delete<void>(`${ENDPOINTS.REVIEWS}/${reviewId}`);
  }

  // Bulk delete admin reviews
  static async bulkDeleteAdminReviews(reviewIds: string[]): Promise<void> {
    return ApiService.delete<void, { reviewIds: string[] }>(`${ENDPOINTS.REVIEWS}/bulk`, {
      reviewIds,
    });
  }
}

export default ReviewsService;
