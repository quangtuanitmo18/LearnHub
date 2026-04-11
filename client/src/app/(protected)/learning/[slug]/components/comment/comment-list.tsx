'use client';

import { Button } from '@/components/ui/button';
import { MessageCircle, Loader2 } from 'lucide-react';
import CommentItem from './comment-item';

import { Editor as TipTapEditor } from '@tiptap/react';
import { IComment } from '@/types/comment';

interface CommentListProps {
  comments: IComment[];
  isLoading: boolean;
  error: Error | null;
  replyingTo: string | null;
  replyingToSpecific: string | null;
  replyContent: string;
  isPending: boolean;
  showReplies: Record<string, boolean>;
  loadingReplies: Record<string, boolean>;
  lessonId?: string; // Add lessonId for cache invalidation
  blogId?: string; // Add blogId for cache invalidation
  onReply: (commentId: string, userName: string) => void;
  onToggleReplies: (commentId: string) => void;
  onLoadReplies: (commentId: string) => void;
  onReplyContentChange: (content: string) => void;
  onReplyEditorReady: (editor: TipTapEditor) => void;
  onReplySubmit: (commentId: string) => void;
  onReplyCancel: () => void;
  onRefetch: () => void;
}

// Comment list component - Arrow function
const CommentList = ({
  comments,
  isLoading,
  error,
  replyingTo,
  replyingToSpecific,
  replyContent,
  isPending,
  showReplies,
  loadingReplies,
  lessonId,
  onReply,
  onToggleReplies,
  onLoadReplies,
  onReplyContentChange,
  onReplyEditorReady,
  onReplySubmit,
  onReplyCancel,
  onRefetch,
  blogId,
}: CommentListProps) => {
  // Error State
  if (error) {
    return (
      <div className="px-4 py-8 text-center text-red-500 sm:py-12">
        <MessageCircle className="mx-auto mb-3 h-10 w-10 opacity-50 sm:mb-4 sm:h-12 sm:w-12" />
        <p className="text-xs sm:text-sm">Failed to load comments</p>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefetch}
          className="mt-2 h-8 text-xs sm:h-9 sm:text-sm"
        >
          Try again
        </Button>
      </div>
    );
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="px-4 py-8 text-center text-gray-500 sm:py-12">
        <Loader2 className="mx-auto mb-3 h-10 w-10 animate-spin opacity-50 sm:mb-4 sm:h-12 sm:w-12" />
        <p className="text-xs sm:text-sm">Loading comments...</p>
      </div>
    );
  }

  // Empty State
  if (comments.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-gray-500 sm:py-12">
        <MessageCircle className="mx-auto mb-3 h-10 w-10 opacity-50 sm:mb-4 sm:h-12 sm:w-12" />
        <p className="text-xs sm:text-sm">No comments yet</p>
        <p className="mt-1 text-[10px] sm:text-xs">Be the first to comment!</p>
      </div>
    );
  }

  // Comments List
  return (
    <div className="space-y-3 sm:space-y-4">
      {comments.map((comment: IComment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          isReplying={replyingTo === comment.id}
          replyContent={replyContent}
          isPending={isPending}
          showReplies={showReplies[comment.id] || false}
          loadingReplies={loadingReplies[comment.id] || false}
          lessonId={lessonId}
          onReply={onReply}
          onToggleReplies={() => onToggleReplies(comment.id)}
          onLoadReplies={() => onLoadReplies(comment.id)}
          onReplyContentChange={onReplyContentChange}
          onReplyEditorReady={onReplyEditorReady}
          onReplySubmit={() => onReplySubmit(comment.id)}
          onReplyCancel={onReplyCancel}
          replyingToSpecific={replyingToSpecific}
          showRepliesState={showReplies}
          loadingRepliesState={loadingReplies}
          onToggleRepliesWithId={onToggleReplies}
          onLoadRepliesWithId={onLoadReplies}
          blogId={blogId}
          level={1}
        />
      ))}
    </div>
  );
};

export default CommentList;
