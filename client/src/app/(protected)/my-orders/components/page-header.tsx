import { ShoppingBag } from 'lucide-react';

interface PageHeaderProps {
  ordersCount: number;
}

// Page header component - Arrow function
const PageHeader = ({ ordersCount }: PageHeaderProps) => {
  return (
    <div className="mb-4 sm:mb-6">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2 sm:mb-2 sm:gap-3">
            <div className="rounded-lg bg-linear-to-br from-blue-500 to-blue-600 p-1.5 shadow-md sm:rounded-xl sm:p-2">
              <ShoppingBag className="h-5 w-5 text-white sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-xl font-bold text-transparent sm:text-2xl md:text-3xl">
                My Orders
              </h1>
              <p className="hidden text-xs text-gray-500 sm:block sm:text-sm">
                Manage and track your orders easily
              </p>
            </div>
          </div>
        </div>
        {ordersCount > 0 && (
          <div className="shrink-0 text-right">
            <div className="text-lg font-bold text-gray-900 sm:text-xl md:text-2xl">
              {ordersCount}
            </div>
            <div className="text-[10px] text-gray-500 sm:text-xs">orders</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
