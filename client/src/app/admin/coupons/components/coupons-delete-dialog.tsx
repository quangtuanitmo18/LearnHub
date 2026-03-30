'use client';

import AlertDialogDestructive from '@/components/alert-dialog';
import { useDeleteCoupon } from '@/hooks/use-coupons';
import { ICoupon } from '@/types/coupon';

interface CouponsDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow: ICoupon;
}

const CouponsDeleteDialog = ({ open, onOpenChange, currentRow }: CouponsDeleteDialogProps) => {
  const deleteCouponMutation = useDeleteCoupon();

  const handleDelete = () => {
    deleteCouponMutation.mutate(currentRow.id);
  };

  return (
    <AlertDialogDestructive
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={deleteCouponMutation.isPending}
    />
  );
};

export default CouponsDeleteDialog;
