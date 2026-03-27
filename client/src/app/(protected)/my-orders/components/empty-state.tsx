import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, ShoppingBag } from 'lucide-react';

interface EmptyStateProps {
  onExplore: () => void;
}

// Empty state component - Arrow function
const EmptyState = ({ onExplore }: EmptyStateProps) => {
  return (
    <Card className="border-0 bg-linear-to-br from-white to-gray-50 shadow-md sm:shadow-lg">
      <CardContent className="p-8 text-center sm:p-12">
        <div className="relative mb-4 sm:mb-6">
          <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-blue-100 to-blue-200 sm:mb-4 sm:h-24 sm:w-24">
            <Package className="h-10 w-10 text-blue-600 sm:h-12 sm:w-12" />
          </div>
          <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400 sm:-top-2 sm:-right-2 sm:h-6 sm:w-6">
            <span className="text-[10px] sm:text-xs">!</span>
          </div>
        </div>
        <h3 className="mb-2 text-lg font-bold text-gray-900 sm:text-xl">No orders yet</h3>
        <p className="mx-auto mb-4 max-w-md px-4 text-xs leading-relaxed text-gray-600 sm:mb-6 sm:px-0 sm:text-sm md:text-base">
          You don&apos;t have any orders yet. Explore and enroll in amazing courses to start your
          learning journey!
        </p>
        <Button
          onClick={onExplore}
          className="h-10 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl sm:h-11 sm:px-6 sm:text-base"
        >
          <ShoppingBag className="mr-1.5 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" />
          Explore courses
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmptyState;
