'use client';

import { UserNav } from '@/components/auth/user-nav';
import { Button } from '@/components/ui/button';
import { ROUTE_CONFIG } from '@/configs/routes';
import { useIsAuthenticated, useUser } from '@/stores/auth-store';
import { User } from 'lucide-react';
import Link from 'next/link';

export default function AuthSection() {
  const user = useUser();
  const isAuthenticated = useIsAuthenticated();

  if (isAuthenticated && user) {
    return <UserNav />;
  }

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <Button
        variant="ghost"
        size="sm"
        className="group relative h-8 rounded-xl border border-transparent px-2 font-semibold text-gray-600 transition-all duration-300 hover:border-blue-100 hover:bg-linear-to-br hover:from-blue-50 hover:via-blue-100/50 hover:to-purple-50 hover:text-blue-600 hover:shadow-lg hover:shadow-blue-200/20 focus:outline-none sm:h-10 sm:px-4"
        asChild
      >
        <Link href={ROUTE_CONFIG.AUTH.SIGN_IN} aria-label="Sign in to your account">
          <div className="absolute inset-0 rounded-xl bg-linear-to-br from-blue-500/0 to-purple-500/0 transition-all duration-300 group-hover:from-blue-500/8 group-hover:to-purple-500/8"></div>
          <User className="relative z-10 h-3 w-3 transition-transform duration-300 group-hover:scale-110 sm:mr-2 sm:h-4 sm:w-4" />
          <span className="relative z-10 hidden sm:inline">Sign In</span>
        </Link>
      </Button>
      <Button
        size="sm"
        className="group relative h-8 overflow-hidden rounded-xl border border-transparent bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 px-3 font-semibold text-white shadow-lg transition-all duration-300 hover:border-blue-400 hover:from-blue-700 hover:via-blue-800 hover:to-purple-700 hover:shadow-xl focus:outline-none sm:h-10 sm:px-6"
        asChild
      >
        <Link href={ROUTE_CONFIG.AUTH.SIGN_UP} aria-label="Sign up and get started with LearnHub">
          {/* Animated shine effect */}
          <div className="absolute inset-0 translate-x-[-100%] -skew-x-12 transform bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-[100%]"></div>
          <span className="relative z-10 text-sm transition-transform duration-300 group-hover:scale-105 sm:text-base">
            <span className="hidden sm:inline">Get Started</span>
            <span className="sm:hidden">Start</span>
          </span>
          <span
            className="relative z-10 ml-1 text-xs transition-transform duration-300 group-hover:rotate-12 sm:ml-2 sm:text-base"
            aria-hidden="true"
          >
            🚀
          </span>
        </Link>
      </Button>
    </div>
  );
}
