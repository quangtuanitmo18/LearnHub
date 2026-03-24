"use client";

import {Button} from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {OPERATIONS, RESOURCES} from "@/configs/permission";
import {usePermissions} from "@/hooks/use-permissions";
import {IOrder} from "@/types/order";
import {DotsHorizontalIcon} from "@radix-ui/react-icons";
import {Row} from "@tanstack/react-table";
import {Eye, Trash2, Edit} from "lucide-react";
import {useState} from "react";
import OrderViewDialog from "./order-view-dialog";
import OrdersDeleteDialog from "./orders-delete-dialog";
import OrderStatusDialog from "./order-status-dialog";

interface DataTableRowActionsProps {
	row: Row<IOrder>;
}

const DataTableRowActions = ({row}: DataTableRowActionsProps) => {
	const order = row.original;

	// State for dialogs
	const [viewDialogOpen, setViewDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [statusDialogOpen, setStatusDialogOpen] = useState(false);

	// Permissions
	const {DELETE, UPDATE} = usePermissions(RESOURCES.ORDER, [
		OPERATIONS.DELETE,
		OPERATIONS.UPDATE,
	]);

	// Handle actions
	const handleView = () => {
		setViewDialogOpen(true);
	};

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
					{/* View order */}
					<DropdownMenuItem onClick={handleView}>
						<Eye className="mr-2 h-4 w-4" />
						View Details
					</DropdownMenuItem>

					{/* Update status */}
					{UPDATE && (
						<DropdownMenuItem onClick={handleUpdateStatus}>
							<Edit className="mr-2 h-4 w-4" />
							Update Status
						</DropdownMenuItem>
					)}

					<DropdownMenuSeparator />

					{/* Delete order */}
					{DELETE && (
						<DropdownMenuItem onClick={handleDelete} className="text-red-600">
							<Trash2 className="mr-2 h-4 w-4" />
							Delete
							<DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
						</DropdownMenuItem>
					)}
				</DropdownMenuContent>
			</DropdownMenu>

			{/* View Dialog */}
			{viewDialogOpen && (
				<OrderViewDialog
					order={order}
					open={viewDialogOpen}
					onOpenChange={setViewDialogOpen}
				/>
			)}

			{/* Status Update Dialog */}
			{statusDialogOpen && (
				<OrderStatusDialog
					order={order}
					open={statusDialogOpen}
					onOpenChange={setStatusDialogOpen}
				/>
			)}

			{/* Delete Dialog */}
			{deleteDialogOpen && (
				<OrdersDeleteDialog
					currentRow={order}
					open={deleteDialogOpen}
					onOpenChange={setDeleteDialogOpen}
				/>
			)}
		</>
	);
};

export default DataTableRowActions;
