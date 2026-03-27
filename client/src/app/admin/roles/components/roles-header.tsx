'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { MdSearch, MdSort, MdViewList, MdViewModule } from 'react-icons/md';

interface RolesHeaderProps {
  onSearchChange: (search: string) => void;
  onSortChange: (sort: string) => void;
  onViewChange: (view: 'grid' | 'list') => void;
  currentView: 'grid' | 'list';
}

const RolesHeader = ({
  onSearchChange,
  onSortChange,
  onViewChange,
  currentView,
}: RolesHeaderProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onSearchChange(value);
  };

  return (
    <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      {/* Search */}
      <div className="relative max-w-sm flex-1">
        <MdSearch className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
        <Input
          placeholder="Search roles..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Sort */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <MdSort className="h-4 w-4" />
              Sort
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onSortChange('name')}>Name (A-Z)</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortChange('name-desc')}>
              Name (Z-A)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortChange('permissionsCount')}>
              Permissions Count (Low to High)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortChange('permissionsCount-desc')}>
              Permissions Count (High to Low)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortChange('createdAt')}>
              Date Created (Oldest)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortChange('createdAt-desc')}>
              Date Created (Newest)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* View Toggle */}
        <div className="flex rounded-lg border p-1">
          <Button
            variant={currentView === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewChange('grid')}
            className="px-3 py-1"
          >
            <MdViewModule className="h-4 w-4" />
          </Button>
          <Button
            variant={currentView === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewChange('list')}
            className="px-3 py-1"
          >
            <MdViewList className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RolesHeader;
