'use client';

import { DataTableColumnHeader } from '@/components/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Contest, ContestStatus } from '@/types/contest';
import { ColumnDef } from '@tanstack/react-table';
import { Trophy } from 'lucide-react';
import Link from 'next/link';
import DataTableRowActions from './data-table-row-actions';
import dayjs from 'dayjs';

const getContestStatusConfig = (status: ContestStatus) => {
  switch (status) {
    case ContestStatus.PUBLISHED:
      return {
        label: 'Published',
        bgColor: 'bg-emerald-50',
        textColor: 'text-emerald-700',
        borderColor: 'border-emerald-200',
        dotColor: 'bg-emerald-500',
        ringColor: 'ring-emerald-500/20',
      };
    case ContestStatus.DRAFT:
    default:
      return {
        label: 'Draft',
        bgColor: 'bg-zinc-50',
        textColor: 'text-zinc-700',
        borderColor: 'border-zinc-200',
        dotColor: 'bg-zinc-400',
        ringColor: 'ring-zinc-500/20',
      };
  }
};

export const columns: ColumnDef<Contest>[] = [
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
    header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
    cell: ({ row }) => {
      const contest = row.original;
      return (
        <Link href={`/admin/contests/${contest.id}`} className="group flex items-center space-x-3">
          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
            <Trophy className="text-primary h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-foreground font-medium group-hover:underline">{contest.title}</div>
            <div className="text-muted-foreground text-sm">/{contest.slug}</div>
          </div>
        </Link>
      );
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.getValue('status') as ContestStatus;
      const config = getContestStatusConfig(status);

      return (
        <Badge
          className={`rounded-full border capitalize ${config.bgColor} ${config.textColor} ${config.borderColor} ${config.ringColor} focus-visible:outline-none`}
        >
          <span className={`size-1.5 rounded-full ${config.dotColor}`} aria-hidden="true" />
          {config.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'durationSec',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Duration" />,
    cell: ({ row }) => {
      const durationSec = row.getValue('durationSec') as number | null;
      if (!durationSec) return <div className="text-muted-foreground text-sm">—</div>;
      const minutes = Math.floor(durationSec / 60);
      return <div className="text-sm">{minutes} min</div>;
    },
  },
  {
    accessorKey: 'startTime',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Start" />,
    cell: ({ row }) => {
      const date = row.getValue('startTime') as string | null;
      if (!date) return <div className="text-muted-foreground text-sm">—</div>;
      return <div className="text-sm">{dayjs(date).format('DD/MM/YYYY HH:mm')}</div>;
    },
  },
  {
    accessorKey: 'endTime',
    header: ({ column }) => <DataTableColumnHeader column={column} title="End" />,
    cell: ({ row }) => {
      const date = row.getValue('endTime') as string | null;
      if (!date) return <div className="text-muted-foreground text-sm">—</div>;
      return <div className="text-sm">{dayjs(date).format('DD/MM/YYYY HH:mm')}</div>;
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as string;
      return <div className="text-sm">{dayjs(date).format('DD/MM/YYYY')}</div>;
    },
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
];
