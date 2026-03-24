"use client";

import { CommentsService } from "@/services/comments";
import type {
  CommentsFilterParams,
  CommentsListResponse,
  CreateCommentRequest,
  IComment,
  UpdateCommentRequest,
  UpdateCommentStatusRequest
} from "@/types/comment";
import { CommentStatus } from "@/types/comment";
import {
  InfiniteData,
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { cloneDeep } from "lodash";
import { useState } from "react";
import { toast } from "sonner";

// Query keys for comments
export const commentKeys = {
  all: ["comments"] as const,
  lists: () => [...commentKeys.all, "list"] as const,
  list: (filters: CommentsFilterParams) =>
    [...commentKeys.lists(), { filters }] as const,
  details: () => [...commentKeys.all, "detail"] as const,
  detail: (id: string) => [...commentKeys.details(), id] as const,
  lessonComments: (lessonId: string) =>
    [...commentKeys.all, "lesson", lessonId] as const,
  replies: (parentId: string) =>
    [...commentKeys.all, "replies", parentId] as const,
};

// Hook to get all comments with optional filtering
export function useAllComments(params?: CommentsFilterParams) {
  return useQuery({
    queryKey: commentKeys.list(params || {}),
    queryFn: () => CommentsService.getAllComments(params),
    placeholderData: keepPreviousData,
  });
}

// Hook to get comments for a lesson
export function useComments(
  lessonId: string,
  params?: Omit<CommentsFilterParams, "lessonId">
) {
  return useQuery({
    queryKey: commentKeys.lessonComments(lessonId),
    queryFn: () => CommentsService.getComments(lessonId, params),
    enabled: !!lessonId,
  });
}

// Hook to get infinite scroll comments
export function useInfiniteComments(lessonId: string) {
  return useInfiniteQuery({
    queryKey: [...commentKeys.lessonComments(lessonId), "infinite"],
    queryFn: ({ pageParam = 1 }) =>
      CommentsService.getComments(lessonId, { page: pageParam }),
    enabled: !!lessonId,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { meta } = lastPage;
      return meta.hasNextPage ? meta.page + 1 : undefined;
    },
  });
}

// Hook to get a single comment
export function useComment(id: string) {
  return useQuery({
    queryKey: commentKeys.detail(id),
    queryFn: () => CommentsService.getComment(id),
    enabled: !!id,

  });
}

// Hook to create a comment
export function useCreateComment() {
  const queryClient = useQueryClient();

  // Helper function to recursively add reply to nested structure
  const addReplyToComments = (
    comments: IComment[],
    parentId: string,
    newReply: IComment
  ): IComment[] => {
    return comments.map((comment) => {
      if (comment.id === parentId) {
        // Found the parent - add the new reply at the beginning
        return {
          ...comment,
          replies: [newReply, ...(comment.replies || [])],
          replyCount: (comment.replyCount || 0) + 1,
        };
      } else if (comment.replies && comment.replies.length > 0) {
        // Search in nested replies recursively
        const updatedReplies = addReplyToComments(
          comment.replies,
          parentId,
          newReply
        );
        // Only update if something changed
        if (updatedReplies !== comment.replies) {
          return {
            ...comment,
            replies: updatedReplies,
          };
        }
      }
      return comment;
    });
  };

  return useMutation({
    mutationFn: ({
      lessonId,
      commentData,
    }: {
      lessonId: string;
      commentData: CreateCommentRequest;
    }) => CommentsService.createComment(lessonId, commentData),
    onSuccess: (newComment, variables) => {
      if (newComment) {
        const infiniteQueryKey = [
          ...commentKeys.lessonComments(variables.lessonId),
          "infinite",
        ];

        if (!newComment.parentId) {
          // Handle top-level comments
          queryClient.setQueryData(
            infiniteQueryKey,
            (old: InfiniteData<CommentsListResponse, unknown>) => {
              if (!old?.pages?.[0]) return old;

              // Add new comment to the first page
              const firstPage = old.pages[0];
              const updatedFirstPage = {
                ...firstPage,
                result: [newComment, ...firstPage.result],
                meta: {
                  ...firstPage.meta,
                  totalItems: firstPage.meta.totalItems + 1,
                },
              };

              return {
                ...old,
                pages: [updatedFirstPage, ...old.pages.slice(1)],
              };
            }
          );
        } else {
          // Handle reply comments using lodash for deep update
          queryClient.setQueryData(
            infiniteQueryKey,
            (old: InfiniteData<CommentsListResponse, unknown>) => {
              if (!old?.pages) return old;

              // Clone the data structure to avoid mutations
              const newData = cloneDeep(old);

              // Update each page that might contain the parent comment
              newData.pages = newData.pages.map((page) => ({
                ...page,
                result: addReplyToComments(
                  page.result,
                  newComment.parentId!,
                  newComment
                ),
              }));

              return newData;
            }
          );
        }
      }

      toast.success("Comment has been added!");
    },
    onError: (error: Error) => {
      toast.error(
        error?.message || "Failed to add comment. Please try again."
      );
    },
  });
}

