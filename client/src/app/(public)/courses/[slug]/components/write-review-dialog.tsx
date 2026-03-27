'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCreateReview, useUpdateReview } from '@/hooks/use-reviews';

interface WriteReviewDialogProps {
  children?: React.ReactNode;
  courseTitle?: string;
  courseId: string;
  editMode?: {
    reviewId: string;
    initialStar: number;
    initialContent: string;
  };
  onClose?: () => void;
}

const WriteReviewDialog = ({
  children,
  courseTitle,
  courseId,
  editMode,
  onClose,
}: WriteReviewDialogProps) => {
  const [isOpen, setIsOpen] = useState(!!editMode);
  const [star, setStar] = useState(editMode?.initialStar || 0);
  const [hoverStar, setHoverStar] = useState(0);
  const [content, setContent] = useState(editMode?.initialContent || '');

  const createReviewMutation = useCreateReview();
  const updateReviewMutation = useUpdateReview();
  const isEditMode = !!editMode;

  // Sync state when editMode changes
  useEffect(() => {
    if (editMode) {
      setIsOpen(true);
      setStar(editMode.initialStar);
      setContent(editMode.initialContent);
      setHoverStar(0); // Reset hover state
    }
  }, [editMode]);

  const handleSubmit = () => {
    if (star === 0 || content.trim() === '') {
      return;
    }

    if (isEditMode && editMode) {
      // Update existing review
      updateReviewMutation.mutate(
        {
          id: editMode.reviewId,
          courseId,
          star,
          content: content.trim(),
        },
        {
          onSuccess: () => {
            // Close dialog on success
            setIsOpen(false);
            onClose?.();
          },
        },
      );
    } else {
      // Create new review
      createReviewMutation.mutate(
        {
          courseId,
          star,
          content: content.trim(),
        },
        {
          onSuccess: () => {
            // Reset form and close dialog on success
            setStar(0);
            setHoverStar(0);
            setContent('');
            setIsOpen(false);
          },
        },
      );
    }
  };

  const handleStarClick = (value: number) => {
    setStar(value);
  };

  const handleStarHover = (value: number) => {
    setHoverStar(value);
  };

  const handleStarLeave = () => {
    setHoverStar(0);
  };

  const getStarEmoji = (starValue: number) => {
    switch (starValue) {
      case 1:
        return '🤢';
      case 2:
        return '😞';
      case 3:
        return '😐';
      case 4:
        return '😊';
      case 5:
        return '😍';
      default:
        return '😐';
    }
  };

  const getStarText = (starValue: number) => {
    switch (starValue) {
      case 1:
        return 'Terrible';
      case 2:
        return 'Bad';
      case 3:
        return 'Meh';
      case 4:
        return 'Good';
      case 5:
        return 'Awesome';
      default:
        return 'Select a rating';
    }
  };

  const getStarColor = (starValue: number) => {
    switch (starValue) {
      case 1:
        return 'bg-red-100 border-red-200';
      case 2:
        return 'bg-orange-100 border-orange-200';
      case 3:
        return 'bg-yellow-100 border-yellow-200';
      case 4:
        return 'bg-green-100 border-green-200';
      case 5:
        return 'bg-blue-100 border-blue-200';
      default:
        return 'bg-gray-100 border-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children || <Button>Write a Review</Button>}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            {isEditMode ? 'Edit Review' : 'Write a Review'}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {isEditMode
              ? 'Update your review to share your latest thoughts.'
              : `Share your experience with ${
                  courseTitle || 'this course'
                } to help other learners.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3 sm:space-y-6 sm:py-4">
          {/* Rating Section */}
          <div className="space-y-3 sm:space-y-4">
            <Label className="text-xs font-medium sm:text-sm">How was your experience?</Label>
            <div className="flex items-center justify-center space-x-2 sm:space-x-4 md:space-x-6">
              {[1, 2, 3, 4, 5].map((starValue) => (
                <button
                  key={starValue}
                  type="button"
                  onClick={() => handleStarClick(starValue)}
                  onMouseEnter={() => handleStarHover(starValue)}
                  onMouseLeave={handleStarLeave}
                  className="flex flex-col items-center space-y-1 transition-all duration-200 ease-in-out sm:space-y-2"
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-200 ease-in-out sm:h-12 sm:w-12 ${
                      starValue === (hoverStar || star)
                        ? getStarColor(starValue)
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-xl sm:text-2xl">{getStarEmoji(starValue)}</span>
                  </div>
                  <span
                    className={`text-[10px] font-medium whitespace-nowrap sm:text-xs ${
                      starValue === (hoverStar || star) ? 'text-gray-700' : 'text-gray-500'
                    }`}
                  >
                    {getStarText(starValue)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Comment Section */}
          <div className="space-y-2">
            <Label htmlFor="content" className="text-xs font-medium sm:text-sm">
              Your Review
            </Label>
            <Textarea
              id="content"
              placeholder="Tell us about your experience with this course. What did you like? What could be improved?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] resize-none text-sm sm:min-h-[120px]"
              maxLength={1000}
            />
            <div className="flex justify-between text-[10px] text-gray-500 sm:text-xs">
              <span className="hidden sm:inline">Share your honest experience to help others</span>
              <span className="sm:hidden">Share your experience</span>
              <span>{content.length}/1000</span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={() => {
              setIsOpen(false);
              onClose?.();
            }}
            disabled={createReviewMutation.isPending || updateReviewMutation.isPending}
            className="h-10 w-full text-sm sm:h-11 sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              star === 0 ||
              content.trim() === '' ||
              createReviewMutation.isPending ||
              updateReviewMutation.isPending
            }
            className="h-10 w-full text-sm sm:h-11 sm:w-auto"
          >
            {createReviewMutation.isPending || updateReviewMutation.isPending
              ? isEditMode
                ? 'Updating...'
                : 'Submitting...'
              : isEditMode
                ? 'Update Review'
                : 'Submit Review'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WriteReviewDialog;
