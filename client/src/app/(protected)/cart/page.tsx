'use client';

import dynamic from 'next/dynamic';
import * as React from 'react';
import Loader from '@/components/loader';
import { useCart } from '@/hooks/use-cart';
import { Checkbox } from '@/components/ui/checkbox';
import { ShoppingCart } from 'lucide-react';

// Dynamic imports for cart components (user-specific, interactive)
const CartItemComponent = dynamic(() => import('./components/cart-item'), {
  ssr: false,
});

const CartSummary = dynamic(() => import('./components/cart-summary'), {
  ssr: false,
});

const EmptyCart = dynamic(() => import('./components/empty-cart'), {
  ssr: false,
});

// Main cart page - Arrow function
const CartPage = () => {
  const { data: cart, isLoading } = useCart();
  const [selectedCourseIds, setSelectedCourseIds] = React.useState<string[]>([]);

  // Initialize all items as selected when cart data changes
  React.useEffect(() => {
    if (cart?.items) {
      setSelectedCourseIds(cart.items.map((item) => item.course.id));
    }
  }, [cart?.items]);

  const handleToggleSelection = (courseId: string) => {
    setSelectedCourseIds((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId],
    );
  };

  const handleSelectAll = () => {
    if (cart?.items) {
      if (selectedCourseIds.length === cart.items.length) {
        setSelectedCourseIds([]);
      } else {
        setSelectedCourseIds(cart.items.map((item) => item.course.id));
      }
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-6xl">
          <EmptyCart />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="flex items-center gap-2 text-2xl font-bold sm:gap-3 sm:text-3xl">
            <ShoppingCart className="h-6 w-6 sm:h-8 sm:w-8" />
            Shopping Cart
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:mt-2 sm:text-base">
            Review and manage your selected courses ({cart.items.length}{' '}
            {cart.items.length === 1 ? 'item' : 'items'})
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="space-y-3 sm:space-y-4 lg:col-span-2">
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md sm:rounded-xl sm:shadow-lg">
              <div className="border-b border-gray-100 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">Course Items</h2>
                    <p className="mt-1 text-xs text-gray-600 sm:text-sm">
                      Lifetime access to all course materials
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="select-all"
                      checked={
                        selectedCourseIds.length === cart.items.length && cart.items.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                    <label htmlFor="select-all" className="cursor-pointer text-sm font-medium">
                      Select All
                    </label>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {cart.items.map((item) => (
                  <div key={item.course.id} className="px-3 py-2 sm:px-6 sm:py-4">
                    <CartItemComponent
                      item={item}
                      isSelected={selectedCourseIds.includes(item.course.id)}
                      onToggleSelection={handleToggleSelection}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <CartSummary cart={cart} selectedCourseIds={selectedCourseIds} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
