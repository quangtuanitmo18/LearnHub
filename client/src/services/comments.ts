import { ApiService } from '@/lib/api-service';
import type {
  IComment,
  CreateCommentRequest,
  UpdateCommentRequest,
  UpdateCommentStatusRequest,
  CommentReactionRequest,
  CommentsListResponse,
  CommentRepliesResponse,
  CommentsFilterParams,
} from '@/types/comment';

const ENDPOINTS = {
  COMMENTS: '/comments',
  COMMENT: (id: string) => `/comments/${id}`,
  LESSON_COMMENTS: (lessonId: string) => `/lessons/${lessonId}/comments`,
  COMMENT_REPLIES: (commentId: string) => `/comments/${commentId}/replies`,
  COMMENT_REACT: (id: string) => `/comments/${id}/react`,
  COMMENT_STATUS: (id: string) => `/comments/${id}/status`,
} as const;

export class CommentsService {
  // Get all comments (admin)
  static async getAllComments(params?: CommentsFilterParams): Promise<CommentsListResponse> {
    try {
      return await ApiService.get<CommentsListResponse>(
        ENDPOINTS.COMMENTS,
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

  // Get lesson comments
  static async getComments(
    lessonId: string,
    params?: Omit<CommentsFilterParams, 'lessonId'>,
  ): Promise<CommentsListResponse> {
    try {
      return await ApiService.get<CommentsListResponse>(
        ENDPOINTS.LESSON_COMMENTS(lessonId),
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

  // Get comment by ID
  static async getComment(id: string): Promise<IComment> {
    return ApiService.get<IComment>(ENDPOINTS.COMMENT(id));
  }

  // Create comment
  static async createComment(
    lessonId: string,
    commentData: CreateCommentRequest,
  ): Promise<IComment> {
    return ApiService.post<IComment, CreateCommentRequest>(
      ENDPOINTS.LESSON_COMMENTS(lessonId),
      commentData,
    );
  }

  // Update comment
  static async updateComment(id: string, commentData: UpdateCommentRequest): Promise<IComment> {
    return ApiService.put<IComment, UpdateCommentRequest>(ENDPOINTS.COMMENT(id), commentData);
  }

  // Delete comment
  static async deleteComment(id: string): Promise<void> {
    return ApiService.delete<void>(ENDPOINTS.COMMENT(id));
  }

  // Update comment status (admin only)
  static async updateCommentStatus(data: UpdateCommentStatusRequest): Promise<IComment> {
    return ApiService.put<IComment, { status: string }>(ENDPOINTS.COMMENT_STATUS(data.id), {
      status: data.status,
    });
  }

  // Add/Update reaction (toggle)
  static async reactToComment(id: string, reactionType: string): Promise<IComment> {
    return ApiService.post<IComment, CommentReactionRequest>(ENDPOINTS.COMMENT_REACT(id), {
      type: reactionType,
    });
  }

  // Get replies
  static async getReplies(commentId: string): Promise<CommentRepliesResponse> {
    try {
      return await ApiService.get<CommentRepliesResponse>(ENDPOINTS.COMMENT_REPLIES(commentId));
    } catch {
      return [];
    }
  }

  // Check if comment can have replies
  static canAddReply(level: number): boolean {
    return level < 5;
  }

  // Calculate next level for reply
  static getNextLevel(parentLevel: number): number {
    return Math.min(parentLevel + 1, 5);
  }

  // Bulk delete comments
  static async bulkDeleteComments(commentIds: string[]): Promise<void> {
    return ApiService.delete<void, { ids: string[] }>(`${ENDPOINTS.COMMENTS}/bulk-delete`, {
      ids: commentIds,
    });
  }

  // Report comment
  static async reportComment(id: string, reason: string): Promise<{ success: boolean }> {
    return ApiService.post<{ success: boolean }, { reason: string }>(
      `${ENDPOINTS.COMMENT(id)}/report`,
      { reason },
    );
  }
}

export default CommentsService;
