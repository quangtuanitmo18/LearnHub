'use client';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ROUTE_CONFIG } from '@/configs/routes';
import { DEFAULT_THUMBNAIL } from '@/constants';
import { IEnrolledCourse } from '@/types/course';
import Image from 'next/image';
import Link from 'next/link';
import { MdStar } from 'react-icons/md';

interface CourseProgressCardProps {
  course: IEnrolledCourse;
}

// Course progress card component - Arrow function
const CourseProgressCard = ({ course }: CourseProgressCardProps) => {
  const { title, slug, description, image, averageRating, completedLessons, totalLessons, level } =
    course;

  const progressPercentage =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  return (
    <Link href={`${ROUTE_CONFIG.COURSES}/${slug}`}>
      <Card className="group relative cursor-pointer overflow-hidden border-0 bg-linear-to-br from-white via-blue-50/30 to-purple-50/30 shadow-lg transition-all duration-500 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-xl sm:shadow-xl sm:hover:-translate-y-2 sm:hover:scale-[1.02] sm:hover:shadow-2xl dark:from-gray-900 dark:via-blue-950/20 dark:to-purple-950/20">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 h-24 w-24 animate-pulse rounded-full bg-linear-to-br from-blue-400/20 to-purple-400/20 blur-xl sm:h-32 sm:w-32"></div>
          <div className="absolute bottom-0 left-0 h-20 w-20 animate-pulse rounded-full bg-linear-to-br from-pink-400/20 to-red-400/20 blur-xl delay-1000 sm:h-24 sm:w-24"></div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 p-4 sm:p-5 md:p-6">
          {/* Header with Course Image and Rating */}
          <div className="mb-4 flex items-start gap-3 sm:mb-5 sm:gap-4 md:mb-6 md:gap-6">
            {/* Course Thumbnail */}
            <div className="group relative h-16 w-16 shrink-0 sm:h-20 sm:w-20 md:h-24 md:w-24">
              <Image
                src={image || DEFAULT_THUMBNAIL}
                alt={title}
                fill
                className="h-full w-full rounded-xl object-cover shadow-md ring-2 ring-white/50 sm:rounded-2xl sm:shadow-lg sm:ring-4"
              />
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:rounded-2xl">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/90 sm:h-8 sm:w-8">
                  <div className="ml-0.5 h-0 w-0 border-y-[3px] border-l-[5px] border-y-transparent border-l-gray-700 sm:ml-1 sm:border-y-[4px] sm:border-l-[6px]"></div>
                </div>
              </div>
            </div>

            {/* Course Info */}
            <div className="min-w-0 flex-1">
              {/* Rating */}
              <div className="mb-2 flex flex-wrap items-center gap-1.5 sm:mb-3 sm:gap-2">
                <div className="flex items-center gap-0.5 sm:gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <MdStar
                      key={i}
                      className={`h-3 w-3 transition-colors sm:h-4 sm:w-4 ${
                        i < Math.floor(averageRating)
                          ? 'fill-current text-yellow-400 drop-shadow-sm'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-gray-700 sm:text-sm dark:text-gray-300">
                  {averageRating.toFixed(2)}
                </span>
                <div className="ml-auto">
                  <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 px-2 py-0.5 text-[10px] font-medium text-white capitalize shadow-md sm:px-3 sm:py-1 sm:text-xs sm:shadow-lg">
                    {level}
                  </Badge>
                </div>
              </div>

              {/* Course Title */}
              <h3 className="mb-1 line-clamp-2 text-sm leading-tight font-bold text-gray-900 sm:mb-2 sm:text-base md:text-lg lg:text-xl dark:text-white">
                {title}
              </h3>
              <div
                className="line-clamp-2 text-xs leading-relaxed text-gray-600 sm:text-sm dark:text-gray-400"
                dangerouslySetInnerHTML={{
                  __html: description,
                }}
              />
            </div>
          </div>

          {/* Progress Section */}
          <div className="space-y-2 sm:space-y-3 md:space-y-4">
            {/* Progress Info */}
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 sm:h-2 sm:w-2"></div>
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  <span className="hidden sm:inline">Learning Progress: </span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {completedLessons}
                  </span>
                  /{totalLessons}
                  <span className="hidden sm:inline"> lessons</span>
                </span>
              </div>
            </div>

            {/* Enhanced Progress Bar */}
            <div className="space-y-2 sm:space-y-3">
              <div className="group/progress relative">
                <div className="h-2 overflow-hidden rounded-full bg-gray-200 shadow-inner sm:h-3 dark:bg-gray-700">
                  <div
                    className="relative h-full overflow-hidden rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-1000 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                  </div>
                </div>

                {/* Progress percentage indicator */}
                {progressPercentage > 0 && (
                  <div
                    className="absolute top-0 -mt-6 -translate-x-1/2 transform opacity-0 transition-all duration-300 group-hover/progress:opacity-100 sm:-mt-8"
                    style={{ left: `${Math.min(progressPercentage, 95)}%` }}
                  >
                    <div className="rounded-md bg-gradient-to-r from-blue-500 to-purple-600 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-lg sm:px-2 sm:py-1 sm:text-xs">
                      {progressPercentage}%
                    </div>
                    <div className="mx-auto -mt-0.5 h-1.5 w-1.5 rotate-45 bg-gradient-to-r from-blue-500 to-purple-600 sm:-mt-1 sm:h-2 sm:w-2"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Subtle border glow */}
        <div className="pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
      </Card>
    </Link>
  );
};

export default CourseProgressCard;
