'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { usePublishedLessonsByChapter } from '@/hooks/use-lessons';
import { cn } from '@/lib/utils';
import { IChapter } from '@/types/chapter';

import type { ILesson } from '@/types/lesson';
import { LessonType } from '@/types/lesson';
import { formatDuration, secondsToDisplayTime } from '@/utils/format';
import {
  Award,
  BookOpen,
  Clock,
  HelpCircle,
  Layers,
  LucideFileText,
  PlayCircle,
} from 'lucide-react';
import React, { useState } from 'react';
import { MdOutlineSlowMotionVideo } from 'react-icons/md';

interface CourseCurriculumProps {
  chapters: IChapter[];
  isLoading: boolean;
}

// Component for rendering lessons inside a chapter (with lazy loading)
// Lessons are only fetched when the chapter is expanded
interface ChapterLessonsProps {
  chapterId: string;
  isExpanded: boolean;
}

const ChapterLessons = ({ chapterId, isExpanded }: ChapterLessonsProps) => {
  // Only fetch lessons when chapter is expanded
  const { data: lessons = [], isLoading } = usePublishedLessonsByChapter(
    chapterId,
    isExpanded, // Only enabled when expanded
  );

  // Show loading state only when actually fetching
  if (isExpanded && isLoading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    );
  }

  // Show empty state only when expanded and not loading
  if (isExpanded && lessons.length === 0) {
    return <div className="p-4 text-center text-sm text-gray-500">No lessons available</div>;
  }

  // Don't render anything if not expanded
  if (!isExpanded) {
    return null;
  }

  return (
    <div>
      {lessons.map((lesson: ILesson, lessonIndex: number) => {
        const isLastLesson = lessonIndex === lessons.length - 1;
        return (
          <React.Fragment key={lesson.id}>
            <div
              className={cn(
                'group relative flex items-center justify-between px-4 py-3 transition-colors hover:bg-gray-50 sm:px-6 sm:py-4',
              )}
            >
              <div className="flex min-w-0 flex-1 items-center gap-2 pr-2">
                <div
                  className={cn(
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-full sm:h-6 sm:w-6',
                  )}
                >
                  {lesson.type === LessonType.VIDEO && (
                    <MdOutlineSlowMotionVideo className="h-3 w-3 text-gray-400 sm:h-4 sm:w-4" />
                  )}
                  {lesson.type === LessonType.QUIZ && (
                    <HelpCircle className="h-3 w-3 text-gray-400 sm:h-4 sm:w-4" />
                  )}
                  {lesson.type === LessonType.ARTICLE && (
                    <LucideFileText className="h-3 w-3 text-gray-400 sm:h-4 sm:w-4" />
                  )}
                </div>
                <span className="truncate text-xs text-gray-900 sm:text-sm">
                  {lessonIndex + 1}. {lesson.title}
                </span>
              </div>
              <span className="shrink-0 text-xs text-gray-500 sm:text-sm">
                {secondsToDisplayTime(lesson.durationSec || 0)}
              </span>
            </div>
            {!isLastLesson && <div className="border-t border-dotted border-gray-300"></div>}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const CourseCurriculum = ({ chapters, isLoading }: CourseCurriculumProps) => {
  const [expandedChapters, setExpandedChapters] = useState<string[]>([]);

  const handleAccordionChange = (value: string[]) => {
    setExpandedChapters(value);
  };

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200/50 bg-linear-to-br from-white via-blue-50/30 to-purple-50/20 shadow-xl backdrop-blur-sm sm:rounded-2xl">
        {/* Header */}
        <div className="border-gradient-to-r border-b from-blue-200/50 to-purple-200/50 p-4 sm:p-6 lg:p-8">
          <div className="mb-3 flex items-center gap-2 sm:mb-4 sm:gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-blue-500 to-purple-600 sm:h-12 sm:w-12 sm:rounded-xl">
              <Layers className="h-5 w-5 text-white sm:h-6 sm:w-6" />
            </div>
            <div className="flex-1">
              <Skeleton className="mb-1 h-5 w-36 sm:mb-2 sm:h-7 sm:w-48" />
              <Skeleton className="h-3 w-48 sm:h-4 sm:w-64" />
            </div>
          </div>
        </div>

        {/* Loading Chapters */}
        <div className="space-y-4 p-4 sm:space-y-6 sm:p-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-lg border border-gray-200/50 bg-white/70 p-4 sm:rounded-xl sm:p-6"
            >
              <div className="mb-3 flex items-center justify-between sm:mb-4">
                <Skeleton className="h-5 w-2/3 sm:h-6" />
                <Skeleton className="h-4 w-16 sm:h-5 sm:w-20" />
              </div>
              <div className="space-y-2 sm:space-y-3">
                {[1, 2].map((j) => (
                  <div key={j} className="flex items-center gap-2 sm:gap-3">
                    <Skeleton className="h-6 w-6 rounded-lg sm:h-8 sm:w-8" />
                    <div className="flex-1">
                      <Skeleton className="mb-1 h-3 w-3/4 sm:h-4" />
                      <Skeleton className="h-2.5 w-1/4 sm:h-3" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-lg sm:h-8 sm:w-20" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (chapters.length === 0) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200/50 bg-linear-to-br from-white via-blue-50/30 to-purple-50/20 shadow-xl backdrop-blur-sm sm:rounded-2xl">
        {/* Header */}
        <div className="border-b border-gray-200/50 bg-gradient-to-r from-blue-50/50 to-purple-50/50 p-4 sm:p-6 lg:p-8">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-blue-500 to-purple-600 sm:h-12 sm:w-12 sm:rounded-xl">
              <Layers className="h-5 w-5 text-white sm:h-6 sm:w-6" />
            </div>
            <div>
              <h3 className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-lg font-bold text-transparent sm:text-xl lg:text-2xl">
                Course Curriculum
              </h3>
              <p className="text-xs text-gray-600 sm:text-sm">Explore course content and lessons</p>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="p-8 text-center sm:p-12">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-gray-100 to-gray-200 sm:mb-6 sm:h-20 sm:w-20">
            <BookOpen className="h-8 w-8 text-gray-400 sm:h-10 sm:w-10" />
          </div>
          <h4 className="mb-2 text-lg font-semibold text-gray-700 sm:text-xl">
            No Curriculum Available
          </h4>
          <p className="mx-auto max-w-sm text-sm text-gray-500 sm:text-base">
            This course doesn&apos;t have any curriculum content yet. Check back later for updates.
          </p>
        </div>
      </div>
    );
  }

  // Calculate total stats from chapter summary data
  const totalLessons = chapters.reduce((total, chapter) => total + (chapter.totalLessons || 0), 0);
  const totalDuration = chapters.reduce(
    (total, chapter) => total + (chapter.totalDuration || 0),
    0,
  );

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200/50 bg-linear-to-br from-white via-blue-50/30 to-purple-50/20 shadow-xl backdrop-blur-sm sm:rounded-2xl">
      {/* Enhanced Header */}
      <div className="border-b border-gray-200/50 bg-gradient-to-r from-blue-50/50 to-purple-50/50 p-4 sm:p-6 lg:p-8">
        <div className="mb-4 flex items-center gap-2 sm:mb-6 sm:gap-3 lg:gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-blue-500 to-purple-600 shadow-lg sm:h-12 sm:w-12 sm:rounded-xl">
            <Layers className="h-5 w-5 text-white sm:h-6 sm:w-6" />
          </div>
          <div className="flex-1">
            <h3 className="mb-0.5 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-lg font-bold text-transparent sm:mb-1 sm:text-xl lg:text-2xl">
              Course Curriculum
            </h3>
            <p className="text-xs text-gray-600 sm:text-sm">
              Complete learning path for this course
            </p>
          </div>
        </div>

        {/* Course Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
          <div className="rounded-lg border border-blue-200/50 bg-white/70 p-2.5 sm:rounded-xl sm:p-3 lg:p-4">
            <div className="mb-0.5 flex items-center gap-1 sm:mb-1 sm:gap-2">
              <Award className="h-3 w-3 text-blue-600 sm:h-4 sm:w-4" />
              <span className="text-[10px] font-medium tracking-wide text-gray-600 uppercase sm:text-xs">
                Chapters
              </span>
            </div>
            <p className="text-lg font-bold text-gray-900 sm:text-xl lg:text-2xl">
              {chapters.length}
            </p>
          </div>
          <div className="rounded-lg border border-purple-200/50 bg-white/70 p-2.5 sm:rounded-xl sm:p-3 lg:p-4">
            <div className="mb-0.5 flex items-center gap-1 sm:mb-1 sm:gap-2">
              <PlayCircle className="h-3 w-3 text-purple-600 sm:h-4 sm:w-4" />
              <span className="text-[10px] font-medium tracking-wide text-gray-600 uppercase sm:text-xs">
                Lessons
              </span>
            </div>
            <p className="text-lg font-bold text-gray-900 sm:text-xl lg:text-2xl">{totalLessons}</p>
          </div>
          <div className="rounded-lg border border-green-200/50 bg-white/70 p-2.5 sm:rounded-xl sm:p-3 lg:p-4">
            <div className="mb-0.5 flex items-center gap-1 sm:mb-1 sm:gap-2">
              <Clock className="h-3 w-3 text-green-600 sm:h-4 sm:w-4" />
              <span className="text-[10px] font-medium tracking-wide text-gray-600 uppercase sm:text-xs">
                Duration
              </span>
            </div>
            <p className="text-lg font-bold text-gray-900 sm:text-xl lg:text-2xl">
              {formatDuration(totalDuration || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Curriculum Content */}
      <div className="overflow-hidden rounded-b-xl border border-gray-200 bg-white">
        <Accordion
          type="multiple"
          className="w-full"
          value={expandedChapters}
          onValueChange={handleAccordionChange}
        >
          {chapters.map((chapter, chapterIndex) => (
            <AccordionItem
              key={chapter.id}
              value={chapter.id}
              className="border-b border-gray-200 last:border-b-0"
            >
              <AccordionTrigger className="flex items-center bg-gradient-to-r from-blue-50/50 to-purple-50/50 px-4 py-3 hover:no-underline sm:px-6 sm:py-4">
                <div className="flex w-full items-center justify-between text-left">
                  <span className="pr-2 text-sm font-semibold sm:text-base">
                    {chapterIndex + 1}. {chapter.title}
                  </span>
                  <span className="shrink-0 text-xs text-gray-600 sm:text-sm">
                    {chapter.totalLessons || 0} lessons
                  </span>
                </div>
              </AccordionTrigger>

              <AccordionContent className="px-0 pb-0">
                <ChapterLessons
                  chapterId={chapter.id}
                  isExpanded={expandedChapters.includes(chapter.id)}
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default CourseCurriculum;
