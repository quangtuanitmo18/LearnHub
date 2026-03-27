import { ROUTE_CONFIG } from '@/configs/routes';
import Link from 'next/link';

export function NotificationBar() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 py-2 text-center text-xs text-white sm:py-3 sm:text-sm">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 -skew-x-12 transform animate-pulse bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      </div>
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative z-10 px-4">
        <span className="font-semibold">
          🎉 <span className="hidden sm:inline">New Year Sale: </span>Get 50% off all courses!{' '}
        </span>
        <Link
          href={ROUTE_CONFIG.COURSES}
          className="ml-1 font-bold underline transition-colors hover:text-yellow-200 hover:no-underline sm:ml-2"
          aria-label="Shop now - 50% off all courses"
        >
          Shop Now →
        </Link>
      </div>
    </div>
  );
}
