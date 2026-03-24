"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { useValidCoupons, useValidateCoupon } from "@/hooks/use-coupons";
import { useCreateOrder } from "@/hooks/use-orders";
import { useCreateStripeCheckout } from "@/hooks/use-payment";
import type { Cart, OrderDiscount } from "@/types/cart";
import type { ValidateCouponResponse } from "@/types/coupon";
import { PaymentMethod } from "@/types/order";
import { Banknote, CreditCard } from "lucide-react";
import CartTotals from "./cart-totals";
import CheckoutActions from "./checkout-actions";
import DiscountDrawer from "./discount-drawer";
import DiscountTrigger from "./discount-trigger";

import { ROUTE_CONFIG } from "@/configs/routes";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

interface CartSummaryProps {
  cart: Cart;
  selectedCourseIds: string[];
}

// Cart summary component - Arrow function
const CartSummary = ({ cart, selectedCourseIds }: CartSummaryProps) => {
  const [selectedDiscountCode, setSelectedDiscountCode] = useState<string>("");
  const [manualDiscountCode, setManualDiscountCode] = useState<string>("");
  const [appliedDiscount, setAppliedDiscount] = useState<OrderDiscount | null>(
    null
  );
  const [applyingCouponCode, setApplyingCouponCode] = useState<string>("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    PaymentMethod.STRIPE
  );
  const router = useRouter();

  const checkout = useCreateOrder();
  const createStripeCheckout = useCreateStripeCheckout();

  // Fetch valid coupons from API (/coupons/valid)
  const { data: couponsData, isLoading: isCouponsLoading } = useValidCoupons();
  const validateCoupon = useValidateCoupon();

  const summary = useMemo(() => {
    const selectedItems = cart.items.filter((item) =>
      selectedCourseIds.includes(item.course.id)
    );

    // Ensure all price values are proper numbers
    const subtotal = selectedItems.reduce((sum, item) => {
      const itemPrice = Number(item.price) || 0;
      return sum + itemPrice;
    }, 0);

    const discountAmount = Number(appliedDiscount?.discountAmount) || 0;
    const total = Math.max(0, subtotal - discountAmount);
    const itemCount = selectedItems.length;

    return {
      subtotal: Number(subtotal.toFixed(0)),
      discountAmount: Number(discountAmount.toFixed(0)),
      total: Number(total.toFixed(0)),
      itemCount,
    };
  }, [cart, appliedDiscount, selectedCourseIds]);

  const applyDiscountCode = (code: string) => {
    if (!code.trim()) return;

    setApplyingCouponCode(code.trim());

    // Validate coupon through API
    validateCoupon.mutate(
      {
        code: code.trim(),
        courseIds: selectedCourseIds,
      },
      {
        onSuccess: (response: ValidateCouponResponse) => {
          setAppliedDiscount({
            code: response.coupon.code,
            discountAmount: Number(response.discountAmount) || 0,
            appliedSuccessfully: response.valid,
          });
          setSelectedDiscountCode(response.coupon.code);
          setManualDiscountCode("");
          setApplyingCouponCode("");
        },
        onError: () => {
          setApplyingCouponCode("");
        },
      }
    );
  };

  const removeDiscount = () => {
    setAppliedDiscount(null);
    setSelectedDiscountCode("");
    setManualDiscountCode("");
    setApplyingCouponCode("");
    toast.success("Discount code removed");
  };

  const handleCheckout = () => {
    if (selectedCourseIds.length === 0) {
      toast.error("Please select at least one course to checkout");
      return;
    }

    checkout.mutate(
      {
        paymentMethod: selectedPaymentMethod,
        couponCode: appliedDiscount?.code,
        courseIds: selectedCourseIds,
      },
      {
        onSuccess: (response) => {
          // For Stripe payment, create checkout session and redirect to Stripe
          if (selectedPaymentMethod === PaymentMethod.STRIPE) {
            const orderCode = response?.code;
            if (!orderCode) {
              toast.error("Order code not found");
              return;
            }

            // Create Stripe checkout session
            createStripeCheckout.mutate(
              { orderCode },
              {
                onSuccess: (stripeResponse) => {
                  const sessionUrl = stripeResponse?.sessionUrl;
                  if (sessionUrl) {
                    // Redirect to Stripe checkout
                    window.location.href = sessionUrl;
                  } else {
                    toast.error("Failed to get checkout URL");
                  }
                },
              }
            );
          }
          // For other payment methods (bank transfer), redirect to internal payment page
          else if (response?.id) {
            const orderId = response.id;
            router.push(`${ROUTE_CONFIG.QR_PAYMENT}?orderid=${orderId}`);
          }
        },
      }
    );
  };

  const paymentMethods = [
    {
      id: PaymentMethod.STRIPE,
      name: "Card",
      description: "Payment with Stripe",
      icon: CreditCard,
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-700",
    },
    {
      id: PaymentMethod.BANK_TRANSFER,
      name: "Bank",
      description: "Direct bank transfer",
      icon: Banknote,
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-700",
    },
  ];

  if (cart.items.length === 0) {
    return (
      <Card className="sticky top-24">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-muted-foreground">Your cart is empty</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-md sm:shadow-lg lg:sticky lg:top-24">
      <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
        {/* Summary Header */}
        <div className="text-center pb-2 sm:pb-3 border-b border-gray-100">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-0.5 sm:mb-1">
            Order Summary
          </h3>
          <p className="text-[10px] sm:text-xs text-gray-600">
            Review your items and complete your purchase
          </p>
        </div>

        {/* Cart Totals */}
        <CartTotals
          summary={summary}
          appliedDiscount={appliedDiscount}
          onRemoveDiscount={removeDiscount}
        />

        {/* Discount Section */}
        <div className="space-y-2 sm:space-y-3">
          <h4 className="font-semibold text-gray-900 text-[10px] sm:text-xs">
            Have a discount code?
          </h4>
          <Sheet>
            <SheetTrigger asChild>
              <div>
                <DiscountTrigger />
              </div>
            </SheetTrigger>

            <DiscountDrawer
              cart={cart}
              summary={summary}
              appliedDiscount={appliedDiscount}
              manualDiscountCode={manualDiscountCode}
              applyingCouponCode={applyingCouponCode}
              selectedDiscountCode={selectedDiscountCode}
              coupons={couponsData || []}
              isCouponsLoading={isCouponsLoading}
              onManualDiscountCodeChange={setManualDiscountCode}
              onApplyDiscount={applyDiscountCode}
              onRemoveDiscount={removeDiscount}
              onCheckout={handleCheckout}
              onCloseDrawer={() => {}}
            />
          </Sheet>
        </div>

        {/* Payment Method Selection */}
        <div className="space-y-3 sm:space-y-4">
          <h4 className="font-semibold text-gray-900 text-xs sm:text-sm">
            Payment Method
          </h4>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              const isSelected = selectedPaymentMethod === method.id;

              return (
                <Button
                  key={method.id}
                  variant="outline"
                  className={`p-2 sm:p-3 h-auto min-h-[70px] sm:min-h-20 flex-col transition-all duration-200 relative group ${
                    isSelected
                      ? `${method.bgColor} ${method.borderColor} border-2 ${method.textColor} shadow-md`
                      : "bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300 hover:shadow-sm"
                  }`}
                  onClick={() => setSelectedPaymentMethod(method.id)}
                >
                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2">
                      <div
                        className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${method.textColor.replace(
                          "text-",
                          "bg-"
                        )}`}
                      />
                    </div>
                  )}

                  <div className="flex flex-col items-center gap-1.5 sm:gap-2">
                    <div
                      className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 ${
                        isSelected
                          ? `${method.bgColor} ${method.borderColor} border`
                          : "bg-gray-100 group-hover:bg-gray-200"
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 sm:h-6 sm:w-6 transition-colors duration-200 ${
                          isSelected ? method.textColor : "text-gray-600"
                        }`}
                      />
                    </div>
                    <div className="text-center">
                      <div
                        className={`font-semibold text-xs sm:text-sm transition-colors duration-200 ${
                          isSelected ? method.textColor : "text-gray-700"
                        }`}
                      >
                        {method.name}
                      </div>
                      <div
                        className={`text-[10px] sm:text-xs mt-0.5 sm:mt-1 transition-colors duration-200 ${
                          isSelected
                            ? method.textColor.replace("700", "600")
                            : "text-gray-500"
                        }`}
                      >
                        {method.description}
                      </div>
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Checkout Actions */}
        <div className="pt-2 sm:pt-3 border-t border-gray-100">
          <CheckoutActions
            isCheckoutPending={
              checkout.isPending || createStripeCheckout.isPending
            }
            onCheckout={handleCheckout}
          />
        </div>
      </div>
    </div>
  );
};

export default CartSummary;
