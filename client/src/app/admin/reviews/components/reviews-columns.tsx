'use client';

import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { IReview } from '@/types/review';
import { getStatusConfig } from '@/utils/common';
import { formatDate } from '@/utils/format';
import { ColumnDef } from '@tanstack/react-table';
import { BookOpen, Star, User } from 'lucide-react';
import DataTableRowActions from './data-table-row-actions';

export const columns: ColumnDef<IReview>[] = [
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

  // User Info
  {
    accessorKey: 'user',
    header: ({ column }) => <DataTableColumnHeader column={column} title="User" />,
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

  // Course Info
  {
    accessorKey: 'course',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Course" />,
    cell: ({ row }) => {
      const course = row.original.course;
      if (!course) {
        return <span className="text-muted-foreground text-sm">—</span>;
      }
      return (
        <div className="flex items-center space-x-2">
          <BookOpen className="text-muted-foreground h-4 w-4" />
          <span className="text-sm font-medium">{course.title}</span>
        </div>
      );
    },
    enableSorting: false,
  },

  // Rating (Star)
  {
    accessorKey: 'star',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Rating" />,
    cell: ({ row }) => {
      const star = row.original.star;
      return (
        <div className="flex items-center space-x-1">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium">{star}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.original.star.toString());
    },
    enableSorting: true,
  },

  // Content
  {
    accessorKey: 'content',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Content" />,
    cell: ({ row }) => {
      const content = row.original.content;
      return (
        <div className="max-w-[300px]">
          <p className="truncate text-sm">{content || '—'}</p>
        </div>
      );
    },
    enableSorting: false,
  },

  // Status
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
