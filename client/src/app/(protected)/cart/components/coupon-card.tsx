'use client';

import { Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

import CouponConditionsDialog from './coupon-conditions-dialog';
import { useState } from 'react';
import dayjs from 'dayjs';
import type { ICoupon } from '@/types/coupon';
import type { Cart } from '@/types/cart';
import { formatPrice } from '@/utils/format';

const isCouponApplicable = (coupon: ICoupon, cart: Cart): boolean => {
  // If courseIds is empty or undefined, coupon applies to entire cart (always applicable)
  if (!coupon.courseIds || coupon.courseIds.length === 0) {
    return true;
  }

  // For specific courses, check if any courses in cart match the coupon's courseIds
  const cartCourseIds = cart.items.map((item) => item.courseId.id);

  const couponCourseIds = coupon.courseIds.map((course) => course.id);

  // all cartCourseIds must be in couponCourseIds
  return cartCourseIds.every((courseId: string) => couponCourseIds.includes(courseId));
  // return couponCourseIds.some((courseId: string) =>
  // 	cartCourseIds.includes(courseId)
  // );
};

interface CouponCardProps {
  coupon: ICoupon;
  cart: Cart;
  selectedDiscountCode: string;
  isApplyingDiscount: boolean;
  onApplyDiscount: (code: string) => void;
  onRemoveDiscount: () => void;
}

// Coupon card component - Arrow function
const CouponCard = ({
  coupon,
  cart,
  selectedDiscountCode,
  isApplyingDiscount,
  onApplyDiscount,
  onRemoveDiscount,
}: CouponCardProps) => {
  const [showConditions, setShowConditions] = useState(false);
  const expiryDate = dayjs(coupon.endDate).format('DD/MM/YYYY');
  const isApplicable = isCouponApplicable(coupon, cart);

  return (
    <>
      <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
        {/* Hot Badge */}
        <div className="absolute top-0 left-0">
          <div className="relative overflow-hidden rounded-br-lg bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 px-2 py-0.5 text-white sm:px-3 sm:py-1">
            {/* Animated background pattern like header */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0 -skew-x-12 transform animate-pulse bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            </div>
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="text-[10px] font-bold sm:text-xs">HOT DISCOUNT</div>
              <div className="text-base leading-none font-bold sm:text-lg">
                {coupon.discountType === 'percent'
                  ? `${coupon.discountValue}%`
                  : `${formatPrice(coupon.discountValue)}`}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-3 pt-10 pb-2.5 sm:px-4 sm:pt-12 sm:pb-3">
          {/* Coupon Code */}
          <div className="mb-1.5 sm:mb-2">
            <h3 className="mb-0.5 truncate text-sm font-bold text-gray-900 sm:text-base">
              {coupon.code}
            </h3>
            <p className="line-clamp-2 text-xs text-gray-600 sm:text-sm">{coupon.title} </p>
          </div>

          {/* Bottom Section */}
          <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center sm:gap-0">
            {/* Expiry Date */}
            <div className="flex items-center text-xs text-gray-500 sm:text-sm">
              <Clock className="mr-1 h-3 w-3 shrink-0 sm:h-4 sm:w-4" />
              <span className="truncate">Expires: {expiryDate}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex w-full items-center space-x-1.5 sm:w-auto sm:space-x-2">
              <button
                onClick={() => setShowConditions(true)}
                className="text-xs font-medium whitespace-nowrap text-blue-600 underline hover:text-blue-700 sm:text-sm"
              >
                Conditions
              </button>

              {selectedDiscountCode === coupon.code ? (
                <Button
                  variant="outline"
                  onClick={onRemoveDiscount}
                  className="h-8 flex-1 border-red-200 text-xs text-red-600 hover:bg-red-50 sm:h-9 sm:flex-none sm:text-sm"
                  size="sm"
                >
                  Remove
                </Button>
              ) : (
                <Button
                  onClick={() => onApplyDiscount(coupon.code)}
                  disabled={isApplyingDiscount || !isApplicable}
                  className="group relative h-8 flex-1 overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 text-xs text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:via-blue-800 hover:to-purple-700 hover:shadow-xl disabled:bg-gray-400 sm:h-9 sm:flex-none sm:text-sm"
                  size="sm"
                >
                  {/* Animated shine effect like header */}
                  <div className="absolute inset-0 translate-x-[-100%] -skew-x-12 transform bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-[100%]"></div>
                  <span className="relative z-10">
                    {isApplyingDiscount ? (
                      <div className="flex items-center justify-center gap-0.5 sm:gap-1">
                        <Loader2 className="mr-1 h-3 w-3 animate-spin sm:mr-2 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Applying...</span>
                        <span className="sm:hidden">...</span>
                      </div>
                    ) : !isApplicable ? (
                      <>
                        <span className="hidden sm:inline">Not applicable</span>
                        <span className="sm:hidden">N/A</span>
                      </>
                    ) : (
                      'Apply'
                    )}
                  </span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Conditions Dialog */}
      <CouponConditionsDialog
        coupon={coupon}
        isOpen={showConditions}
        onClose={() => setShowConditions(false)}
      />
    </>
  );
};

export default CouponCard;
