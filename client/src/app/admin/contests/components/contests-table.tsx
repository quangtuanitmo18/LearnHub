import { DataTable, DataTablePagination } from '@/components/table';
import { PAGINATION_CONSTANTS, TABLE_CONSTANTS } from '@/constants';
import { useContests } from '@/hooks/use-contests';
import { useDebounce } from '@/hooks/use-debounce';
import { ContestsFilterParams } from '@/types/contest';
import { VisibilityState, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ContestsBulkDeleteDialog from './contests-bulk-delete-dialog';
import { columns } from './contests-columns';
import DataTableToolbar from './data-table-toolbar';

interface FilterState {
  search: string;
  status: string[];
}

const ContestsTable = () => {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(PAGINATION_CONSTANTS.DEFAULT_PAGE);
  const [pageSize, setPageSize] = useState(PAGINATION_CONSTANTS.DEFAULT_PAGE_SIZE);

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: [],
  });

  const debouncedSearch = useDebounce(filters.search, TABLE_CONSTANTS.SEARCH_DEBOUNCE_MS);

  const queryParams = useMemo(() => {
    const params: ContestsFilterParams = {
      page: currentPage,
      limit: pageSize,
      ...(debouncedSearch && { search: debouncedSearch }),
      ...(filters.status.length > 0 && { status: filters.status }),
    };
    return params;
  }, [currentPage, pageSize, debouncedSearch, filters.status]);

  const { data: contestsData, isLoading } = useContests(queryParams);

  useEffect(() => {
    setCurrentPage(PAGINATION_CONSTANTS.DEFAULT_PAGE);
  }, [debouncedSearch, filters.status]);

  const handleSearchChange = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  }, []);

  const handleStatusFilterChange = useCallback((status: string[]) => {
    setFilters((prev) => ({ ...prev, status }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({ search: '', status: [] });
    setCurrentPage(PAGINATION_CONSTANTS.DEFAULT_PAGE);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(PAGINATION_CONSTANTS.DEFAULT_PAGE);
  }, []);

  const handleBulkDelete = useCallback(() => {
    setBulkDeleteDialogOpen(true);
  }, []);

  const handleBulkDeleteSuccess = useCallback(() => {
    setRowSelection({});
  }, []);

  const contests = useMemo(() => contestsData?.result || [], [contestsData?.result]);

  const selectedContests = useMemo(() => {
    return contests.filter((_, index) => rowSelection[index]);
  }, [contests, rowSelection]);

  const table = useReactTable({
    data: contests,
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
        <DataTable table={table} isLoading={isLoading} />
      </div>

      {contestsData?.meta && (
        <DataTablePagination
          pagination={contestsData?.meta}
          currentDataLength={contests.length}
          pageSize={pageSize}
          pageSizeOptions={PAGINATION_CONSTANTS.PAGE_SIZE_OPTIONS}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      <ContestsBulkDeleteDialog
        selectedContests={selectedContests}
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
        onSuccess={handleBulkDeleteSuccess}
      />
    </div>
  );
};

export default ContestsTable;
