'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { AdminContestAttempt } from '@/types/contest';
import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { MoreHorizontal, Eye, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { useDeleteAdminContestAttempt } from '@/hooks/use-contests';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import QuizAttemptDetailsDialog from '@/app/(protected)/learning/[slug]/components/quiz/quiz-attempt-details-dialog';

dayjs.extend(duration);

function formatDuration(ms: number) {
  const d = dayjs.duration(ms);
  const minutes = Math.floor(d.asMinutes());
  const seconds = d.seconds();
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

const ActionsCell = ({ row, table }: { row: any; table: any }) => {
  const attempt = row.original as AdminContestAttempt;
  const contestId = table.options.meta?.contestId as string;
  const deleteMutation = useDeleteAdminContestAttempt(contestId);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setDetailsOpen(true)}>
            <Eye className="mr-2 h-4 w-4" />
            View specific answers
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete Attempt
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {detailsOpen && (
        <QuizAttemptDetailsDialog
          attemptId={attempt.id}
          open={detailsOpen}
          // Note: using openChange to toggle internally
          onOpenChange={setDetailsOpen}
        />
      )}

      {deleteDialogOpen && (
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this attempt for {attempt.user.username}. They will be
                able to take the contest again.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => {
                  deleteMutation.mutate(attempt.id);
                  setDeleteDialogOpen(false);
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
};

export const columns: ColumnDef<AdminContestAttempt>[] = [
  {
    accessorKey: 'user',
    header: 'Participant',
    cell: ({ row }) => {
      const user = row.getValue('user') as AdminContestAttempt['user'];
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar ?? ''} alt={user.username} />
            <AvatarFallback>{user.username?.[0]?.toUpperCase() ?? 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{user.username}</span>
            <span className="text-muted-foreground text-xs">{user.email}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'attemptNo',
    header: 'Attempt',
    cell: ({ row }) => <span className="font-medium">#{row.getValue('attemptNo')}</span>,
  },
  {
    accessorKey: 'score',
    header: 'Score',
    cell: ({ row }) => {
      const score = row.original.score;
      const maxScore = row.original.maxScore;
      if (score === null || maxScore === null)
        return <span className="text-muted-foreground">-</span>;
      return (
        <span className="font-medium">
          {score} / {maxScore}
        </span>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      const map: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
        IN_PROGRESS: { label: 'In Progress', variant: 'secondary' },
        SUBMITTED: { label: 'Submitted', variant: 'default' },
        EXPIRED: { label: 'Expired', variant: 'outline' },
      };
      const info = map[status] || { label: status, variant: 'outline' };
      return <Badge variant={info.variant}>{info.label}</Badge>;
    },
  },
  {
    accessorKey: 'duration',
    header: 'Duration',
    cell: ({ row }) => {
      const original = row.original;
      if (!original.submittedAt) return <span className="text-muted-foreground">-</span>;
      const start = dayjs(original.startedAt);
      const end = dayjs(original.submittedAt);
      const diffMs = end.diff(start);
      return <span className="whitespace-nowrap">{formatDuration(diffMs)}</span>;
    },
  },
  {
    accessorKey: 'submittedAt',
    header: 'Submitted',
    cell: ({ row }) => {
      const submittedAt = row.getValue('submittedAt') as string | null;
      if (!submittedAt) return <span className="text-muted-foreground">-</span>;
      return (
        <span className="whitespace-nowrap">{dayjs(submittedAt).format('MMM DD, YYYY HH:mm')}</span>
      );
    },
  },
  {
    id: 'actions',
    cell: ActionsCell,
  },
];
