"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OPERATIONS, RESOURCES } from "@/configs/permission";
import { usePermissions } from "@/hooks/use-permissions";
import { IReview } from "@/types/review";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Row } from "@tanstack/react-table";
import { Trash2, Edit } from "lucide-react";
import { useState } from "react";
import ReviewsDeleteDialog from "./reviews-delete-dialog";
import ReviewStatusDialog from "./review-status-dialog";

interface DataTableRowActionsProps {
  row: Row<IReview>;
}

const DataTableRowActions = ({ row }: DataTableRowActionsProps) => {
  const review = row.original;

  // State for dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  // Permissions
  const { DELETE, UPDATE } = usePermissions(RESOURCES.REVIEW, [
    OPERATIONS.DELETE,
    OPERATIONS.UPDATE,
  ]);

  // Handle actions
  const handleUpdateStatus = () => {
    setStatusDialogOpen(true);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <DotsHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          {/* Update status */}
          {UPDATE && (
            <DropdownMenuItem onClick={handleUpdateStatus}>
              <Edit className="mr-2 h-4 w-4" />
              Update Status
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {/* Delete review */}
          {DELETE && (
            <DropdownMenuItem onClick={handleDelete} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
              <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Status Update Dialog */}
      {statusDialogOpen && (
        <ReviewStatusDialog
          review={review}
          open={statusDialogOpen}
          onOpenChange={setStatusDialogOpen}
        />
      )}

      {/* Delete Dialog */}
      {deleteDialogOpen && (
        <ReviewsDeleteDialog
          currentRow={review}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
        />
      )}
    </>
  );
};

export default DataTableRowActions;
