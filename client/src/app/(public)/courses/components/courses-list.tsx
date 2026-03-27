'use client';

import type { IPublicCourse } from '@/types/course';
import CourseListItem from './course-list-item';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';

interface CoursesListProps {
  courses: IPublicCourse[];
  isLoading: boolean;
}

const CoursesList = ({ courses, isLoading }: CoursesListProps) => {
  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-3 sm:space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-lg border border-gray-200 bg-white p-3 sm:p-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <div className="aspect-video w-full shrink-0 rounded-lg bg-gray-200 sm:w-48 md:w-56 lg:w-64"></div>
              <div className="flex-grow space-y-2 sm:space-y-3">
                <div className="h-5 w-3/4 rounded bg-gray-200 sm:h-6"></div>
                <div className="h-3 w-1/2 rounded bg-gray-200 sm:h-4"></div>
                <div className="h-3 rounded bg-gray-200 sm:h-4"></div>
                <div className="h-3 w-2/3 rounded bg-gray-200 sm:h-4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* No Results */}
      {!isLoading && courses.length === 0 && (
        <div className="px-4 py-12 text-center sm:py-16 lg:py-20">
          <div className="mb-3 sm:mb-4">
            <Filter className="mx-auto h-12 w-12 text-gray-400 sm:h-16 sm:w-16" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900 sm:text-xl">No courses found</h3>
          <p className="mx-auto mb-4 max-w-md text-sm text-gray-600 sm:mb-6 sm:text-base">
            Try adjusting your filters or search terms to find what you&apos;re looking for.
          </p>
          <Button variant="outline" className="h-9 text-sm sm:h-10 sm:text-base">
            Clear All Filters
          </Button>
        </div>
      )}

      {/* Courses List */}
      {!isLoading && courses.length > 0 && (
        <div className="space-y-3 sm:space-y-4">
          {courses.map((course: IPublicCourse) => (
            <CourseListItem key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CoursesList;
