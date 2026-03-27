'use client';

import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ManualDiscountInputProps {
  manualDiscountCode: string;
  isApplyingDiscount: boolean;
  onManualDiscountCodeChange: (code: string) => void;
  onApplyDiscount: (code: string) => void;
}

// Manual discount input component - Arrow function
const ManualDiscountInput = ({
  manualDiscountCode,
  isApplyingDiscount,
  onManualDiscountCodeChange,
  onApplyDiscount,
}: ManualDiscountInputProps) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onApplyDiscount(manualDiscountCode);
    }
  };

  return (
    <div>
      <h3 className="mb-2 text-xs font-medium text-gray-700 sm:mb-3 sm:text-sm">
        Enter discount code
      </h3>
      <div className="flex gap-1.5 sm:gap-2">
        <Input
          placeholder="Enter code"
          value={manualDiscountCode}
          onChange={(e) => onManualDiscountCodeChange(e.target.value.toUpperCase())}
          className="h-9 flex-1 text-xs sm:h-10 sm:text-sm"
          onKeyPress={handleKeyPress}
        />
        <Button
          onClick={() => onApplyDiscount(manualDiscountCode)}
          disabled={isApplyingDiscount || !manualDiscountCode.trim()}
          className="h-9 px-3 text-xs sm:h-10 sm:px-4 sm:text-sm"
        >
          {isApplyingDiscount ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin sm:h-4 sm:w-4" />
          ) : (
            'Apply'
          )}
        </Button>
      </div>
    </div>
  );
};

export default ManualDiscountInput;