// Hook to update a comment (similar to comment reactions - direct cache update)
export function useUpdateComment(lessonId?: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCommentRequest }) =>
      CommentsService.updateComment(id, data),
    onSuccess: (updatedComment) => {
      // Update the comment in cache - only merge updated data, preserve everything else
      if (!lessonId) return;

      // Helper function to recursively find and update specific comment
      const updateCommentInArray = (comments: IComment[]): IComment[] => {
        return comments.map((comment) => {
          if (comment.id === updatedComment.id) {
            // Only update the fields that changed, preserve all other data (replies, reactions, etc.)
            return {
              ...comment,
              content: updatedComment.content,
              updatedAt: updatedComment.updatedAt,
              // Add any other updated fields from API response
            };
          }
          // Recursively search in replies
          if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: updateCommentInArray(comment.replies),
            };
          }
          return comment;
        });
      };

      // Update infinite query cache (primary cache used by lesson-comment-drawer)
      const infiniteQueryKey = [
        ...commentKeys.lessonComments(lessonId),
        "infinite",
      ];
      queryClient.setQueryData(
        infiniteQueryKey,
        (
          oldData: InfiniteData<CommentsListResponse, unknown> | undefined
        ) => {
          if (!oldData?.pages) return oldData;

          const newData = cloneDeep(oldData);
          newData.pages = newData.pages.map((page) => ({
            ...page,
            result: updateCommentInArray(page.result || []),
          }));

          return newData;
        }
      );

      toast.success("Comment updated successfully!");
    },
    onError: () => {
      toast.error("Failed to update comment. Please try again.");
    },
  });

  return {
    updateComment: mutation.mutateAsync,
    ...mutation,
  };
}

// Hook to delete a comment (similar to comment reactions - direct cache update)
export function useDeleteComment(lessonId?: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => CommentsService.deleteComment(id),
    onSuccess: (_, commentId) => {
      // Update the comment in cache - remove the deleted comment, preserve everything else
      if (!lessonId) return;

      // Helper function to recursively find and remove specific comment
      const removeCommentFromArray = (comments: IComment[]): IComment[] => {
        return comments
          .filter((comment) => comment.id !== commentId) // Remove the deleted comment
          .map((comment) => {
            // Also remove from replies if nested
            if (comment.replies && comment.replies.length > 0) {
              return {
                ...comment,
                replies: removeCommentFromArray(comment.replies),
                // Update reply count if needed
                replyCount: Math.max(
                  0,
                  comment.replyCount -
                    (comment.replies.some((r) => r.id === commentId) ? 1 : 0)
                ),
              };
            }
            return comment;
          });
      };

      // Update infinite query cache (primary cache used by lesson-comment-drawer)
      const infiniteQueryKey = [
        ...commentKeys.lessonComments(lessonId),
        "infinite",
      ];
      queryClient.setQueryData(
        infiniteQueryKey,
        (
          oldData: InfiniteData<CommentsListResponse, unknown> | undefined
        ) => {
          if (!oldData?.pages) return oldData;

          const newData = cloneDeep(oldData);
          newData.pages = newData.pages.map((page) => ({
            ...page,
            result: removeCommentFromArray(page.result || []),
            meta: {
              ...page.meta,
              totalItems: Math.max(0, page.meta.totalItems - 1), // Decrease total count
            },
          }));

          return newData;
        }
      );

      toast.success("Comment deleted successfully!");
    },
    onError: () => {
      toast.error("Failed to delete comment. Please try again.");
    },
  });

  return {
    deleteComment: mutation.mutateAsync,
    ...mutation,
  };
}

