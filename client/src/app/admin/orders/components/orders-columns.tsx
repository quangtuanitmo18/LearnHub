'use client';

import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { IOrder } from '@/types/order';
import { getStatusConfig } from '@/utils/common';
import { formatDate, formatPrice } from '@/utils/format';
import { ColumnDef } from '@tanstack/react-table';
import { CreditCard, Crown, Package, Tag, User } from 'lucide-react';
import DataTableRowActions from './data-table-row-actions';

// Payment method labels
const PAYMENT_METHOD_LABELS: Record<string, string> = {
  STRIPE: 'Stripe',
  BANK_TRANSFER: 'Bank Transfer',
  stripe: 'Stripe',
  bank_transfer: 'Bank Transfer',
} as const;

export const columns: ColumnDef<IOrder>[] = [
  // Selection column
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

  // Order Code
  {
    accessorKey: 'code',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Order Code" />,
    cell: ({ row }) => {
      return (
        <div className="flex items-center space-x-2">
          <Package className="text-muted-foreground h-4 w-4" />
          <span className="font-mono text-sm font-medium">#{row.original.code}</span>
        </div>
      );
    },
    enableSorting: true,
    enableHiding: false,
  },

  // Customer Info
  {
    accessorKey: 'user',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" />,
    cell: ({ row }) => {
      const user = row.original.user;
      return (
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} alt={user.username} />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{user.username}</span>
            <span className="text-muted-foreground text-xs">{user.email}</span>
          </div>
        </div>
      );
    },
    enableSorting: false,
  },

  // Order Type
  {
    accessorKey: 'orderType',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Order Type" />,
    cell: ({ row }) => {
      const orderType = row.original.orderType;
      return (
        <Badge variant="outline" className="capitalize">
          {orderType}
        </Badge>
      );
    },
    enableSorting: true,
  },

  // Order Status
  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.original.status;
      const config = getStatusConfig(status);

      return (
        <Badge
          className={`rounded-full border capitalize ${config.bgColor} ${config.textColor} ${config.borderColor} ${config.ringColor} focus-visible:outline-none`}
        >
          <span className={`size-1.5 rounded-full ${config.dotColor}`} aria-hidden="true" />
          {config.label}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.original.status);
    },
    enableSorting: true,
  },

  // Payment Method
  {
    accessorKey: 'paymentMethod',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Payment Method" />,
    cell: ({ row }) => {
      const method = row.original.paymentMethod;
      const label = PAYMENT_METHOD_LABELS[method] || method;

      return (
        <div className="flex items-center space-x-2">
          <CreditCard className="text-muted-foreground h-4 w-4" />
          <span className="text-sm">{label}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.original.paymentMethod);
    },
    enableSorting: true,
  },

  // Membership Plan
  {
    accessorKey: 'membershipPlan',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Membership" />,
    cell: ({ row }) => {
      const membershipPlan = row.original.membershipPlan;
      if (!membershipPlan) {
        return <span className="text-muted-foreground text-sm">—</span>;
      }
      return (
        <div className="flex items-center space-x-2">
          <Crown className="h-4 w-4 text-yellow-500" />
          <Badge variant="outline" className="capitalize">
            {membershipPlan}
          </Badge>
        </div>
      );
    },
    enableSorting: false,
  },

  // Coupon Code
  {
    accessorKey: 'couponCode',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Coupon" />,
    cell: ({ row }) => {
      const couponCode = row.original.couponCode;
      if (!couponCode) {
        return <span className="text-muted-foreground text-sm">—</span>;
      }
      return (
        <div className="flex items-center space-x-2">
          <Tag className="text-muted-foreground h-4 w-4" />
          <span className="font-mono text-sm">{couponCode}</span>
        </div>
      );
    },
    enableSorting: false,
  },

  // Sub Total
  {
    accessorKey: 'subTotal',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Sub Total" />,
    cell: ({ row }) => {
      const subTotal = row.original.subTotal;
      return <span className="text-sm font-medium">{formatPrice(subTotal)}</span>;
    },
    enableSorting: true,
  },

  // Total Discount
  {
    accessorKey: 'totalDiscount',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Discount" />,
    cell: ({ row }) => {
      const discount = row.original.totalDiscount;
      if (discount === 0) {
        return <span className="text-muted-foreground text-sm">—</span>;
      }
      return <span className="text-sm font-medium text-red-600">-{formatPrice(discount)}</span>;
    },
    enableSorting: true,
  },

  // Total Amount
  {
    accessorKey: 'totalAmount',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Total Amount" />,
    cell: ({ row }) => {
      const amount = row.original.totalAmount;
      return <span className="font-semibold text-green-600">{formatPrice(amount)}</span>;
    },
    enableSorting: true,
  },

  // Number of Items
  {
    accessorKey: 'items',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Items" />,
    cell: ({ row }) => {
      const items = row.original.items;
      return (
        <span className="text-muted-foreground text-sm">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </span>
      );
    },
    enableSorting: false,
  },

  // Created Date
  {
    accessorKey: 'createdAt',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
    cell: ({ row }) => {
      const date = row.original.createdAt;
      return <div className="text-muted-foreground text-sm">{formatDate(date)}</div>;
    },
    enableSorting: true,
  },

  // Actions
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
    enableSorting: false,
    enableHiding: false,
  },
];
