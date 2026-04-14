'use client';

import AlertDialogDestructive from '@/components/alert-dialog';
import { useDeleteContest } from '@/hooks/use-contests';
import { Contest } from '@/types/contest';

interface ContestsDeleteDialogProps {
  currentRow: Contest;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ContestsDeleteDialog = ({ currentRow, open, onOpenChange }: ContestsDeleteDialogProps) => {
  const deleteContestMutation = useDeleteContest();

  const handleDelete = () => {
    deleteContestMutation.mutate(currentRow?.id);
  };

  return (
    <AlertDialogDestructive
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={deleteContestMutation.isPending}
    />
  );
};

export default ContestsDeleteDialog;
