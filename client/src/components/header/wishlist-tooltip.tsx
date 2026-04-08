'use client';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger } from '@/components/ui/tooltip';
import { ROUTE_CONFIG } from '@/configs/routes';
import { useMyWishlist } from '@/hooks/use-wishlist';
import { cn } from '@/lib/utils';
import { useIsAuthenticated } from '@/stores/auth-store';
import { formatPrice } from '@/utils/format';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { Heart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// Custom TooltipContent with proper arrow styling
function CustomTooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-[--radix-tooltip-content-transform-origin] rounded-md px-3 py-1.5 text-sm text-gray-900 shadow-lg',
          className,
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow
          className="fill-white stroke-gray-200 stroke-1"
          style={{
            fill: 'white',
            stroke: 'rgb(229, 231, 235)',
            strokeWidth: '1px',
          }}
        />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export default function WishlistTooltip() {
  const isAuthenticated = useIsAuthenticated();
  // Ensure we only fetch when authenticated. Since we might just need recent 5 items for tooltip:
  const { data: wishlistData, isLoading: wishlistLoading } = useMyWishlist({ limit: 5 });

  const wishlistItems = isAuthenticated && wishlistData ? wishlistData.items || [] : [];
  const totalCount =
    isAuthenticated && wishlistData?.meta?.total ? wishlistData.meta.total : wishlistItems.length;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="group relative h-8 w-8 rounded-full border border-transparent p-0 text-gray-500 transition-all duration-300 hover:border-red-100 hover:bg-linear-to-br hover:from-red-50 hover:via-red-100/50 hover:to-pink-50 hover:text-red-600 hover:shadow-lg hover:shadow-red-200/20 focus:outline-none sm:h-10 sm:w-10"
          asChild
        >
          <Link
            href={isAuthenticated ? ROUTE_CONFIG.WISHLIST : ROUTE_CONFIG.AUTH.SIGN_IN}
            aria-label={
              isAuthenticated ? `Wishlist with ${totalCount} items` : 'Sign in to view wishlist'
            }
          >
            <div className="absolute inset-0 rounded-full bg-linear-to-br from-red-500/0 to-pink-500/0 transition-all duration-300 group-hover:from-red-500/8 group-hover:to-pink-500/8"></div>
            <Heart
              size={16}
              className="relative z-10 transition-transform duration-300 group-hover:scale-110 sm:h-[18px] sm:w-[18px]"
            />
            {isAuthenticated && totalCount > 0 && (
              <span className="absolute -top-1 -right-1 z-20 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-[10px] font-semibold text-white shadow-lg sm:top-0 sm:right-0 sm:h-4 sm:w-4">
                {totalCount > 99 ? '99+' : totalCount}
              </span>
            )}
          </Link>
        </Button>
      </TooltipTrigger>
      <CustomTooltipContent side="bottom" className="hidden w-72 p-0 sm:block sm:w-80">
        <div className="max-h-96 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
          {!isAuthenticated ? (
            <div className="p-6 text-center">
              <Heart className="mx-auto mb-3 h-12 w-12 text-gray-300" />
              <p className="font-medium text-gray-500">Sign in to view your wishlist</p>
              <p className="mt-1 mb-4 text-sm text-gray-400">
                Save courses and track your learning progress
              </p>
              <Button className="w-full bg-red-600 text-white hover:bg-red-700" size="sm" asChild>
                <Link href={ROUTE_CONFIG.AUTH.SIGN_IN} aria-label="Sign in to your account">
                  Sign In
                </Link>
              </Button>
            </div>
          ) : wishlistLoading ? (
            <div className="p-4 text-center text-gray-500">Loading wishlist...</div>
          ) : wishlistItems.length === 0 ? (
            <div className="p-6 text-center">
              <Heart className="mx-auto mb-3 h-12 w-12 text-gray-300" />
              <p className="font-medium text-gray-500">Your wishlist is empty</p>
              <p className="mt-1 text-sm text-gray-400">Save some courses you like</p>
            </div>
          ) : (
            <>
              <div className="border-b border-gray-100 p-3">
                <h3 className="font-semibold text-gray-900">Wishlist</h3>
                <p className="text-sm text-gray-500">
                  {totalCount} item{totalCount !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {wishlistItems.map((item: any) => {
                  const imageUrl = item.image
                    ? `${item.image.cdnBaseUrl}/${item.image.storageKey}`
                    : null;
                  return (
                    <div key={item.id} className="border-b border-gray-50 p-3 last:border-b-0">
                      <div className="flex items-center gap-3">
                        <div className="relative h-8 w-12 shrink-0 overflow-hidden rounded bg-gray-100">
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt={item.title}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-red-500 to-pink-600">
                              <span className="text-xs text-white">❤️</span>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link href={`/courses/${item.slug}`} className="hover:underline">
                            <h4 className="line-clamp-1 text-sm font-medium text-gray-900">
                              {item.title}
                            </h4>
                          </Link>
                          <div className="mt-1 flex items-center gap-2">
                            {item.oldPrice && item.oldPrice > item.price && (
                              <span className="text-xs text-gray-400 line-through">
                                {formatPrice(item.oldPrice)}
                              </span>
                            )}
                            {item.isFree ? (
                              <span className="text-sm font-bold text-green-600">Free</span>
                            ) : (
                              <span className="text-sm font-semibold text-gray-900">
                                {formatPrice(item.price)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-gray-100 bg-gray-50 p-3">
                <Button
                  className="w-full bg-red-600 text-white shadow-md hover:bg-red-700 hover:shadow-lg hover:shadow-red-500/20"
                  size="sm"
                  asChild
                >
                  <Link
                    href={isAuthenticated ? ROUTE_CONFIG.WISHLIST : ROUTE_CONFIG.AUTH.SIGN_IN}
                    aria-label="View full wishlist"
                  >
                    View Wishlist
                  </Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </CustomTooltipContent>
    </Tooltip>
  );
}
