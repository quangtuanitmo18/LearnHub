'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Loader2 } from 'lucide-react';

import type { Cart, CartSummary, OrderDiscount } from '@/types/cart';
import type { ICoupon } from '@/types/coupon';
import CouponCard from './coupon-card';
import ManualDiscountInput from './manual-discount-input';

import { formatPrice } from '@/utils/format';

interface DiscountDrawerProps {
  cart: Cart;
  summary: CartSummary;
  appliedDiscount: OrderDiscount | null;
  manualDiscountCode: string;
  applyingCouponCode: string;
  selectedDiscountCode: string;
  coupons: ICoupon[];
  isCouponsLoading: boolean;
  onManualDiscountCodeChange: (code: string) => void;
  onApplyDiscount: (code: string) => void;
  onRemoveDiscount: () => void;
  onCheckout: () => void;
  onCloseDrawer: () => void;
}

// Discount drawer component - Arrow function
const DiscountDrawer = ({
  cart,
  summary,
  appliedDiscount,
  manualDiscountCode,
  applyingCouponCode,
  selectedDiscountCode,
  coupons,
  isCouponsLoading,
  onManualDiscountCodeChange,
  onApplyDiscount,
  onRemoveDiscount,
  onCheckout,
  onCloseDrawer,
}: DiscountDrawerProps) => {
  const handleContinue = () => {
    onCloseDrawer();
    onCheckout();
  };

  return (
    <SheetContent className="flex h-full w-full flex-col px-4 sm:max-w-lg sm:px-6">
      <SheetHeader className="shrink-0 px-0">
        <SheetTitle className="text-left text-base sm:text-lg">Discount Codes</SheetTitle>
      </SheetHeader>

      <div className="mt-4 flex flex-1 flex-col space-y-4 overflow-hidden px-0 sm:mt-6 sm:space-y-6">
        {/* Manual Code Input */}
        <ManualDiscountInput
          manualDiscountCode={manualDiscountCode}
          isApplyingDiscount={
            applyingCouponCode === manualDiscountCode && manualDiscountCode.length > 0
          }
          onManualDiscountCodeChange={onManualDiscountCodeChange}
          onApplyDiscount={onApplyDiscount}
        />

        {/* Available Discount Vouchers */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <h3 className="mb-3 shrink-0 text-xs font-medium text-gray-700 sm:mb-4 sm:text-sm">
            Our discount codes
          </h3>

          <ScrollArea className="h-full flex-1">
            <div className="pr-4">
              {isCouponsLoading && (
                <div className="flex items-center justify-center py-6 sm:py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400 sm:h-6 sm:w-6" />
                  <span className="ml-2 text-xs text-gray-500 sm:text-sm">Loading coupons...</span>
                </div>
              )}

              {!isCouponsLoading && coupons.length === 0 && (
                <div className="py-6 text-center sm:py-8">
                  <p className="text-xs text-gray-500 sm:text-sm">No discount codes available</p>
                </div>
              )}

              {coupons.length > 0 && (
                <div className="mb-10 space-y-3 sm:space-y-4">
                  {coupons.map((coupon) => (
                    <CouponCard
                      key={coupon.id}
                      coupon={coupon}
                      cart={cart}
                      selectedDiscountCode={selectedDiscountCode}
                      isApplyingDiscount={applyingCouponCode === coupon.code}
                      onApplyDiscount={onApplyDiscount}
                      onRemoveDiscount={onRemoveDiscount}
                    />
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Summary Footer */}
      {appliedDiscount && (
        <div className="-mx-4 shrink-0 border-t px-4 pt-3 sm:-mx-6 sm:px-6 sm:pt-4">
          <div className="rounded-lg bg-green-50 p-3 sm:p-4">
            <div className="mb-1.5 flex items-center justify-between sm:mb-2">
              <span className="text-sm font-semibold text-green-800 sm:text-base">
                {formatPrice(summary.total)}
              </span>
            </div>
            <div className="text-xs text-green-600 sm:text-sm">
              You save {formatPrice(summary.discountAmount)}
            </div>
            <Button
              className="mt-2 h-10 w-full text-sm sm:mt-3 sm:h-11 sm:text-base"
              onClick={handleContinue}
            >
              Continue
            </Button>
          </div>
        </div>
      )}
    </SheetContent>
  );
};

export default DiscountDrawer;
