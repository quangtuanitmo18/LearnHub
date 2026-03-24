import { ListResponse, BaseFilterParams } from "./common";

export enum BlogStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
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
  createdAt: string;
  updatedAt: string;
}

export type BlogsListResponse = ListResponse<IBlog>;

export interface BlogsFilterParams extends BaseFilterParams {
  status?: BlogStatus | BlogStatus[];
  authorId?: string;
  categoryIds?: string[];
}

// Blog creation request
export interface CreateBlogRequest {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  thumbnail?: string;
  status?: BlogStatus;
  publishedAt?: string | null;
  categoryId: string;
}

// Blog update request
export interface UpdateBlogRequest extends Partial<CreateBlogRequest> {
  id: string;
}
