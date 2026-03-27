'use client';

import dynamic from 'next/dynamic';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { RESOURCES, OPERATIONS } from '@/configs/permission';
import AdminHeading from '@/components/admin/admin-heading';
import DataTableSkeleton from '@/components/table/data-table-skeleton';

const ReviewsTable = dynamic(() => import('./components/reviews-table'), {
  loading: () => <DataTableSkeleton />,
  ssr: false,
});

const ReviewsPage = () => {
  return (
    <ProtectedRoute resource={RESOURCES.REVIEW} action={OPERATIONS.READ}>
      <div className="space-y-6">
        <AdminHeading title="Reviews" description="Manage course reviews and review status" />

        <ReviewsTable />
      </div>
    </ProtectedRoute>
  );
};

export default ReviewsPage;
