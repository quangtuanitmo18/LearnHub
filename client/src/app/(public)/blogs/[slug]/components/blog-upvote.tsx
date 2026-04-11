'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp } from 'lucide-react';
import { useToggleUpvote, useBlogUpvoteStatus } from '@/hooks/use-blogs';
import { useUser } from '@/stores/auth-store';
import { toast } from 'sonner';

interface BlogUpvoteProps {
  blogId: string;
  authorId: string;
  upvotesCount: number;
}

export function BlogUpvote({ blogId, authorId, upvotesCount }: BlogUpvoteProps) {
  const user = useUser();
  const { data: statusData } = useBlogUpvoteStatus(blogId);
  const { mutate: toggleUpvote, isPending } = useToggleUpvote();

  // Optimistic UI state
  const [isUpvoted, setIsUpvoted] = React.useState(false);
  const [localCount, setLocalCount] = React.useState(upvotesCount);

  // Sync with server state
  React.useEffect(() => {
    if (statusData) {
      setIsUpvoted(statusData.hasUpvoted);
    }
  }, [statusData]);

  // Sync global upvote changes if blog data refetches
  React.useEffect(() => {
    setLocalCount(upvotesCount);
  }, [upvotesCount]);

  const handleUpvote = () => {
    if (!user) {
      toast.error('Please log in to upvote posts.');
      return;
    }
    if (user.id === authorId) {
      toast.error('You cannot upvote your own post.');
      return;
    }

    // Optimistic update
    setIsUpvoted(!isUpvoted);
    setLocalCount((prev) => (isUpvoted ? prev - 1 : prev + 1));

    // Server request
    toggleUpvote(blogId, {
      onError: () => {
        // Revert on error
        setIsUpvoted(isUpvoted);
        setLocalCount((prev) => (isUpvoted ? prev + 1 : prev - 1));
      },
    });
  };

  return (
    <div className="mt-8 flex items-center gap-3 border-t border-gray-100 py-6">
      <Button
        variant="outline"
        size="lg"
        onClick={handleUpvote}
        disabled={isPending}
        className={`group relative overflow-hidden rounded-full transition-all duration-300 ${
          isUpvoted
            ? 'border-primary bg-primary/5 text-primary hover:bg-primary/10'
            : 'hover:border-primary hover:bg-primary/5 hover:text-primary'
        }`}
      >
        <ThumbsUp
          className={`mr-2 h-5 w-5 transition-transform duration-300 ${
            isUpvoted ? 'fill-primary scale-110' : 'group-hover:scale-110 group-active:scale-95'
          }`}
        />
        <span className="font-semibold">{localCount}</span>

        {/* Subtle ripple effect on hover/active */}
        <span className="bg-primary/10 absolute inset-0 scale-0 rounded-full opacity-0 transition-all duration-300 group-active:scale-100 group-active:opacity-100" />
      </Button>
      <span className="text-sm font-medium text-gray-500 select-none">
        {isUpvoted ? 'You liked this post' : 'Like this post if it helped you'}
      </span>
    </div>
  );
}
