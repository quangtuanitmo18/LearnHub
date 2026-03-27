import { ROUTE_CONFIG } from '@/configs/routes';
import Link from 'next/link';
import { GiGraduateCap } from 'react-icons/gi';

export function HeaderLogo() {
  return (
    <Link
      href={ROUTE_CONFIG.HOME}
      className="group flex min-w-fit items-center space-x-2 rounded-lg focus:outline-none sm:space-x-4"
      aria-label="LearnHub - Go to homepage"
    >
      <div className="relative">
        {/* Enhanced logo with glass effect */}
        <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-xl bg-linear-to-br from-blue-600 to-purple-600 shadow-lg transition-all duration-300 group-hover:shadow-xl sm:h-10 sm:w-10">
          <div className="absolute inset-0 bg-linear-to-br from-white/20 to-transparent"></div>
          <span className="relative z-10 text-lg font-bold text-white" aria-hidden="true">
            <GiGraduateCap size={16} className="sm:h-6 sm:w-6" />
          </span>
        </div>
      </div>
      <div className="hidden sm:block">
        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-xl font-bold text-transparent sm:text-2xl">
          LearnHub
        </span>
        <div className="-mt-1 text-xs font-medium tracking-wide text-gray-500">
          Learn. Grow. Succeed.
        </div>
      </div>
    </Link>
  );
}
