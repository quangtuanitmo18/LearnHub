"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateReviewStatus } from "@/hooks/use-reviews";
import { IReview, ReviewStatus } from "@/types/review";
import { getStatusConfig } from "@/utils/common";
import { Loader2 } from "lucide-react";
import { useState } from "react";

// Status labels
const STATUS_LABELS: Record<ReviewStatus, string> = {
  [ReviewStatus.PENDING]: "Pending",
  [ReviewStatus.APPROVED]: "Approved",
  [ReviewStatus.REJECTED]: "Rejected",
};

interface ReviewStatusDialogProps {
  review: IReview;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ReviewStatusDialog = ({
  review,
  open,
  onOpenChange,
}: ReviewStatusDialogProps) => {
  const [selectedStatus, setSelectedStatus] = useState<ReviewStatus>(
    review.status as ReviewStatus
  );

  // Use the mutation hook for updating review status
  const { mutate: updateReviewStatus, isPending } = useUpdateReviewStatus();

  const currentStatusConfig = getStatusConfig(review.status);
  const newStatusConfig = getStatusConfig(selectedStatus);

  const handleUpdateStatus = () => {
    if (selectedStatus === (review.status as ReviewStatus)) {
      onOpenChange(false);
      return;
    }

    updateReviewStatus(
      {
        reviewId: review.id,
        status: selectedStatus,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  const handleClose = () => {
    if (!isPending) {
      setSelectedStatus(review.status as ReviewStatus); // Reset to original status
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Review Status</DialogTitle>
          <DialogDescription>
            Change the status for review #{review.id.slice(0, 8)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Status */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Current Status
            </label>
            <div className="mt-1">
              <Badge
                className={`rounded-full capitalize border ${currentStatusConfig.bgColor} ${currentStatusConfig.textColor} ${currentStatusConfig.borderColor}`}
              >
                <span
                  className={`size-1.5 rounded-full ${currentStatusConfig.dotColor}`}
                  aria-hidden="true"
                />
                {STATUS_LABELS[review.status as ReviewStatus] ||
                  currentStatusConfig.label}
              </Badge>
            </div>
          </div>

          {/* New Status */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              New Status
            </label>
            <Select
              value={selectedStatus}
              onValueChange={(value) => setSelectedStatus(value as ReviewStatus)}
              disabled={isPending}
            >
              <SelectTrigger className="mt-1 w-full">
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ReviewStatus.PENDING}>
                  <div className="flex items-center gap-2">
                    <span>⏳</span>
                    <span>{STATUS_LABELS[ReviewStatus.PENDING]}</span>
                  </div>
                </SelectItem>
                <SelectItem value={ReviewStatus.APPROVED}>
                  <div className="flex items-center gap-2">
                    <span>✅</span>
                    <span>{STATUS_LABELS[ReviewStatus.APPROVED]}</span>
                  </div>
                </SelectItem>
                <SelectItem value={ReviewStatus.REJECTED}>
                  <div className="flex items-center gap-2">
                    <span>❌</span>
                    <span>{STATUS_LABELS[ReviewStatus.REJECTED]}</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Preview */}
          {selectedStatus !== (review.status as ReviewStatus) && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Preview:</p>
              <div className="flex items-center gap-2">
                <span className="text-sm">Status will change to:</span>
                <Badge
                  className={`rounded-full capitalize border ${newStatusConfig.bgColor} ${newStatusConfig.textColor} ${newStatusConfig.borderColor}`}
                >
                  <span
                    className={`size-1.5 rounded-full ${newStatusConfig.dotColor}`}
                    aria-hidden="true"
                  />
                  {STATUS_LABELS[selectedStatus] || newStatusConfig.label}
                </Badge>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateStatus}
            disabled={isPending || selectedStatus === (review.status as ReviewStatus)}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewStatusDialog;
