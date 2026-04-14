'use client';

import AdminHeading from '@/components/admin/admin-heading';
import { ProtectedRoute } from '@/components/auth/protected-route';
import DataTableSkeleton from '@/components/table/data-table-skeleton';
import { Button } from '@/components/ui/button';
import { OPERATIONS, RESOURCES } from '@/configs/permission';
import { usePermissions } from '@/hooks/use-permissions';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { MdAdd } from 'react-icons/md';

const ContestsTable = dynamic(() => import('./components/contests-table'), {
  loading: () => <DataTableSkeleton />,
  ssr: false,
});

const ContestsActionDialog = dynamic(() => import('./components/contests-action-dialog'), {
  ssr: false,
});

const ContestsPage = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { CREATE } = usePermissions(RESOURCES.CONTEST, [OPERATIONS.CREATE]);

  const handleCreateClick = () => {
    setCreateDialogOpen(true);
  };

  return (
    <ProtectedRoute resource={RESOURCES.CONTEST} action={OPERATIONS.READ}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <AdminHeading title="Contests" description="Manage contests and competitions" />
          {CREATE && (
            <Button onClick={handleCreateClick}>
              <MdAdd className="mr-2 h-4 w-4" />
              Add Contest
            </Button>
          )}
        </div>

        <ContestsTable />

        {CREATE && createDialogOpen && (
          <ContestsActionDialog
            mode="create"
            open={createDialogOpen}
            onOpenChange={setCreateDialogOpen}
          />
        )}
      </div>
    </ProtectedRoute>
  );
};

export default ContestsPage;
