'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { IOrder, OrderStatus, PaymentMethod } from '@/types/order';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDate, formatPrice } from '@/utils/format';
import { Calendar, CreditCard, Mail, Package, User } from 'lucide-react';
import Image from 'next/image';

// Status configuration
const STATUS_CONFIG = {
  [OrderStatus.PENDING]: {
    label: 'Chờ thanh toán',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    variant: 'secondary' as const,
  },
  [OrderStatus.COMPLETED]: {
    label: 'Hoàn thành',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    variant: 'default' as const,
  },
  [OrderStatus.CANCELLED]: {
    label: 'Đã hủy',
    className: 'bg-red-50 text-red-700 border-red-200',
    variant: 'destructive' as const,
  },
};

// Payment method labels
const PAYMENT_METHOD_LABELS = {
  [PaymentMethod.STRIPE]: 'Stripe',
  [PaymentMethod.BANK_TRANSFER]: 'Chuyển khoản ngân hàng',
} as const;

interface OrderViewDialogProps {
  order: IOrder;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const OrderViewDialog = ({ order, open, onOpenChange }: OrderViewDialogProps) => {
  const statusConfig = STATUS_CONFIG[order.status];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-7xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Order #{order.code}</DialogTitle>
          <DialogDescription>View order details and customer information</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Order Information */}
          <div className="space-y-4 lg:col-span-2">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium">Status</p>
                      <Badge className={statusConfig.className}>{statusConfig.label}</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground text-sm">Total Amount</p>
                    <p className="text-xl font-bold text-green-600">
                      {formatPrice(order.totalAmount)}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="text-muted-foreground h-4 w-4" />
                    <div>
                      <p className="text-muted-foreground text-sm">Created</p>
                      <p className="font-medium">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="text-muted-foreground h-4 w-4" />
                    <div>
                      <p className="text-muted-foreground text-sm">Payment Method</p>
                      <p className="font-medium">{PAYMENT_METHOD_LABELS[order.paymentMethod]}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items ({order.items.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 rounded-lg border p-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-200">
                        <Image
                          src={item.thumbnail || '/images/course-placeholder.jpg'}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{item.title}</h4>
                        <p className="text-muted-foreground text-xs">Course ID: {item.courseId}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{formatPrice(item.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                {/* Order Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>{formatPrice(order.subTotal)}</span>
                  </div>
                  {order.totalDiscount > 0 && (
                    <div className="flex justify-between text-sm text-emerald-600">
                      <span>Discount:</span>
                      <span>-{formatPrice(order.totalDiscount)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total:</span>
                    <span className="text-green-600">{formatPrice(order.totalAmount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customer Information */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <Avatar className="mx-auto mb-3 h-12 w-12">
                    <AvatarImage src={order.user?.avatar} alt={order.user?.username} />
                    <AvatarFallback>
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <p className="font-medium">{order.user?.username}</p>
                  <p className="text-muted-foreground text-sm">Customer</p>
                </div>

                <Separator />

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="text-muted-foreground h-4 w-4" />
                    <span>{order.user?.email || 'Email not available'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderViewDialog;
