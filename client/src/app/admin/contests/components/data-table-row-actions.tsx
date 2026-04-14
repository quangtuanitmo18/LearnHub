'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { OPERATIONS, RESOURCES } from '@/configs/permission';
import { usePermissions } from '@/hooks/use-permissions';
import { Contest } from '@/types/contest';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { Row } from '@tanstack/react-table';
import { ListChecks } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ContestsActionDialog from './contests-action-dialog';
import ContestsDeleteDialog from './contests-delete-dialog';

interface DataTableRowActionsProps {
  row: Row<Contest>;
}

const DataTableRowActions = ({ row }: DataTableRowActionsProps) => {
  const router = useRouter();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { UPDATE, DELETE } = usePermissions(RESOURCES.CONTEST, [
    OPERATIONS.UPDATE,
    OPERATIONS.DELETE,
  ]);

  const contest = row.original;

  const handleEditClick = () => {
    setEditDialogOpen(true);
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="data-[state=open]:bg-muted flex h-8 w-8 p-0">
            <DotsHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          {UPDATE && (
            <DropdownMenuItem onClick={() => router.push(`/admin/contests/${contest.id}`)}>
              Manage Questions
              <DropdownMenuShortcut>
                <ListChecks size={16} />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          )}
          {UPDATE && (
            <DropdownMenuItem onClick={handleEditClick}>
              Edit
              <DropdownMenuShortcut>
                <IconEdit size={16} />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          )}
          {(UPDATE || DELETE) && <DropdownMenuSeparator />}
          {DELETE && (
            <DropdownMenuItem onClick={handleDeleteClick} className="text-red-500!">
              Delete
              <DropdownMenuShortcut>
                <IconTrash size={16} />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {UPDATE && editDialogOpen && (
        <ContestsActionDialog
          mode="edit"
          contest={contest}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
      )}

      {DELETE && deleteDialogOpen && (
        <ContestsDeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          currentRow={contest}
        />
      )}
    </>
  );
};

export default DataTableRowActions;
