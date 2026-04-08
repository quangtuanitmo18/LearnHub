'use client';

import dynamic from 'next/dynamic';

import { HeaderLogo } from '../header/header-logo';
import { DesktopNavigation } from '../header/desktop-navigation';
import { NotificationBar } from '../header/notification-bar';

// Dynamically import interactive components that don't need immediate rendering
// These components require user interaction, so we can defer their loading
const MobileMenu = dynamic(() => import('../header/mobile-menu'), {
  ssr: false,
  loading: () => <div className="h-10 w-10 animate-pulse rounded bg-gray-200 p-0 lg:hidden" />,
});

const SearchDialog = dynamic(() => import('../header/search-dialog'), {
  ssr: false,
  loading: () => <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200 sm:h-10 sm:w-10" />,
});

const NotificationPopover = dynamic(() => import('../header/notification-popover'), {
  ssr: false,
  loading: () => <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200 sm:h-10 sm:w-10" />,
});

const CartTooltip = dynamic(() => import('../header/cart-tooltip'), {
  ssr: false,
  loading: () => <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200 sm:h-10 sm:w-10" />,
});

const WishlistTooltip = dynamic(() => import('../header/wishlist-tooltip'), {
  ssr: false,
  loading: () => <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200 sm:h-10 sm:w-10" />,
});

const AuthSection = dynamic(() => import('../header/auth-section'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center gap-1 sm:gap-2">
      <div className="h-8 w-16 animate-pulse rounded-xl bg-gray-200 sm:h-10 sm:w-20" />
      <div className="h-8 w-20 animate-pulse rounded-xl bg-gray-200 sm:h-10 sm:w-28" />
    </div>
  ),
});

function MainHeader() {
  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Enhanced background with gradient and glass effect */}
      <div className="absolute inset-0 bg-linear-to-br from-white via-blue-50/30 to-purple-50/20 backdrop-blur-xl"></div>
      <div className="absolute inset-0 bg-white/90 backdrop-blur-xl"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-purple-500/5"></div>

      {/* Subtle border with gradient */}
      <div className="absolute right-0 bottom-0 left-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

      {/* Content container */}
      <div className="relative z-10">
        {/* Top notification bar */}
        <NotificationBar />

        {/* Main header */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-2 sm:h-18 sm:gap-4 lg:gap-6">
            {/* Mobile Menu Button & Logo Container */}
            <div className="flex items-center gap-3">
              <MobileMenu />
              <HeaderLogo />
            </div>

            {/* Desktop Navigation */}
            <DesktopNavigation />

            {/* Actions */}
            <div className="flex min-w-fit items-center gap-1 sm:gap-2 lg:gap-3">
              <SearchDialog />
              <NotificationPopover />
              <WishlistTooltip />
              <CartTooltip />
              <AuthSection />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default MainHeader;
