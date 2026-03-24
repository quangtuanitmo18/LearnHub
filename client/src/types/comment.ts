export enum ReactionType {
  LIKE = "LIKE",
  LOVE = "LOVE",
  CARE = "CARE",
  FUN = "FUN",
  WOW = "WOW",
  SAD = "SAD",
  ANGRY = "ANGRY",
}

export enum CommentStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export interface CommentUser {
  id: string;
  username: string;
  email: string;
  avatar?: string | null;
}

export interface IComment {
  id: string;
  content: string;
  lessonId: string;
  userId: string;
  parentId?: string | null; // For nested replies
  level: number; // Nesting level (0 for top-level, 1+ for replies)
  status: CommentStatus; // Comment status (APPROVED, PENDING, REJECTED) - always present in GET responses
  reactions: Record<string, number>; // Object like { "SAD": 1, "LIKE": 2 }
  myReaction: string | null; // Current user's reaction type or null
  user: CommentUser; // User object from backend
  createdAt: string;
  updatedAt: string;
  replyCount: number; // Total number of replies from backend
  replies?: IComment[]; // Initially empty, populated when fetched
}

export interface CreateCommentRequest {
  content: string;
  parentId?: string | null;
}

export interface UpdateCommentRequest {
  content: string;
}

export interface UpdateCommentStatusRequest {
  id: string;
  status: CommentStatus;
}

export interface CommentReactionRequest {
  type: string; // Reaction type like "SAD", "LIKE", etc.
}

// Comments list response matching API structure
export interface CommentsListResponse {
  result: IComment[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// For replies endpoint which returns array directly
export type CommentRepliesResponse = IComment[];

// Helper functions to compute reaction data from reactions object
export function getUserReaction(comment: IComment): ReactionType | null {
  if (!comment.myReaction) return null;
  return comment.myReaction as ReactionType;
}

export function getReactionCounts(
  comment: IComment
): Record<string, number> {
  return comment.reactions || {};
}

export function getReactionCount(
  comment: IComment,
  reactionType: string
): number {
  return comment.reactions?.[reactionType] || 0;
}

export function getTotalReactionCount(comment: IComment): number {
  if (!comment.reactions) return 0;
  return Object.values(comment.reactions).reduce((sum, count) => sum + count, 0);
}

// Comments service filter parameters
export interface CommentsFilterParams {
  page?: number;
  limit?: number;
  status?: string[];
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  [key: string]: unknown;
}
