'use client';

import { DataTableColumnHeader } from '@/components/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { CouponStatus, DiscountType, ICoupon } from '@/types/coupon';
import { getStatusConfig } from '@/utils/common';
import { formatPrice } from '@/utils/format';
import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { Calendar, DollarSign, Percent, Tag, Users } from 'lucide-react';
import DataTableRowActions from './data-table-row-actions';

// Helper function to get coupon status
function getCouponStatus(coupon: ICoupon): CouponStatus {
  if (!coupon.isActive) return CouponStatus.INACTIVE;

  const now = new Date();
  const endDate = coupon.endDate ? new Date(coupon.endDate) : null;

  if (endDate && endDate < now) return CouponStatus.EXPIRED;
  return CouponStatus.ACTIVE;
}

// Helper function to check if coupon has usage limit
function hasUsageLimit(coupon: ICoupon): boolean {
  return coupon.maxUses !== undefined && coupon.maxUses > 0;
}

// Status configuration for badges matching orders design system

export const columns: ColumnDef<ICoupon>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'title',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Coupon" />,
    cell: ({ row }) => {
      const coupon = row.original;
      return (
        <div className="flex items-center space-x-3">
          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
            <Tag className="text-primary h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-foreground font-medium">{coupon.title}</div>
            <div className="text-muted-foreground font-mono text-sm">{coupon.code}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'discountType',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Discount" />,
    cell: ({ row }) => {
      const coupon = row.original;
      const isPercentage = coupon.discountType === DiscountType.PERCENT;
      return (
        <div className="flex items-center space-x-2">
          {isPercentage ? (
            <Percent className="h-4 w-4 text-blue-600" />
          ) : (
            <DollarSign className="h-4 w-4 text-green-600" />
          )}
          <div>
            <div className="font-medium">
              {isPercentage ? `${coupon.discountValue}%` : formatPrice(coupon.discountValue)}
            </div>
            <div className="text-muted-foreground text-xs">
              {isPercentage ? 'Percentage' : 'Fixed Amount'}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const coupon = row.original;
      const status = getCouponStatus(coupon);
      const config = getStatusConfig(status);

      return (
        <Badge
          className={`rounded-full border capitalize ${config.bgColor} ${config.textColor} ${config.borderColor} ${config.ringColor} focus-visible:outline-none`}
        >
          <span className={`size-1.5 rounded-full ${config.dotColor}`} aria-hidden="true" />
          {status}
        </Badge>
      );
    },

    enableSorting: true,
  },
  {
    accessorKey: 'usage',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Usage" />,
    cell: ({ row }) => {
      const coupon = row.original;
      const hasLimit = hasUsageLimit(coupon);

      return (
        <div className="flex items-center space-x-2">
          <Users className="text-muted-foreground h-4 w-4" />
          <div className="text-sm">
            <div className="font-medium">
              {coupon.usedCount}
              {hasLimit && ` / ${coupon.maxUses}`}
            </div>
            <div className="text-muted-foreground text-xs">
              {hasLimit ? 'Limited' : 'Unlimited'}
            </div>
          </div>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: 'courseIds',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Applicable Courses" />,
    cell: ({ row }) => {
      const coupon = row.original;
      const courseCount = coupon.courses?.length || 0;

      return (
        <div className="text-sm">
          {courseCount === 0 ? (
            <Badge variant="outline">All Courses</Badge>
          ) : (
            <Badge variant="secondary">
              {courseCount} Course{courseCount !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: 'minPurchaseAmount',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Min. Purchase" />,
    cell: ({ row }) => {
      const coupon = row.original;
      return <div className="font-mono text-sm">{formatPrice(coupon.minPurchaseAmount || 0)}</div>;
    },
  },
  {
    accessorKey: 'endDate',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Expires" />,
    cell: ({ row }) => {
      const coupon = row.original;

      if (!coupon.endDate) {
        return (
          <div className="flex items-center space-x-2">
            <Calendar className="text-muted-foreground h-4 w-4" />
            <span className="text-muted-foreground text-sm">Never</span>
          </div>
        );
      }

      const endDate = new Date(coupon.endDate);
      const isExpired = endDate < new Date();

      return (
        <div className="flex items-center space-x-2">
          <Calendar className="text-muted-foreground h-4 w-4" />
          <div className="text-sm">
            <div className={`font-medium ${isExpired ? 'text-red-600' : ''}`}>
              {dayjs(endDate).format('MMM DD, YYYY')}
            </div>
            <div className="text-muted-foreground text-xs">{dayjs(endDate).format('h:mm A')}</div>
          </div>
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
