import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DEFAULT_THUMBNAIL } from '@/constants';
import type { useCancelOrder } from '@/hooks/use-orders';
import { OrderStatus, PaymentMethod, IOrder, IOrderItem } from '@/types/order';
import { formatDate, formatPrice } from '@/utils/format';
import { OrderService } from '@/services/orders';
import { toast } from 'sonner';

import { Banknote, Calendar, Clock, CreditCard, Download, Loader2, Package, X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

// Status colors and labels with modern design
const STATUS_CONFIG = {
  [OrderStatus.PENDING]: {
    label: 'Pending payment',
    color: 'bg-amber-50 text-amber-700 border border-amber-200',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    icon: Clock,
  },
  [OrderStatus.COMPLETED]: {
    label: 'Completed',
    color: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    icon: Package,
  },
  [OrderStatus.CANCELLED]: {
    label: 'Cancelled',
    color: 'bg-red-50 text-red-700 border border-red-200',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    icon: X,
  },
} as const;

interface OrderCardProps {
  order: IOrder;
  onPayment: (orderId: string, orderCode: string, paymentMethod: PaymentMethod) => void;
  onCancel: (orderId: string, orderCode: string) => void;
  cancelMutation: ReturnType<typeof useCancelOrder>;
}

// Order card component - Arrow function
const OrderCard = ({ order, onPayment, onCancel, cancelMutation }: OrderCardProps) => {
  const statusConfig = STATUS_CONFIG[order.status as OrderStatus];
  const StatusIcon = statusConfig.icon;
  const [isDownloading, setIsDownloading] = useState(false);
  console.log(order);

  // Check if this specific order is being cancelled
  const isCancelling = cancelMutation.isPending && cancelMutation.variables === order.id;

  // Handle invoice download
  const handleDownloadInvoice = async () => {
    try {
      setIsDownloading(true);
      await OrderService.downloadInvoice(order.id, order.code);
      toast.success('Invoice downloaded successfully');
    } catch {
      toast.error('Failed to download invoice. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card className="overflow-hidden border-0 bg-linear-to-br from-white to-gray-50/50 shadow-md transition-all duration-300 hover:shadow-xl sm:shadow-lg">
      {/* Order Header */}
      <CardHeader className="border-b border-gray-100/50 bg-linear-to-r from-gray-50 to-white p-3 sm:p-6">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:gap-0">
          <div className="flex min-w-0 flex-1 items-start gap-2 sm:gap-3">
            <div className={`rounded-lg p-1.5 sm:p-2 ${statusConfig.bgColor} shrink-0`}>
              <StatusIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${statusConfig.textColor}`} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="mb-1 truncate text-base font-bold text-gray-900 sm:text-lg">
                #{order.code}
              </h3>
              <div className="flex flex-col gap-1 text-xs text-gray-600 sm:flex-row sm:items-center sm:gap-4 sm:text-sm">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Calendar className="h-3 w-3 shrink-0 sm:h-4 sm:w-4" />
                  <span className="truncate">{formatDate(order.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <CreditCard className="h-3 w-3 shrink-0 sm:h-4 sm:w-4" />
                  <span className="truncate lowercase first-letter:capitalize">
                    {order.paymentMethod}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="self-start sm:self-auto">
            <Badge
              className={`${statusConfig.color} rounded-full px-2 py-0.5 text-xs font-semibold sm:px-3 sm:py-1 sm:text-sm`}
            >
              {statusConfig.label}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-3 sm:p-4">
        {/* Course Items */}
        <div className="mb-3 space-y-2 sm:mb-4 sm:space-y-3">
          {order?.items.map((item: IOrderItem) => {
            const hasDiscount = Boolean(item.oldPrice && item.oldPrice > item.price);
            const discountPercent = hasDiscount
              ? Math.round(((item.oldPrice! - item.price) / item.oldPrice!) * 100)
              : 0;

            return (
              <div
                key={item.id}
                className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white/90 p-3 shadow-sm transition-all duration-200 hover:border-gray-300 hover:shadow-md sm:gap-4 sm:p-4"
              >
                <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-200 shadow-sm ring-1 ring-black/5 sm:h-16 sm:w-24">
                  <Image
                    src={item.thumbnail || DEFAULT_THUMBNAIL}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 80px, 96px"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="line-clamp-2 min-w-0 text-sm leading-snug font-semibold text-gray-900 sm:text-lg">
                      {item.title}
                    </h4>

                    <div className="shrink-0 text-right">
                      {hasDiscount ? (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(item.oldPrice!)}
                          </span>
                          <span className="rounded-full border border-red-200 bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                            {discountPercent}% OFF
                          </span>
                        </div>
                      ) : null}
                      <div className="mt-1 text-base font-semibold text-gray-900 tabular-nums sm:text-lg">
                        {formatPrice(item.price)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary & Actions */}
        <div className="flex flex-col items-start justify-between gap-3 border-t border-gray-100 pt-2 sm:flex-row sm:items-center sm:pt-3">
          <div className="space-y-0.5 sm:space-y-1">
            <div className="flex flex-col gap-1 text-xs text-gray-600 sm:flex-row sm:items-center sm:gap-3 sm:text-sm">
              <span>Subtotal: {formatPrice(order.subTotal)}</span>
              {order.totalDiscount > 0 && (
                <span className="text-emerald-600">
                  Discount: -{formatPrice(order.totalDiscount)}
                </span>
              )}
            </div>
            <div className="text-sm font-bold text-gray-900 sm:text-base">
              Total: {formatPrice(order.totalAmount)}
            </div>
          </div>

          <div className="flex w-full items-center gap-1.5 sm:w-auto sm:gap-2">
            {/* Action Buttons */}
            {order.status === OrderStatus.PENDING && (
              <>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isCancelling}
                      className="h-8 flex-1 border-red-200 text-xs text-red-600 hover:border-red-300 hover:bg-red-50 disabled:opacity-50 sm:h-9 sm:flex-none sm:text-sm"
                    >
                      {isCancelling ? (
                        <>
                          <Loader2 className="mr-1 h-3 w-3 animate-spin sm:mr-2 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">Cancelling...</span>
                          <span className="sm:hidden">...</span>
                        </>
                      ) : (
                        <>
                          <X className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                          Cancel
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-base sm:text-lg">
                        Confirm order cancellation
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-xs sm:text-sm">
                        Are you sure you want to cancel order #{order.code}? This action cannot be
                        undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
                      <AlertDialogCancel
                        disabled={isCancelling}
                        className="h-9 w-full text-sm sm:w-auto"
                      >
                        No
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onCancel(order.id, order.code)}
                        disabled={isCancelling}
                        className="h-9 w-full bg-red-600 text-sm hover:bg-red-700 disabled:opacity-50 sm:w-auto"
                      >
                        {isCancelling ? (
                          <>
                            <Loader2 className="mr-1 h-3 w-3 animate-spin sm:mr-2 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">Cancelling...</span>
                            <span className="sm:hidden">...</span>
                          </>
                        ) : (
                          'Confirm'
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Button
                  onClick={() => onPayment(order.id, order.code, order.paymentMethod)}
                  size="sm"
                  className="h-8 flex-1 bg-linear-to-r from-blue-600 to-blue-700 text-xs text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl sm:h-9 sm:flex-none sm:text-sm"
                >
                  <Banknote className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                  Pay now
                </Button>
              </>
            )}

            {order.status === OrderStatus.COMPLETED && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadInvoice}
                disabled={isDownloading}
                className="h-8 w-full border-gray-200 text-xs hover:bg-gray-50 disabled:opacity-50 sm:h-9 sm:w-auto sm:text-sm"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="mr-1 h-3 w-3 animate-spin sm:mr-2 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Downloading...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : (
                  <>
                    <Download className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Download invoice</span>
                    <span className="sm:hidden">Invoice</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderCard;