// Hook to delete a comment (legacy version for admin use)
export function useDeleteCommentAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => CommentsService.deleteComment(id),
    onSuccess: (_, commentId) => {
      // Remove from cache and invalidate related queries (admin behavior)
      queryClient.removeQueries({
        queryKey: commentKeys.detail(commentId),
      });

      // Invalidate all comment lists to update counts
      queryClient.invalidateQueries({
        queryKey: commentKeys.all,
      });

      toast.success("Comment deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(
        error?.message || "Failed to delete comment. Please try again."
      );
    },
  });
}

// Hook to bulk delete comments (admin only)
export function useBulkDeleteComments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentIds: string[]) =>
      CommentsService.bulkDeleteComments(commentIds),
    onSuccess: () => {
      // Invalidate all comment queries
      queryClient.invalidateQueries({
        queryKey: commentKeys.all,
      });
      toast.success("Comments deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(
        error?.message || "Failed to delete comment. Please try again."
      );
    },
  });
}

// Hook to load replies for a comment
export function useLoadReplies(lessonId: string) {
  const queryClient = useQueryClient();
  const [loadingReplies, setLoadingReplies] = useState<Record<string, boolean>>(
    {}
  );

  const loadReplies = async (commentId: string, comments: IComment[]) => {
    if (loadingReplies[commentId]) return;

    // Helper function to find comment recursively
    const findCommentRecursively = (
      comments: IComment[],
      targetId: string
    ): IComment | null => {
      for (const comment of comments) {
        if (comment.id === targetId) return comment;
        if (comment.replies && comment.replies.length > 0) {
          const found = findCommentRecursively(comment.replies, targetId);
          if (found) return found;
        }
      }
      return null;
    };

    const targetComment = findCommentRecursively(comments, commentId);

    // If replies are already loaded, no need to fetch
    if (targetComment?.replies && targetComment.replies.length > 0) {
      return true; // Indicate success without fetching
    }

    setLoadingReplies((prev) => ({
      ...prev,
      [commentId]: true,
    }));

    try {
      // Fetch replies from API
      const repliesData = await CommentsService.getReplies(commentId);

      // Update React Query cache with the fetched replies
      const infiniteQueryKey = [
        ...commentKeys.lessonComments(lessonId),
        "infinite",
      ];

      queryClient.setQueryData(
        infiniteQueryKey,
        (old: InfiniteData<CommentsListResponse, unknown>) => {
          if (!old?.pages) return old;

          // Helper function to recursively add replies to the correct parent
          const addRepliesToComment = (
            comments: IComment[],
            parentId: string,
            replies: IComment[]
          ): IComment[] => {
            return comments.map((comment) => {
              if (comment.id === parentId) {
                return {
                  ...comment,
                  replies: replies,
                };
              } else if (comment.replies && comment.replies.length > 0) {
                return {
                  ...comment,
                  replies: addRepliesToComment(
                    comment.replies,
                    parentId,
                    replies
                  ),
                };
              }
              return comment;
            });
          };

          // Update each page that might contain the parent comment
          const newData = cloneDeep(old);
          newData.pages = newData.pages.map(
            (page: CommentsListResponse) => ({
              ...page,
              result: addRepliesToComment(
                page.result,
                commentId,
                repliesData
              ),
            })
          );

          return newData;
        }
      );

      return true; // Indicate success
    } catch {
      toast.error("Unable to load replies. Please try again.");
      return false; // Indicate failure
    } finally {
      setLoadingReplies((prev) => ({
        ...prev,
        [commentId]: false,
      }));
    }
  };

  return {
    loadReplies,
    loadingReplies,
  };
}

