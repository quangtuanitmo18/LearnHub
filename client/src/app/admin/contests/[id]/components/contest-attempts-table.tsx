'use client';

import { DataTable, DataTablePagination } from '@/components/table';
import { PAGINATION_CONSTANTS } from '@/constants';
import { useAdminContestAttempts, useDeleteAdminContestAttempt } from '@/hooks/use-contests';
import { useDebounce } from '@/hooks/use-debounce';
import { AdminContestAttemptsParams, AdminContestAttempt } from '@/types/contest';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { columns } from './contest-attempts-columns';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface ContestAttemptsTableProps {
  contestId: string;
}

const ContestAttemptsTable = ({ contestId }: ContestAttemptsTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');

  const debouncedSearch = useDebounce(search, 500);

  const queryParams = useMemo(() => {
    const params: AdminContestAttemptsParams = {
      page: currentPage,
      limit: pageSize,
      ...(debouncedSearch && { search: debouncedSearch }),
    };
    return params;
  }, [currentPage, pageSize, debouncedSearch]);

  const { data: attemptsData, isLoading } = useAdminContestAttempts(contestId, queryParams);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  const attempts = useMemo(() => attemptsData?.result || [], [attemptsData?.result]);

  const table = useReactTable({
    data: attempts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      contestId,
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative w-full max-w-sm">
            <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
            <Input
              placeholder="Search by name or email..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border">
        <DataTable table={table} isLoading={isLoading} />
      </div>

      {attemptsData?.meta && (
        <DataTablePagination
          pagination={attemptsData.meta}
          currentDataLength={attempts.length}
          pageSize={pageSize}
          pageSizeOptions={PAGINATION_CONSTANTS.PAGE_SIZE_OPTIONS}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  );
};

export default ContestAttemptsTable;
