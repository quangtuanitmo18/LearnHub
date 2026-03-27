import { Button } from '@/components/ui/button';
import { PaginationMeta } from '@/types/common';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  pagination: PaginationMeta | undefined;
  currentPage: number;
  onPageChange: (page: number) => void;
}

// Pagination component - Arrow function
const Pagination = ({ pagination, currentPage, onPageChange }: PaginationProps) => {
  if (!pagination || pagination.totalPages <= 1) {
    return null;
  }

  return (
    <div className="mt-6 flex items-center justify-center px-4 sm:mt-8">
      <div className="flex items-center gap-1 sm:gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!pagination.hasPrevPage}
          className="h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm"
        >
          <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="ml-1 hidden sm:inline">Previous</span>
          <span className="ml-0.5 sm:hidden">Prev</span>
        </Button>

        <div className="flex items-center gap-0.5 sm:gap-1">
          {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
            const page = i + 1;
            return (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPageChange(page)}
                className="h-8 w-8 p-0 text-xs sm:h-10 sm:w-10 sm:text-sm"
              >
                {page}
              </Button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!pagination.hasNextPage}
          className="h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm"
        >
          <span className="mr-1 hidden sm:inline">Next</span>
          <span className="mr-0.5 sm:hidden">Next</span>
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
