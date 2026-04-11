import { ApiService } from '@/lib/api-service';
import {
  BlogsFilterParams,
  BlogsListResponse,
  CreateBlogRequest,
  CreateCommunityPostRequest,
  UpdateCommunityPostRequest,
  IBlog,
  UpdateBlogRequest,
} from '@/types/blog';
import { BaseFilterParams } from '@/types/common';

const ENDPOINTS = {
  BLOGS: '/blogs',
  BLOGS_PUBLISH: '/blogs/published',
  BLOGS_ALL: '/blogs/all',
  BLOGS_ME: '/blogs/me',
  BLOGS_COMMUNITY: '/blogs/community',
  BLOG: (id: string) => `/blogs/${id}`,
  BLOG_BY_SLUG: (slug: string) => `/blogs/slug/${slug}`,
  BLOG_UPVOTE: (id: string) => `/blogs/${id}/upvote`,
  BLOG_STATUS: (id: string) => `/blogs/${id}/status`,
  BLOGS_BY_COURSE: (courseId: string) => `/blogs/course/${courseId}`,
} as const;

export class BlogsService {
  // Get blogs with pagination (Admin)
  static async getBlogs(params?: BlogsFilterParams): Promise<BlogsListResponse> {
    try {
      return await ApiService.get<BlogsListResponse>(
        ENDPOINTS.BLOGS,
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

  // Get published blogs with pagination (Public)
  static async getPublishedBlogs(
    params?: Omit<BlogsFilterParams, 'status'>,
  ): Promise<BlogsListResponse> {
    try {
      return await ApiService.get<BlogsListResponse>(
        ENDPOINTS.BLOGS_PUBLISH,
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

  // Get all blogs (Admin dropdown)
  static async getAllBlogs(): Promise<IBlog[]> {
    try {
      const response = await ApiService.get<{ blogs: IBlog[] }>(ENDPOINTS.BLOGS_ALL);
      return response.blogs || [];
    } catch {
      return [];
    }
  }

  // Get blog by ID (Admin)
  static async getBlog(id: string): Promise<IBlog> {
    return ApiService.get<IBlog>(ENDPOINTS.BLOG(id));
  }

  // Get blog by slug (Public)
  static async getBlogBySlug(slug: string): Promise<IBlog> {
    return await ApiService.get<IBlog>(ENDPOINTS.BLOG_BY_SLUG(slug));
  }

  // Create blog (Admin)
  static async createBlog(blogData: CreateBlogRequest): Promise<IBlog> {
    return ApiService.post<IBlog, CreateBlogRequest>(ENDPOINTS.BLOGS, blogData);
  }

  // Update blog (Admin)
  static async updateBlog(blogData: UpdateBlogRequest): Promise<IBlog> {
    const { id, ...updateData } = blogData;
    return ApiService.put<IBlog, Omit<UpdateBlogRequest, 'id'>>(ENDPOINTS.BLOG(id), updateData);
  }

  // Delete blog (Admin)
  static async deleteBlog(id: string): Promise<void> {
    return ApiService.delete<void>(ENDPOINTS.BLOG(id));
  }

  // Bulk delete (Admin)
  static async bulkDeleteBlogs(blogIds: string[]): Promise<void> {
    return ApiService.delete<void, { ids: string[] }>(`${ENDPOINTS.BLOGS}/bulk-delete`, {
      ids: blogIds,
    });
  }

  // ==========================================
  // COMMUNITY ENDPOINTS
  // ==========================================

  // Get current user's posts (My Posts tab)
  static async getMyPosts(params?: BaseFilterParams): Promise<BlogsListResponse> {
    try {
      return await ApiService.get<BlogsListResponse>(
        ENDPOINTS.BLOGS_ME,
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

  // Create community post (Student)
  static async createCommunityPost(data: CreateCommunityPostRequest): Promise<IBlog> {
    return ApiService.post<IBlog, CreateCommunityPostRequest>(ENDPOINTS.BLOGS_COMMUNITY, data);
  }

  // Update community post (Student - own post only)
  static async updateCommunityPost(id: string, data: UpdateCommunityPostRequest): Promise<IBlog> {
    return ApiService.put<IBlog, UpdateCommunityPostRequest>(
      `${ENDPOINTS.BLOGS_COMMUNITY}/${id}`,
      data,
    );
  }

  // Delete community post (Student - own draft/pending only)
  static async deleteCommunityPost(id: string): Promise<void> {
    return ApiService.delete<void>(`${ENDPOINTS.BLOGS_COMMUNITY}/${id}`);
  }

  // Update blog status (Admin)
  static async updateBlogStatus(
    id: string,
    status: 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'REJECTED',
  ): Promise<IBlog> {
    return ApiService.put<IBlog, { status: string }>(ENDPOINTS.BLOG_STATUS(id), { status });
  }

  // Toggle upvote on a blog
  static async toggleUpvote(
    blogId: string,
  ): Promise<{ action: 'added' | 'removed'; upvotesCount: number }> {
    return ApiService.post<{ action: 'added' | 'removed'; upvotesCount: number }>(
      ENDPOINTS.BLOG_UPVOTE(blogId),
    );
  }

  // Get upvote status
  static async getUpvoteStatus(blogId: string): Promise<{ hasUpvoted: boolean }> {
    return ApiService.get<{ hasUpvoted: boolean }>(`${ENDPOINTS.BLOG(blogId)}/upvote-status`);
  }

  // Get community blogs for a specific course
  static async getCommunityBlogsByCourse(
    courseId: string,
    params?: BaseFilterParams,
  ): Promise<BlogsListResponse> {
    try {
      return await ApiService.get<BlogsListResponse>(
        ENDPOINTS.BLOGS_BY_COURSE(courseId),
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
}

export default BlogsService;
