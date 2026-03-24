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
import { useUpdateOrderStatus } from "@/hooks/use-orders";
import { IOrder, OrderStatus } from "@/types/order";
import { getStatusConfig } from "@/utils/common";
import { Loader2 } from "lucide-react";
import { useState } from "react";

// Status labels for Vietnamese
const STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: "Chờ thanh toán",
  [OrderStatus.COMPLETED]: "Hoàn thành",
  [OrderStatus.CANCELLED]: "Đã hủy",
};

interface OrderStatusDialogProps {
  order: IOrder;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const OrderStatusDialog = ({
  order,
  open,
  onOpenChange,
}: OrderStatusDialogProps) => {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(
    order.status as OrderStatus
  );

  // Use the mutation hook for updating order status
  const { mutate: updateOrderStatus, isPending } = useUpdateOrderStatus();

  const currentStatusConfig = getStatusConfig(order.status);
  const newStatusConfig = getStatusConfig(selectedStatus);

  const handleUpdateStatus = () => {
    if (selectedStatus === order.status) {
      onOpenChange(false);
      return;
    }

    updateOrderStatus(
      {
        orderId: order.id,
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
      setSelectedStatus(order.status); // Reset to original status
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
          <DialogDescription>
            Change the status for order #{order.code}
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
                {STATUS_LABELS[order.status as OrderStatus] ||
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
              onValueChange={(value) => setSelectedStatus(value as OrderStatus)}
              disabled={isPending}
            >
              <SelectTrigger className="mt-1 w-full">
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={OrderStatus.PENDING}>
                  <div className="flex items-center gap-2">
                    <span>⏳</span>
                    <span>{STATUS_LABELS[OrderStatus.PENDING]}</span>
                  </div>
                </SelectItem>
                <SelectItem value={OrderStatus.COMPLETED}>
                  <div className="flex items-center gap-2">
                    <span>✅</span>
                    <span>{STATUS_LABELS[OrderStatus.COMPLETED]}</span>
                  </div>
                </SelectItem>
                <SelectItem value={OrderStatus.CANCELLED}>
                  <div className="flex items-center gap-2">
                    <span>❌</span>
                    <span>{STATUS_LABELS[OrderStatus.CANCELLED]}</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Preview */}
          {selectedStatus !== order.status && (
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
            disabled={isPending || selectedStatus === order.status}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrderStatusDialog;
