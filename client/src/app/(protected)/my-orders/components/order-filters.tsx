import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter } from 'lucide-react';

interface OrderFiltersProps {
  statusFilter: string;
  ordersCount: number;
  totalOrders: number;
  onStatusChange: (value: string) => void;
}

// Order filters component - Arrow function
const OrderFilters = ({
  statusFilter,
  ordersCount,
  totalOrders,
  onStatusChange,
}: OrderFiltersProps) => {
  return (
    <Card className="mb-4 border-0 bg-white/70 shadow-md backdrop-blur-sm sm:mb-6">
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex w-full flex-col items-start gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="rounded-lg bg-blue-50 p-1.5 sm:p-2">
                <Filter className="h-3.5 w-3.5 text-blue-600 sm:h-4 sm:w-4" />
              </div>
              <span className="text-xs font-semibold text-gray-700 sm:text-sm">Filters</span>
            </div>

            <div className="flex w-full items-center gap-2 sm:w-auto sm:gap-3">
              <Select value={statusFilter} onValueChange={onStatusChange}>
                <SelectTrigger className="h-9 w-full border-gray-200 text-xs focus:border-blue-500 focus:ring-blue-500 sm:h-10 sm:w-[160px] sm:text-sm md:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending payment</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {ordersCount > 0 && (
            <div className="self-start rounded-lg bg-gray-50 px-2.5 py-1.5 sm:self-auto sm:px-3 sm:py-2">
              <span className="text-xs font-medium whitespace-nowrap text-gray-600 sm:text-sm">
                {ordersCount} / {totalOrders || 0} orders
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderFilters;
