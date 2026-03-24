"use client";

import AlertDialogDestructive from "@/components/alert-dialog";
import { useDeleteAdminReview } from "@/hooks/use-reviews";
import { IReview } from "@/types/review";

interface ReviewsDeleteDialogProps {
  currentRow: IReview;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ReviewsDeleteDialog = ({
  currentRow,
  open,
  onOpenChange,
}: ReviewsDeleteDialogProps) => {
  const deleteReviewMutation = useDeleteAdminReview();

  const handleDelete = () => {
    deleteReviewMutation.mutate(currentRow.id);
  };

  return (
    <AlertDialogDestructive
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={deleteReviewMutation.isPending}
    />
  );
};

export default ReviewsDeleteDialog;
