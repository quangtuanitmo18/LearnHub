"use client";

import Image from "next/image";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { formatPrice } from "@/utils/format";
import { useRemoveFromCart } from "@/hooks/use-cart";
import type { CartItem } from "@/types/cart";

interface CartItemProps {
  item: CartItem;
  isSelected: boolean;
  onToggleSelection: (courseId: string) => void;
}

// Cart item component - Arrow function
const CartItemComponent = ({
  item,
  isSelected,
  onToggleSelection,
}: CartItemProps) => {
  const removeFromCart = useRemoveFromCart();

  const handleRemove = () => {
    removeFromCart.mutate(item.id);
  };

  return (
    <div className="group flex items-start gap-3 sm:gap-4 rounded-lg border border-transparent p-2 sm:p-3 hover:border-border/60 hover:bg-muted/30">
      {/* Checkbox */}
      <div className="pt-1">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelection(item.course.id)}
          id={`checkbox-${item.course.id}`}
          aria-label={`Select ${item.title}`}
        />
      </div>

      {/* Thumbnail */}
      <div className="relative h-14 w-20 sm:h-16 sm:w-24 overflow-hidden rounded-md bg-muted ring-1 ring-border/40 shrink-0">
        {item.thumbnail ? (
          <Image
            src={item.thumbnail}
            alt={item.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 80px, 96px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-blue-500 to-purple-600">
            <span className="text-[10px] sm:text-xs font-medium text-white">
              Course
            </span>
          </div>
        )}
      </div>

      {/* Title + pricing */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-semibold leading-snug line-clamp-2">
              {item.title}
            </h3>
          </div>

          <div className="shrink-0 text-right">
            {item.oldPrice && item.oldPrice > item.price ? (
              <div className="flex items-center justify-end gap-2">
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(item.oldPrice)}
                </span>
                <span className="rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-xs font-semibold border border-red-200">
                  {Math.round(
                    ((item.oldPrice - item.price) / item.oldPrice) * 100
                  )}
                  % OFF
                </span>
              </div>
            ) : null}
            <div className="mt-1 text-base sm:text-lg font-semibold text-gray-900 tabular-nums">
              {formatPrice(item.price)}
            </div>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={removeFromCart.isPending}
            aria-label={`Remove ${item.title} from cart`}
            className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            {removeFromCart.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            <span className="ml-2 hidden sm:inline">Remove</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartItemComponent;
