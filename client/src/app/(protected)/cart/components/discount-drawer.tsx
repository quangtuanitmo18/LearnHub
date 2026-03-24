"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Loader2 } from "lucide-react";

import type { Cart, CartSummary, OrderDiscount } from "@/types/cart";
import type { ICoupon } from "@/types/coupon";
import CouponCard from "./coupon-card";
import ManualDiscountInput from "./manual-discount-input";

import { formatPrice } from "@/utils/format";

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
    <SheetContent className="w-full sm:max-w-lg px-4 sm:px-6 flex flex-col h-full">
      <SheetHeader className="px-0 shrink-0">
        <SheetTitle className="text-left text-base sm:text-lg">
          Discount Codes
        </SheetTitle>
      </SheetHeader>

      <div className="mt-4 sm:mt-6 space-y-4 sm:space-y-6 px-0 flex-1 flex flex-col overflow-hidden">
        {/* Manual Code Input */}
        <ManualDiscountInput
          manualDiscountCode={manualDiscountCode}
          isApplyingDiscount={
            applyingCouponCode === manualDiscountCode &&
            manualDiscountCode.length > 0
          }
          onManualDiscountCodeChange={onManualDiscountCodeChange}
          onApplyDiscount={onApplyDiscount}
        />

        {/* Available Discount Vouchers */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <h3 className="text-xs sm:text-sm font-medium text-gray-700 mb-3 sm:mb-4 shrink-0">
            Our discount codes
          </h3>

          <ScrollArea className="flex-1  h-full">
            <div className="pr-4">
              {isCouponsLoading && (
                <div className="flex items-center justify-center py-6 sm:py-8">
                  <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-gray-400" />
                  <span className="ml-2 text-xs sm:text-sm text-gray-500">
                    Loading coupons...
                  </span>
                </div>
              )}

              {!isCouponsLoading && coupons.length === 0 && (
                <div className="text-center py-6 sm:py-8">
                  <p className="text-xs sm:text-sm text-gray-500">
                    No discount codes available
                  </p>
                </div>
              )}

              {coupons.length > 0 && (
                <div className="space-y-3 mb-10 sm:space-y-4">
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
        <div className="border-t pt-3 sm:pt-4 shrink-0 -mx-4 sm:-mx-6 px-4 sm:px-6">
          <div className="bg-green-50 rounded-lg p-3 sm:p-4">
            <div className="flex justify-between items-center mb-1.5 sm:mb-2">
              <span className="font-semibold text-sm sm:text-base text-green-800">
                {formatPrice(summary.total)}
              </span>
            </div>
            <div className="text-xs sm:text-sm text-green-600">
              You save {formatPrice(summary.discountAmount)}
            </div>
            <Button
              className="w-full mt-2 sm:mt-3 h-10 sm:h-11 text-sm sm:text-base"
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
