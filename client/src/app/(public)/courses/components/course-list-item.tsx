'use client';

import Image from 'next/image';
import { CourseImage } from '@/components/course/course-image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Users, Clock, BookOpen } from 'lucide-react';
import { CourseLevel, IPublicCourse } from '@/types/course';
import { formatPrice, formatStudentCount, formatDuration, formatRating } from '@/utils/format';
import { getRoutes } from '@/configs/routes';
import { DEFAULT_THUMBNAIL } from '@/constants';

interface CourseListItemProps {
  course: IPublicCourse;
}

const CourseListItem = ({ course }: CourseListItemProps) => {
  return (
    <div className="group overflow-hidden rounded-lg border border-gray-200 bg-white transition-all duration-300 hover:border-gray-300 hover:shadow-md">
      <div className="flex flex-row gap-3 p-3 sm:gap-4 sm:p-4">
        {/* Thumbnail */}
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg sm:aspect-video sm:h-auto sm:w-48 md:w-56 lg:w-64">
          <CourseImage
            image={course.image}
            alt={course.title}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {/* Level Badge - Hidden on mobile */}
          <div className="absolute top-1.5 left-1.5 hidden sm:top-2 sm:left-2 sm:block">
            <Badge
              variant={
                course.level === CourseLevel.BEGINNER
                  ? 'default'
                  : course.level === CourseLevel.INTERMEDIATE
                    ? 'secondary'
                    : 'destructive'
              }
              className="px-1.5 py-0.5 text-[10px] font-medium capitalize sm:px-2 sm:py-1 sm:text-xs"
            >
              {course.level}
            </Badge>
          </div>
          {/* Price Badge - Hidden on mobile */}

          <div className="absolute top-1.5 right-1.5 hidden sm:top-2 sm:right-2 sm:block">
            {course?.isFree ? (
              <Badge className="border border-green-700 bg-green-600 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-green-700 sm:px-2.5 sm:py-1 sm:text-xs">
                FREE
              </Badge>
            ) : (
              <div className="flex flex-col items-end space-y-1">
                {course.oldPrice > 0 && course.oldPrice > course.price && (
                  <div className="relative flex cursor-default items-center gap-1 rounded-full bg-gradient-to-r from-red-500 via-red-600 to-orange-500 px-2 py-1 text-[10px] font-bold text-white shadow-lg transition-all duration-300 hover:scale-110 hover:from-red-600 hover:via-red-700 hover:to-orange-600 hover:shadow-xl sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-xs">
                    {/* Glow effect */}
                    <div className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-red-400 via-red-500 to-orange-400 blur-sm"></div>
                    <span className="text-xs text-yellow-200 sm:text-sm">🔥</span>
                    {Math.round(((course.oldPrice - course.price) / course.oldPrice) * 100)}% OFF
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex min-w-0 flex-grow flex-col justify-between">
          {/* Header */}
          <div>
            {/* Category & Level & Discount (Mobile) */}
            <div className="mb-1.5 flex items-center justify-between gap-2 sm:mb-2">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="shrink-0 rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-600 capitalize sm:px-2 sm:py-1 sm:text-xs">
                  {course.category?.name}
                </span>
                {/* Level Badge - Mobile only */}
                <Badge
                  variant={
                    course.level === CourseLevel.BEGINNER
                      ? 'default'
                      : course.level === CourseLevel.INTERMEDIATE
                        ? 'secondary'
                        : 'destructive'
                  }
                  className="px-1.5 py-0.5 text-[10px] font-medium capitalize sm:hidden"
                >
                  {course.level}
                </Badge>
                {/* Free Badge - Mobile only */}
                {course?.isFree && (
                  <Badge className="bg-green-600 px-1.5 py-0.5 text-[10px] font-bold text-white sm:hidden">
                    FREE
                  </Badge>
                )}
              </div>
              {/* Discount Badge - Mobile */}
              {!course?.isFree && course.oldPrice > 0 && course.oldPrice > course.price && (
                <div className="shrink-0 rounded-full bg-gradient-to-r from-red-500 to-orange-500 px-1.5 py-0.5 text-[10px] font-bold text-white sm:hidden">
                  {Math.round(((course.oldPrice - course.price) / course.oldPrice) * 100)}% OFF
                </div>
              )}
            </div>

            {/* Title */}
            <Link
              href={getRoutes.courseDetail(course.slug)}
              aria-label={`View course: ${course.title}`}
            >
              <h3 className="mb-1 line-clamp-2 text-sm leading-tight font-semibold text-gray-900 transition-colors group-hover:text-blue-600 hover:text-blue-600 sm:mb-2 sm:text-lg md:text-xl">
                {course.title}
              </h3>
            </Link>

            {/* Instructor - Hidden on mobile */}
            <p className="mb-2 hidden text-xs text-gray-500 sm:mb-3 sm:block sm:text-sm">
              by <span className="font-medium text-gray-700">{course.author?.username}</span>
            </p>

            {/* Description/Excerpt - Hidden on mobile */}
            <p className="mb-3 line-clamp-2 hidden text-xs leading-relaxed text-gray-600 sm:mb-4 sm:block sm:text-sm md:line-clamp-3">
              {course?.excerpt}
            </p>

            {/* Stats */}
            <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-gray-500 sm:mb-4 sm:gap-x-4 sm:text-sm md:gap-x-6">
              <div className="flex items-center space-x-0.5 sm:space-x-1">
                <Clock className="h-3 w-3 shrink-0 sm:h-4 sm:w-4" />
                <span>{formatDuration(course.totalDuration || 0)}</span>
              </div>
              <div className="flex items-center space-x-0.5 sm:space-x-1">
                <Users className="h-3 w-3 shrink-0 sm:h-4 sm:w-4" />
                <span>{formatStudentCount(course.enrolledStudents || 0)}</span>
              </div>
              {/* Rating - Mobile only */}
              <div className="flex items-center space-x-0.5 sm:hidden">
                <Star className="h-3 w-3 fill-current text-yellow-400" />
                <span className="font-medium text-gray-900">
                  {formatRating(course.averageRating || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-2">
            {/* Rating - Desktop only */}
            <div className="hidden items-center space-x-1 sm:flex">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 sm:h-4 sm:w-4 ${
                      i < Math.floor(course.averageRating || 0)
                        ? 'fill-current text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-medium text-gray-900 sm:text-sm">
                {formatRating(course.averageRating || 0)}
              </span>
              <span className="text-xs text-gray-500 sm:text-sm">
                ({formatStudentCount(course.totalReviews || 0)})
              </span>
            </div>

            {/* Price & Button */}
            <div className="ml-auto flex items-center gap-2 sm:gap-3 md:gap-4">
              {/* Price */}
              <div className="text-right">
                {course?.isFree ? (
                  <span
                    className="text-base font-bold text-green-600 sm:text-xl"
                    itemProp="price"
                    content="0"
                    aria-label="Free course"
                  >
                    Free
                  </span>
                ) : (
                  <div className="flex flex-col items-end">
                    {course.oldPrice && course.oldPrice > course.price && (
                      <span className="hidden text-xs text-gray-500 line-through sm:inline sm:text-sm">
                        {formatPrice(course.oldPrice)}
                      </span>
                    )}
                    <span
                      className="text-sm font-bold text-gray-900 sm:text-lg md:text-xl"
                      itemProp="price"
                      content={course.price.toString()}
                    >
                      {formatPrice(course.price)}
                    </span>
                  </div>
                )}
              </div>

              {/* Button */}
              <Button
                className="h-8 shrink-0 px-2 text-[10px] sm:h-10 sm:px-4 sm:text-sm md:px-6"
                asChild
              >
                <Link
                  href={getRoutes.courseDetail(course.slug)}
                  aria-label={`${course?.isFree ? 'Start learning' : 'Enroll in'} ${course.title}`}
                >
                  <BookOpen className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">
                    {course?.isFree ? 'Start Learning' : 'Enroll Now'}
                  </span>
                  <span className="sm:hidden">{course?.isFree ? 'Start' : 'Enroll'}</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseListItem;