// Hook to handle comment reactions
interface UseCommentReactionsParams {
  lessonId?: string;
}

export function useCommentReactions({
  lessonId,
}: UseCommentReactionsParams = {}) {
  const queryClient = useQueryClient();

  const reactionMutation = useMutation({
    mutationFn: async ({
      commentId,
      reactionType,
    }: {
      commentId: string;
      reactionType: string;
    }) => {
      return CommentsService.reactToComment(commentId, reactionType);
    },
    onSuccess: (updatedComment) => {
      // Update the comment in cache - only merge reaction data, preserve everything else

      if (!lessonId) return;

      // Helper function to recursively find and update specific comment
      const updateCommentReactions = (comments: IComment[]): IComment[] => {
        return comments.map((comment) => {
          if (comment.id === updatedComment.id) {
            // Only update reactions object and myReaction, preserve all other data
            return {
              ...comment,
              reactions: updatedComment.reactions,
              myReaction: updatedComment.myReaction,
            };
          }
          // Recursively search in replies
          if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: updateCommentReactions(comment.replies),
            };
          }
          return comment;
        });
      };

      // Update infinite query cache (primary cache used by lesson-comment-drawer)
      const infiniteQueryKey = [
        ...commentKeys.lessonComments(lessonId),
        "infinite",
      ];
      queryClient.setQueryData(
        infiniteQueryKey,
        (
          oldData: InfiniteData<CommentsListResponse, unknown> | undefined
        ) => {
          if (!oldData?.pages) return oldData;

          const newData = cloneDeep(oldData);

          newData.pages = newData.pages.map((page) => ({
            ...page,
            result: updateCommentReactions(page.result || []),
          }));

          return newData;
        }
      );

      toast.success("Reaction updated successfully!");
    },
    onError: () => {
      toast.error("Failed to toggle reaction. Please try again.");
    },
  });

  const toggleReaction = (
    commentId: string,
    reactionType: string,
    currentUserId?: string
  ) => {
    if (!currentUserId) {
      toast.error("Please login to react to comments");
      return;
    }

    reactionMutation.mutate({
      commentId,
      reactionType,
    });
  };

  return {
    toggleReaction,
    isLoading: reactionMutation.isPending,
    isError: reactionMutation.isError,
    error: reactionMutation.error,
  };
}

/**
 * Hook to update comment status (approve/reject/pending)
 */
export function useUpdateCommentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateCommentStatusRequest) =>
      CommentsService.updateCommentStatus(data),
    onSuccess: (updatedComment, variables) => {
      // Invalidate all comments queries to refresh the lists
      queryClient.invalidateQueries({
        queryKey: commentKeys.all,
      });

      // If we know the lessonId, invalidate specific lesson comments
      if (updatedComment.lessonId) {
        queryClient.invalidateQueries({
          queryKey: commentKeys.lessonComments(updatedComment.lessonId),
        });
      }

      // Show success toast based on status
      const statusMessages: Record<CommentStatus, string> = {
        [CommentStatus.APPROVED]: "Comment approved successfully",
        [CommentStatus.REJECTED]: "Comment rejected successfully",
        [CommentStatus.PENDING]: "Comment moved to pending",
      };

      toast.success(
        statusMessages[variables.status] || "Comment status updated successfully"
      );
    },
    onError: () => {
      toast.error("Failed to update comment status");
    },
  });
}
