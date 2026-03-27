'use client';

import { Cross2Icon } from '@radix-ui/react-icons';
import { Table } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTableViewOptions } from '@/components/table/data-table-view-options';
import { DataTableFacetedFilter } from '@/components/table/data-table-faceted-filter';
import { IReview } from '@/types/review';
import { Search, Trash2, Clock, CheckCircle, XCircle, Star } from 'lucide-react';

interface FilterState {
  search: string;
  status: string[];
  rating: string[];
}

interface DataTableToolbarProps {
  table: Table<IReview>;
  filters: FilterState;
  onFiltersChange: (filters: Partial<FilterState>) => void;
  selectedRowCount: number;
  onBulkDelete: () => void;
}

// Filter options for status
const statusOptions = [
  {
    label: 'Pending',
    value: 'PENDING',
    icon: Clock,
  },
  {
    label: 'Approved',
    value: 'APPROVED',
    icon: CheckCircle,
  },
  {
    label: 'Rejected',
    value: 'REJECTED',
    icon: XCircle,
  },
] as const;

// Filter options for ratings
const ratingOptions = [
  {
    label: '5 Stars',
    value: '5',
    icon: Star,
  },
  {
    label: '4 Stars',
    value: '4',
    icon: Star,
  },
  {
    label: '3 Stars',
    value: '3',
    icon: Star,
  },
  {
    label: '2 Stars',
    value: '2',
    icon: Star,
  },
  {
    label: '1 Star',
    value: '1',
    icon: Star,
  },
] as const;

const DataTableToolbar = ({
  table,
  filters,
  onFiltersChange,
  selectedRowCount,
  onBulkDelete,
}: DataTableToolbarProps) => {
  const isFiltered = filters.search || filters.status.length > 0 || filters.rating.length > 0;

  // Handle search input
  const handleSearchChange = (value: string) => {
    onFiltersChange({ search: value });
  };

  // Handle status filter change
  const handleStatusChange = (values: string[]) => {
    onFiltersChange({ status: values });
  };

  // Handle rating filter change
  const handleRatingChange = (values: string[]) => {
    onFiltersChange({ rating: values });
  };

  // Reset all filters
  const resetFilters = () => {
    onFiltersChange({
      search: '',
      status: [],
      rating: [],
    });
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {/* Search input */}
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search reviews..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="h-8 w-[150px] pl-9 lg:w-[250px]"
          />
        </div>

        {/* Status filter */}
        <DataTableFacetedFilter
          title="Status"
          options={statusOptions}
          selectedValues={filters.status}
          onSelectionChange={handleStatusChange}
        />

        {/* Rating filter */}
        <DataTableFacetedFilter
          title="Rating"
          options={ratingOptions}
          selectedValues={filters.rating}
          onSelectionChange={handleRatingChange}
        />

        {/* Reset filters button */}
        {isFiltered && (
          <Button variant="ghost" onClick={resetFilters} className="h-8 px-2 lg:px-3">
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {/* Bulk delete button */}
        {selectedRowCount > 0 && (
          <Button variant="destructive" size="sm" onClick={onBulkDelete} className="h-8">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete ({selectedRowCount})
          </Button>
        )}

        {/* Column visibility toggle */}
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
};

export default DataTableToolbar;
