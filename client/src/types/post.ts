import { ListResponse, BaseFilterParams } from './common';
import { IMedia } from './media';

export enum PostStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export interface IPostAuthor {
  id: string;
  email: string;
  name?: string;
  username?: string;
  avatar?: string;
}

export interface IPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  thumbnailId: string | null;
  thumbnail: IMedia | null;
  status: PostStatus;
  tags: string[];
  publishedAt: string | null;
  authorId: string;
  author: IPostAuthor;
  createdAt: string;
  updatedAt: string;
}

export type PostsListResponse = ListResponse<IPost>;

export interface PostsFilterParams extends BaseFilterParams {
  status?: PostStatus | PostStatus[];
  authorId?: string;
  tags?: string[];
}

// Post creation request
export interface CreatePostRequest {
  title: string;
  slug: string;
  content: string;
  thumbnailId?: string | null;
  status?: PostStatus;
  tags?: string[];
  publishedAt?: string | null;
}

// Post update request
export interface UpdatePostRequest extends Partial<CreatePostRequest> {
  id: string;
}
