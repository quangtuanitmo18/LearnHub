"use client";

import { DataTable, DataTablePagination } from "@/components/table";
import { PAGINATION_CONSTANTS, TABLE_CONSTANTS } from "@/constants";
import { useAdminReviews } from "@/hooks/use-reviews";
import { useDebounce } from "@/hooks/use-debounce";
import { AdminReviewsFilterParams } from "@/types/review";
import {
  VisibilityState,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useState } from "react";
import ReviewsBulkDeleteDialog from "./reviews-bulk-delete-dialog";
import { columns } from "./reviews-columns";
import DataTableToolbar from "./data-table-toolbar";

// Filter state interface for better organization
interface FilterState {
  search: string;
  status: string[];
  rating: string[];
}

const ReviewsTable = () => {
  // Essential table state
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(
    PAGINATION_CONSTANTS.DEFAULT_PAGE
  );
  const [pageSize, setPageSize] = useState(
    PAGINATION_CONSTANTS.DEFAULT_PAGE_SIZE
  );

  // Filter state - grouped for better performance
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: [],
    rating: [],
  });

  // Debounce search input
  const debouncedSearch = useDebounce(
    filters.search,
    TABLE_CONSTANTS.SEARCH_DEBOUNCE_MS
  );

  // Format query parameters for API call
  const queryParams = useMemo(() => {
    const params: AdminReviewsFilterParams = {
      page: currentPage,
      limit: pageSize,
      ...(debouncedSearch && { search: debouncedSearch }),
      ...(filters.status.length > 0 && { status: filters.status }),
      ...(filters.rating.length > 0 && {
        minStar: Math.min(...filters.rating.map((r) => parseInt(r))),
      }),
    };

    return params;
  }, [
    currentPage,
    pageSize,
    debouncedSearch,
    filters.status,
    filters.rating,
  ]);

  const { data: reviewsData } = useAdminReviews(queryParams);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(PAGINATION_CONSTANTS.DEFAULT_PAGE);
  }, [debouncedSearch, filters.status, filters.rating]);

  // Memoized handlers for better performance
  const updateFilters = useCallback((newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(PAGINATION_CONSTANTS.DEFAULT_PAGE); // Reset to first page when page size changes
  }, []);

  const handleBulkDeleteSuccess = useCallback(() => {
    setRowSelection({}); // Clear selection after successful delete
  }, []);

  // Memoized reviews data
  const reviews = useMemo(() => reviewsData?.result || [], [reviewsData?.result]);

  // Get selected row count for bulk operations
  const selectedRowCount = Object.keys(rowSelection).length;

  const handleBulkDelete = useCallback(() => {
    if (selectedRowCount > 0) {
      setBulkDeleteDialogOpen(true);
    }
  }, [selectedRowCount]);

  // Get selected reviews for bulk operations
  const selectedReviews = useMemo(() => {
    return reviews.filter((review) => rowSelection[review.id]);
  }, [reviews, rowSelection]);

  // Memoized table configuration
  const table = useReactTable({
    data: reviews,
    columns,
    state: {
      columnVisibility,
      rowSelection,
    },
    enableRowSelection: TABLE_CONSTANTS.ENABLE_ROW_SELECTION,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  });

  return (
    <div className="space-y-4">
      <DataTableToolbar
        table={table}
        filters={filters}
        onFiltersChange={updateFilters}
        selectedRowCount={selectedRowCount}
        onBulkDelete={handleBulkDelete}
      />

      <div className="overflow-hidden rounded-md border">
        <DataTable table={table} />
      </div>

      {reviewsData?.meta && (
        <DataTablePagination
          pagination={reviewsData.meta}
          currentDataLength={reviews.length}
          pageSize={pageSize}
          pageSizeOptions={PAGINATION_CONSTANTS.PAGE_SIZE_OPTIONS}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      {/* Bulk Delete Dialog */}
      <ReviewsBulkDeleteDialog
        selectedReviews={selectedReviews.map((review) => review.id)}
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
        onSuccess={handleBulkDeleteSuccess}
      />
    </div>
  );
};

export default ReviewsTable;
