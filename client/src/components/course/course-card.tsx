'use client';

import Image from 'next/image';
import { CourseImage } from './course-image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Users, Clock, BookOpen } from 'lucide-react';
import { IPublicCourse } from '@/types/course';
import {
  formatPrice,
  formatStudentCount,
  formatDuration,
  formatLastUpdated,
  formatRating,
} from '@/utils/format';
import { FaRegEye } from 'react-icons/fa6';
import { DEFAULT_THUMBNAIL } from '@/constants';
interface CourseCardProps {
  course: IPublicCourse;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-300 hover:border-gray-300 hover:shadow-lg">
      {/* Thumbnail */}
      <div className="relative aspect-video shrink-0 overflow-hidden">
        <CourseImage
          image={course.image}
          alt={course.title}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Level Badge */}
        <div className="absolute top-3 left-3 z-10">
          <Badge variant="default" className="text-sm font-medium capitalize">
            {course.level}
          </Badge>
        </div>
        {/* Price Badge */}
        <div className="absolute top-3 right-3 z-10">
          {course?.isFree ? (
            <Badge className="border border-green-700 bg-green-600 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-green-700">
              FREE
            </Badge>
          ) : (
            <div className="flex flex-col items-end space-y-1.5">
              {course.oldPrice > 0 && course.oldPrice > course.price && (
                <div className="relative flex cursor-default items-center gap-1.5 rounded-full bg-gradient-to-r from-red-500 via-red-600 to-orange-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg transition-all duration-300 hover:scale-110 hover:from-red-600 hover:via-red-700 hover:to-orange-600 hover:shadow-xl">
                  {/* Glow effect */}
                  <div className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-red-400 via-red-500 to-orange-400 blur-sm"></div>
                  <span className="text-sm text-yellow-200">🔥</span>
                  {Math.round(((course.oldPrice - course.price) / course.oldPrice) * 100)}% OFF
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-grow flex-col p-4">
        {/* Header: Category & Date */}
        <div className="mb-3 flex items-center justify-between text-xs text-gray-500">
          <span className="rounded-full bg-blue-50 px-2.5 py-1 font-medium text-blue-600 capitalize">
            {course.category?.name}
          </span>
          <span>{formatLastUpdated(course.updatedAt)}</span>
        </div>

        {/* Title */}
        <Link
          href={`/courses/${course.slug}`}
          className="mb-2"
          aria-label={`View course: ${course.title}`}
        >
          <h3 className="line-clamp-2 text-lg leading-tight font-semibold text-gray-900 transition-colors group-hover:text-blue-600 hover:text-blue-600">
            {course.title}
          </h3>
        </Link>

        {/* Instructor */}
        <p className="mb-3 text-sm text-gray-500">
          by <span className="font-medium text-gray-700">{course.author?.username}</span>
        </p>

        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-gray-600">{course?.excerpt}</p>

        {/* Course Stats - Compact */}
        <div className="mb-4 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <Clock size={16} />
            <span>{formatDuration(course.totalDuration || 0)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <FaRegEye size={16} />
            <span>{course.view || 0}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users size={16} />
            <span>{formatStudentCount(course.enrolledStudents || 0)}</span>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-grow"></div>

        {/* Rating & Price Row */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={18}
                  className={`${
                    i < Math.floor(course.averageRating || 0)
                      ? 'fill-current text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium text-gray-900">
              {formatRating(course.averageRating || 0)}
            </span>
            <span className="text-sm text-gray-500">
              ({formatStudentCount(course.totalReviews || 0)})
            </span>
          </div>

          {/* Price */}
          <div className="text-right">
            {course?.isFree ? (
              <span
                className="text-lg font-bold text-green-600"
                itemProp="price"
                content="0"
                aria-label="Free course"
              >
                Free
              </span>
            ) : (
              <div className="flex flex-col items-end">
                {course.oldPrice && course.oldPrice > course.price && (
                  <span className="text-gray-500 line-through">{formatPrice(course.oldPrice)}</span>
                )}
                <span
                  className="text-xl font-bold text-gray-900"
                  itemProp="price"
                  content={course.price.toString()}
                >
                  {formatPrice(course.price)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <Button className="h-10 w-full" asChild>
          <Link
            href={`/courses/${course.slug}`}
            aria-label={`${course?.isFree ? 'Start learning' : 'Enroll in'} ${course.title}`}
          >
            <BookOpen className="mr-2 h-4 w-4" />
            {course?.isFree ? 'Start Learning' : 'Enroll Now'}
          </Link>
        </Button>
      </div>
    </div>
  );
}
