import { DataTable, DataTablePagination } from '@/components/table';
import { PAGINATION_CONSTANTS, TABLE_CONSTANTS } from '@/constants';
import { useCategories } from '@/hooks/use-categories';
import { useDebounce } from '@/hooks/use-debounce';
import { CategoriesFilterParams } from '@/types/category';
import { VisibilityState, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useCallback, useEffect, useMemo, useState } from 'react';
import CategoriesBulkDeleteDialog from './categories-bulk-delete-dialog';
import { columns } from './categories-columns';
import DataTableToolbar from './data-table-toolbar';

// Filter state interface for better organization
interface FilterState {
  search: string;
  status: string[];
}

const CategoriesTable = () => {
  // Essential table state
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(PAGINATION_CONSTANTS.DEFAULT_PAGE);
  const [pageSize, setPageSize] = useState(PAGINATION_CONSTANTS.DEFAULT_PAGE_SIZE);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: [],
  });

  // Debounce search input
  const debouncedSearch = useDebounce(filters.search, TABLE_CONSTANTS.SEARCH_DEBOUNCE_MS);

  // Format query parameters for API call
  const queryParams = useMemo(() => {
    const params: CategoriesFilterParams = {
      page: currentPage,
      limit: pageSize,
      ...(debouncedSearch && { search: debouncedSearch }),
      ...(filters.status.length > 0 && { status: filters.status }),
    };

    return params;
  }, [currentPage, pageSize, debouncedSearch, filters.status]);

  const { data: categoriesData, isLoading } = useCategories(queryParams);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(PAGINATION_CONSTANTS.DEFAULT_PAGE);
  }, [debouncedSearch, filters.status]);

  // Memoized handlers for better performance
  const handleSearchChange = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  }, []);

  const handleStatusFilterChange = useCallback((status: string[]) => {
    setFilters((prev) => ({ ...prev, status }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      search: '',
      status: [],
    });
    setCurrentPage(PAGINATION_CONSTANTS.DEFAULT_PAGE);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(PAGINATION_CONSTANTS.DEFAULT_PAGE); // Reset to first page when page size changes
  }, []);

  const handleBulkDelete = useCallback(() => {
    setBulkDeleteDialogOpen(true);
  }, []);

  const handleBulkDeleteSuccess = useCallback(() => {
    setRowSelection({}); // Clear selection after successful delete
  }, []);

  // Memoized categories data
  const categories = useMemo(() => categoriesData?.result || [], [categoriesData?.result]);

  // Get selected categories for bulk operations
  const selectedCategories = useMemo(() => {
    return categories.filter((_, index) => rowSelection[index]);
  }, [categories, rowSelection]);

  // Memoized table configuration
  const table = useReactTable({
    data: categories,
    columns,
    state: {
      columnVisibility,
      rowSelection,
    },
    enableRowSelection: TABLE_CONSTANTS.ENABLE_ROW_SELECTION,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      <DataTableToolbar
        searchValue={filters.search}
        statusFilter={filters.status}
        onSearchChange={handleSearchChange}
        onStatusFilterChange={handleStatusFilterChange}
        onClearFilters={handleClearFilters}
        onBulkDelete={handleBulkDelete}
        isLoading={isLoading}
        table={table}
      />

      <div className="overflow-hidden rounded-md border">
        <DataTable table={table} />
      </div>

      {categoriesData?.meta && (
        <DataTablePagination
          pagination={categoriesData?.meta}
          currentDataLength={categories.length}
          pageSize={pageSize}
          pageSizeOptions={PAGINATION_CONSTANTS.PAGE_SIZE_OPTIONS}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      {/* Bulk Delete Dialog */}
      <CategoriesBulkDeleteDialog
        selectedCategories={selectedCategories}
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
        onSuccess={handleBulkDeleteSuccess}
      />
    </div>
  );
};

export default CategoriesTable;
