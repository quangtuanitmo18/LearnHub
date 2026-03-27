'use client';

import AlertDialogDestructive from '@/components/alert-dialog';
import { useBulkDeleteAdminReviews } from '@/hooks/use-reviews';
import { toast } from 'sonner';

interface ReviewsBulkDeleteDialogProps {
  selectedReviews: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const ReviewsBulkDeleteDialog = ({
  selectedReviews,
  open,
  onOpenChange,
  onSuccess,
}: ReviewsBulkDeleteDialogProps) => {
  const bulkDeleteMutation = useBulkDeleteAdminReviews();

  const handleBulkDelete = () => {
    bulkDeleteMutation.mutate(selectedReviews, {
      onSuccess: () => {
        toast.success(
          `Successfully deleted ${selectedReviews.length} review${
            selectedReviews.length === 1 ? '' : 's'
          }`,
        );
        onSuccess?.();
      },
    });
  };

  return (
    <AlertDialogDestructive
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleBulkDelete}
      disabled={bulkDeleteMutation.isPending}
    />
  );
};

export default ReviewsBulkDeleteDialog;
