import { ApiService } from '@/lib/api-service';
import {
  IPost,
  CreatePostRequest,
  UpdatePostRequest,
  PostsListResponse,
  PostsFilterParams,
} from '@/types/post';

const ENDPOINTS = {
  POSTS: '/blogs',
  POSTS_PUBLISH: '/blogs/published',
  POSTS_ALL: '/blogs/all',
  POST: (id: string) => `/blogs/${id}`,
  POST_BY_SLUG: (slug: string) => `/blogs/slug/${slug}`,
  BULK_DELETE: '/blogs/bulk-delete',
} as const;

export class PostsService {
  // Get posts with pagination
  static async getPosts(params?: PostsFilterParams): Promise<PostsListResponse> {
    try {
      return await ApiService.get<PostsListResponse>(
        ENDPOINTS.POSTS,
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

  // Get published posts with pagination
  static async getPublishedPosts(
    params?: Omit<PostsFilterParams, 'status'>,
  ): Promise<PostsListResponse> {
    try {
      return await ApiService.get<PostsListResponse>(
        ENDPOINTS.POSTS_PUBLISH,
        params as Record<string, unknown>,
      );
    } catch {
      return {
        result: [],
        meta: {
          page: (params?.page as number) || 1,
          limit: (params?.limit as number) || 10,
          totalItems: 0,
          totalPages: 0,
        },
      };
    }
  }

  // Get all posts
  static async getAllPosts(): Promise<IPost[]> {
    try {
      return await ApiService.get<IPost[]>(ENDPOINTS.POSTS_ALL);
    } catch {
      return [];
    }
  }

  // Get post by ID
  static async getPost(id: string): Promise<IPost> {
    return ApiService.get<IPost>(ENDPOINTS.POST(id));
  }

  // Get post by slug
  static async getPostBySlug(slug: string): Promise<IPost> {
    return ApiService.get<IPost>(ENDPOINTS.POST_BY_SLUG(slug));
  }

  // Create post
  static async createPost(postData: CreatePostRequest): Promise<IPost> {
    return ApiService.post<IPost, CreatePostRequest>(ENDPOINTS.POSTS, postData);
  }

  // Update post
  static async updatePost(postData: UpdatePostRequest): Promise<IPost> {
    const { id, ...updateData } = postData;
    return ApiService.put<IPost, Omit<UpdatePostRequest, 'id'>>(ENDPOINTS.POST(id), updateData);
  }

  // Delete post
  static async deletePost(id: string): Promise<void> {
    return ApiService.delete<void>(ENDPOINTS.POST(id));
  }

  // Bulk operations
  static async bulkDeletePosts(postIds: string[]): Promise<void> {
    return ApiService.delete<void, { ids: string[] }>(ENDPOINTS.BULK_DELETE, {
      ids: postIds,
    });
  }
}

export default PostsService;
