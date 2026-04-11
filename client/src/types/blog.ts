import { ListResponse, BaseFilterParams } from './common';

export enum BlogStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  PUBLISHED = 'PUBLISHED',
  REJECTED = 'REJECTED',
}

export interface IBlogAuthor {
  id: string;
  email: string;
  name?: string;
  username?: string;
  avatar?: string;
}

export interface IBlogCategory {
  id: string;
  name: string;
  slug: string;
}

export interface IBlogCourse {
  id: string;
  title: string;
  slug: string;
}

export interface IBlog {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  thumbnail: string;
  authorId?: string;
  author: IBlogAuthor;
  status: BlogStatus;
  publishedAt: string | null;
  categoryIds?: string[];
  categoryId?: string;
  category: IBlogCategory;
  courseId?: string;
  course?: IBlogCourse;
  upvotesCount: number;
  viewsCount: number;
  isUpvotedByMe?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type BlogsListResponse = ListResponse<IBlog>;

export interface BlogsFilterParams extends BaseFilterParams {
  status?: BlogStatus | BlogStatus[];
  authorId?: string;
  categoryIds?: string[];
  courseId?: string;
}

// Blog creation request (Admin)
export interface CreateBlogRequest {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  thumbnail?: string;
  status?: BlogStatus;
  publishedAt?: string | null;
  categoryId: string;
  courseId?: string;
}

// Blog update request (Admin)
export interface UpdateBlogRequest extends Partial<CreateBlogRequest> {
  id: string;
}

// Community post creation (Student)
export interface CreateCommunityPostRequest {
  title: string;
  content: string;
  excerpt?: string;
  thumbnail?: string;
  categoryId: string;
  courseId?: string;
  status?: BlogStatus.DRAFT | BlogStatus.PENDING;
}

// Community post update (Student)
export interface UpdateCommunityPostRequest {
  title?: string;
  content?: string;
  excerpt?: string;
  thumbnail?: string;
  categoryId?: string;
  courseId?: string;
  status?: BlogStatus.DRAFT | BlogStatus.PENDING;
}
