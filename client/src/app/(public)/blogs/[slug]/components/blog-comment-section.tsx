'use client';

import { useState, useCallback } from 'react';
import { Editor as TipTapEditor } from '@tiptap/react';
import {
  useInfiniteBlogComments,
  useCreateBlogComment,
  useLoadReplies,
} from '@/hooks/use-comments';
import { IComment } from '@/types/comment';
import { CommentsService } from '@/services/comments';
import { toast } from 'sonner';
import { useUser } from '@/stores/auth-store';
import { Loader2 } from 'lucide-react';
import CommentEditor from '@/app/(protected)/learning/[slug]/components/comment/comment-editor';
import CommentList from '@/app/(protected)/learning/[slug]/components/comment/comment-list';
import { Button } from '@/components/ui/button';

interface BlogCommentSectionProps {
  blogId: string;
}

// Blog comment section component - Arrow function
const BlogCommentSection = ({ blogId }: BlogCommentSectionProps) => {
  // Get current user from auth store
  const currentUser = useUser();

  // React Query hooks
  const {
    data: commentsData,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteBlogComments(blogId);

  const createCommentMutation = useCreateBlogComment();
  const { loadReplies, loadingReplies } = useLoadReplies({ blogId });

  // Local state
  const [isComposing, setIsComposing] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyingToSpecific, setReplyingToSpecific] = useState<string | null>(null);
  const [showReplies, setShowReplies] = useState<Record<string, boolean>>({});

  const [mainEditorContent, setMainEditorContent] = useState('');
  const [replyEditorContent, setReplyEditorContent] = useState('');
  const [mainEditor, setMainEditor] = useState<TipTapEditor | null>(null);
  const [replyEditor, setReplyEditor] = useState<TipTapEditor | null>(null);

  // Get comments from API data - flatten infinite query pages
  const comments = commentsData?.pages.flatMap((page) => page.result) || [];
  const totalComments = commentsData?.pages[0]?.meta?.totalItems || 0;

  const handleSendMessage = async () => {
    if (!currentUser) {
      toast.error('Please login to leave a comment');
      return;
    }

    const hasContent = mainEditorContent.replace(/<[^>]*>/g, '').trim().length > 0;

    if (hasContent) {
      try {
        await createCommentMutation.mutateAsync({
          blogId,
          commentData: {
            content: mainEditorContent,
          },
        });

        setMainEditorContent('');
        setIsComposing(false);

        // Clear editor content
        if (mainEditor) {
          mainEditor.commands.clearContent();
        }
      } catch (error) {
        console.error('Failed to create comment:', error);
      }
    }
  };

  const handleSendReply = async (parentCommentId: string) => {
    if (!currentUser) {
      toast.error('Please login to reply');
      return;
    }

    // Use replyingToSpecific if available, otherwise fall back to replyingTo
    const actualParentId = replyingToSpecific || replyingTo || parentCommentId;

    const hasContent = replyEditorContent.replace(/<[^>]*>/g, '').trim().length > 0;

    if (hasContent) {
      try {
        await createCommentMutation.mutateAsync({
          blogId,
          commentData: {
            content: replyEditorContent,
            parentId: actualParentId,
          },
        });

        setShowReplies((prev: Record<string, boolean>) => ({
          ...prev,
          [actualParentId]: true,
        }));

        setReplyEditorContent('');
        setReplyingTo(null);
        setReplyingToSpecific(null);

        // Clear editor content
        if (replyEditor) {
          replyEditor.commands.clearContent();
        }
      } catch (error) {
        console.error('Failed to create reply:', error);
      }
    }
  };

  const handleCancel = () => {
    if (mainEditor && mainEditor.view && mainEditor.view.dom) {
      try {
        mainEditor.commands.clearContent();
      } catch (error) {
        console.warn('Editor not ready for clearing:', error);
      }
    }
    setMainEditorContent('');
    setIsComposing(false);
  };

  const handleCancelReply = () => {
    if (replyEditor && replyEditor.view && replyEditor.view.dom) {
      try {
        replyEditor.commands.clearContent();
      } catch (error) {
        console.warn('Reply editor not ready for clearing:', error);
      }
    }
    setReplyEditorContent('');
    setReplyingTo(null);
    setReplyingToSpecific(null);
  };

  const handleReply = (commentId: string, userName: string) => {
    if (!currentUser) {
      toast.error('Please login to reply');
      return;
    }

    // Recursive function to find comment by ID or username
    const findComment = (
      comments: IComment[],
      searchId: string,
      searchUserName?: string,
    ): { comment: IComment; parentId?: string } | null => {
      for (const comment of comments) {
        if (comment.id === searchId || comment.user?.username === searchUserName) {
          return { comment };
        }
        if (comment.replies && comment.replies.length > 0) {
          const found = findComment(comment.replies, searchId, searchUserName);
          if (found) {
            return { ...found, parentId: comment.id };
          }
        }
      }
      return null;
    };

    // Find the target comment
    const found = findComment(comments, commentId);
    if (!found) {
      return;
    }

    const parentCommentId = commentId;
    const specificCommentId = commentId;
    const parentLevel = found.comment.level || 1;

    // Check if we can add replies at this level (max 5 levels)
    if (!CommentsService.canAddReply(parentLevel)) {
      toast.error('Cannot reply at this level. Maximum 5 levels allowed.');
      return;
    }

    setReplyingTo(parentCommentId);
    setReplyingToSpecific(specificCommentId);

    // Find userId for mention
    const foundUser = findComment(comments, commentId, userName);
    const userId = foundUser?.comment.userId || commentId;

    const mentionHTML = `<span data-type="mention" data-id="${userId}" data-label="${userName}">@${userName}</span>&nbsp;`;

    setReplyEditorContent(mentionHTML);

    setTimeout(() => {
      if (replyEditor && replyEditor.view && replyEditor.view.dom) {
        try {
          replyEditor.commands.setContent(mentionHTML);
          replyEditor.commands.focus('end');
        } catch (error) {
          console.warn('Editor not ready yet:', error);
        }
      }
    }, 100);
  };

  const handleLoadReplies = async (commentId: string) => {
    const success = await loadReplies(commentId, comments);
    if (success) {
      setShowReplies((prev: Record<string, boolean>) => ({
        ...prev,
        [commentId]: true,
      }));
    }
  };

  const toggleReplies = (commentId: string) => {
    setShowReplies((prev: Record<string, boolean>) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  return (
    <div className="mt-12 border-t border-gray-200 pt-8 sm:mt-16">
      <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900">
        Comments
        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-sm text-gray-600">
          {totalComments}
        </span>
      </h3>

      {currentUser ? (
        <div className="mb-8">
          <CommentEditor
            isComposing={isComposing}
            content={mainEditorContent}
            isPending={createCommentMutation.isPending}
            onComposingChange={setIsComposing}
            onContentChange={setMainEditorContent}
            onEditorReady={setMainEditor}
            onSubmit={handleSendMessage}
            onCancel={handleCancel}
          />
        </div>
      ) : (
        <div className="mb-8 rounded-lg border border-gray-100 bg-gray-50 p-4 text-center">
          <p className="mb-3 text-sm text-gray-600">You must be logged in to leave a comment.</p>
        </div>
      )}

      <div className="space-y-6">
        <CommentList
          comments={comments}
          isLoading={isLoading}
          error={error}
          replyingTo={replyingTo}
          replyingToSpecific={replyingToSpecific}
          replyContent={replyEditorContent}
          isPending={createCommentMutation.isPending}
          showReplies={showReplies}
          loadingReplies={loadingReplies}
          blogId={blogId}
          onReply={handleReply}
          onToggleReplies={toggleReplies}
          onLoadReplies={handleLoadReplies}
          onReplyContentChange={setReplyEditorContent}
          onReplyEditorReady={setReplyEditor}
          onReplySubmit={handleSendReply}
          onReplyCancel={handleCancelReply}
          onRefetch={refetch}
        />

        {/* Load More Button */}
        {hasNextPage && (
          <div className="flex justify-center pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="rounded-full px-6"
            >
              {isFetchingNextPage ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                'Load More Comments'
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogCommentSection;
