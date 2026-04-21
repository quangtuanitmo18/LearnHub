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
import { Search, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContestsService } from '@/services/contests';
import { toast } from 'sonner';

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

  const handleExport = async () => {
    try {
      toast.loading('Exporting results...', { id: 'export-results' });
      const blob = await ContestsService.exportAdminAttempts(contestId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `contest-results.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Results exported successfully', { id: 'export-results' });
    } catch (error) {
      toast.error('Failed to export results', { id: 'export-results' });
    }
  };

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
        <Button
          onClick={handleExport}
          variant="outline"
          className="ml-auto flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export Excel
        </Button>
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
