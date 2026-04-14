'use client';

import AlertDialogDestructive from '@/components/alert-dialog';
import { useBulkDeleteContests } from '@/hooks/use-contests';
import { Contest } from '@/types/contest';
import { toast } from 'sonner';

interface ContestsBulkDeleteDialogProps {
  selectedContests: Contest[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const ContestsBulkDeleteDialog = ({
  selectedContests,
  open,
  onOpenChange,
  onSuccess,
}: ContestsBulkDeleteDialogProps) => {
  const bulkDeleteMutation = useBulkDeleteContests();

  const handleConfirm = () => {
    const ids = selectedContests.map((c) => c.id);
    bulkDeleteMutation.mutate(ids, {
      onSuccess: () => {
        toast.success(`Successfully deleted ${ids.length} contest(s)`);
        onOpenChange(false);
        onSuccess?.();
      },
    });
  };

  return (
    <AlertDialogDestructive
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleConfirm}
      disabled={bulkDeleteMutation.isPending}
    />
  );
};

export default ContestsBulkDeleteDialog;
