'use client';

import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CheckoutActionsProps {
  isCheckoutPending: boolean;
  onCheckout: () => void;
}

// Checkout actions component - Arrow function
const CheckoutActions = ({ isCheckoutPending, onCheckout }: CheckoutActionsProps) => {
  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Checkout Button */}
      <Button
        onClick={onCheckout}
        disabled={isCheckoutPending}
        className="h-11 w-full transform rounded-lg border border-transparent bg-gradient-to-r from-blue-600 to-purple-600 py-3 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:border-blue-300 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl sm:h-auto sm:rounded-xl sm:py-4 sm:text-base"
        size="lg"
      >
        {isCheckoutPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">Creating Order...</span>
            <span className="sm:hidden">Processing...</span>
          </>
        ) : (
          <>
            <span className="hidden sm:inline">Proceed to Checkout</span>
            <span className="sm:hidden">Checkout</span>
          </>
        )}
      </Button>

      {/* Security Notice */}
      <p className="text-center text-[10px] text-gray-500 sm:text-xs">
        🔒 Secure checkout • 30-day money-back guarantee
      </p>
    </div>
  );
};

export default CheckoutActions;
