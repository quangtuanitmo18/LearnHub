'use client';

import { Tag, ChevronRight } from 'lucide-react';

// Discount trigger component - Arrow function
const DiscountTrigger = () => {
  return (
    <button className="group w-full overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 p-3 transition-all duration-300 hover:border-blue-300 hover:shadow-md sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 shadow-sm transition-shadow duration-300 group-hover:shadow-md sm:h-10 sm:w-10">
            <Tag className="h-4 w-4 text-white sm:h-5 sm:w-5" />
          </div>
          <div className="min-w-0 text-left">
            <div className="truncate text-xs font-semibold text-gray-900 sm:text-sm">
              Apply Discount Code
            </div>
            <div className="hidden truncate text-[10px] text-gray-600 sm:block sm:text-xs">
              Browse available coupons or enter code
            </div>
            <div className="truncate text-[10px] text-gray-600 sm:hidden sm:text-xs">
              Browse or enter code
            </div>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-blue-600 transition-transform duration-300 group-hover:translate-x-1 sm:h-5 sm:w-5" />
      </div>
    </button>
  );
};

export default DiscountTrigger;
