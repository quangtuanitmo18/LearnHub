'use client';

import dynamic from 'next/dynamic';

// Dynamic import for data-heavy content (includes header with actual data)
const OrdersContent = dynamic(() => import('./components/orders-content'), {
  loading: () => (
    <div className="animate-pulse space-y-4 sm:space-y-6">
      {/* Header skeleton */}
      <div className="mb-4 sm:mb-6">
        <div className="mb-2 flex items-center gap-2 sm:gap-3">
          <div className="h-8 w-8 rounded-lg bg-linear-to-br from-blue-500 to-blue-600 sm:h-10 sm:w-10 sm:rounded-xl"></div>
          <div>
            <div className="mb-2 h-6 w-32 rounded bg-gray-200 sm:h-8 sm:w-48"></div>
            <div className="h-3 w-48 rounded bg-gray-200 sm:h-4 sm:w-64"></div>
          </div>
        </div>
      </div>
      {/* Content skeleton */}
      <div className="space-y-3 sm:space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 rounded-lg bg-gray-200 sm:h-32"></div>
        ))}
      </div>
    </div>
  ),
});

// Main my orders page - Arrow function
const MyOrdersPage = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6">
        {/* Progressive loading with proper data and SEO */}
        <OrdersContent />
      </div>
    </div>
  );
};

export default MyOrdersPage;
