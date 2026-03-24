// Review types
import { BaseFilterParams, ListResponse } from "./common";

// Review user interface
export interface ReviewUser {
  id: string;
  username: string;
  email: string;
  avatar?: string;
}

// Review course interface
export interface ReviewCourse {
  id: string;
  title: string;
  slug: string;
  image?: {
    url?: string;
    key?: string;
  };
}

// Main review interface
export interface IReview {
  id: string;
  courseId: string;
  userId: string;
  star: number;
  content: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
  user: ReviewUser;
  course?: ReviewCourse;
}

// Review request types
export interface CreateReviewRequest {
  courseId: string;
  star: number;
  content: string;
}

export interface UpdateReviewRequest {
  id: string;
  courseId: string;
  star?: number;
  content?: string;
}

// Review status enum
export enum ReviewStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

// Review filter parameters
export interface ReviewsFilterParams {
  page?: number;
  limit?: number;
  minStar?: number;
  status?: string;
  sortBy?: "newest" | "oldest" | "rating";
  sortOrder?: "asc" | "desc";
  [key: string]: unknown;
}

// Admin reviews filter parameters (supports array filters)
export interface AdminReviewsFilterParams extends BaseFilterParams {
  status?: string[];
  minStar?: number;
}

// Review response interfaces
export interface CourseReviewsResponse {
  reviews: IReview[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  averageRating: number;
  ratingDistribution: {
    [key: string]: number;
  };
}

export type ReviewsListResponse = ListResponse<IReview>;

// Review stats response interface
export interface CourseReviewStats {
  total: number;
  averageRating: number;
  ratingDistribution: {
    [key: string]: number;
  };
}

// Keep ReviewResponse as alias for backward compatibility
export type ReviewResponse = IReview;

// Reviews list response (for admin use cases)
export type AdminReviewsListResponse = ReviewsListResponse;
