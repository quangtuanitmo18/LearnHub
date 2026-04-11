'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToggleTrack } from '@/hooks/use-track';
import { usePublishedLessonsByChapter } from '@/hooks/use-lessons';
import { useUser } from '@/stores/auth-store';
import type { ITrack } from '@/types/track';
import { LessonType } from '@/types/lesson';
import { saveLastLessonForCourse } from '@/utils/last-course-lesson';
import { secondsToDisplayTime } from '@/utils/format';
import { ChevronDown, HelpCircle, LucideFileText, Loader2 } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { MdOutlineSlowMotionVideo } from 'react-icons/md';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LessonNotes } from './lesson-notes';

interface SidebarLesson {
  id: string;
  title: string;
  contentType: 'video' | 'quiz' | 'article';
  duration?: number;
  isCompleted?: boolean;
  isLocked?: boolean;
}

interface SidebarChapter {
  id: string;
  title: string;
  totalLessons: number;
  totalDuration: number;
  isCompleted?: boolean;
}

// Helper to convert lesson type to display format
const getLessonContentType = (type: LessonType): 'video' | 'quiz' | 'article' => {
  switch (type) {
    case LessonType.VIDEO:
      return 'video';
    case LessonType.QUIZ:
      return 'quiz';
    case LessonType.ARTICLE:
      return 'article';
    default:
      return 'article';
  }
};

interface LessonSidebarProps {
  courseTitle: string;
  courseSlug: string;
  courseId: string;
  chapters: SidebarChapter[];
  currentLessonId?: string;
  currentChapterId?: string;
  tracks?: ITrack[];
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

// Lesson sidebar component - Arrow function
const LessonSidebar = ({
  courseSlug,
  courseId,
  chapters,
  currentLessonId,
  currentChapterId,
  tracks,
  isSidebarOpen,
  onToggleSidebar,
}: LessonSidebarProps) => {
  const [openChapters, setOpenChapters] = React.useState<Set<string>>(new Set());

  const completedLessonIds = React.useMemo(() => {
    return new Set((tracks || []).map((t) => t.lessonId));
  }, [tracks]);

  // Find current lesson and auto-open its chapter
  React.useEffect(() => {
    if (currentChapterId) {
      setOpenChapters((prev) => new Set([...prev, currentChapterId]));
    }
  }, [currentChapterId]);

  const toggleChapter = (chapterId: string) => {
    setOpenChapters((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(chapterId)) {
        newSet.delete(chapterId);
      } else {
        newSet.add(chapterId);
      }
      return newSet;
    });
  };

  return (
    <div
      id="tour-sidebar"
      className={`fixed top-14 z-50 flex h-[calc(100vh-56px)] w-full flex-col overflow-hidden border-l border-gray-200 bg-white transition-all duration-300 ease-in-out sm:top-16 sm:h-[calc(100vh-64px)] lg:w-[23%] ${
        isSidebarOpen ? 'right-0' : '-right-full lg:-right-[23%]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-3 sm:p-4">
        <h2 className="text-sm font-semibold text-gray-900 sm:text-base">Course content</h2>
        {/* Close button for mobile */}
        <button
          onClick={onToggleSidebar}
          className="rounded-md p-1.5 transition-colors hover:bg-gray-200 lg:hidden"
          aria-label="Close sidebar"
        >
          <svg
            className="h-5 w-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Content with Tabs */}
      <Tabs defaultValue="outline" className="flex flex-1 flex-col overflow-hidden">
        <div className="border-b border-gray-100 bg-white px-4 py-2">
          <TabsList className="grid h-9 w-full grid-cols-2">
            <TabsTrigger value="outline" className="text-xs sm:text-sm">
              Outline
            </TabsTrigger>
            <TabsTrigger value="notes" className="text-xs sm:text-sm">
              Notes
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="outline"
          className="m-0 flex-1 overflow-y-auto border-0 pb-10 outline-none"
        >
          {chapters.map((chapter, chapterIndex) => (
            <ChapterItem
              key={chapter.id}
              chapter={chapter}
              chapterIndex={chapterIndex}
              isOpen={openChapters.has(chapter.id)}
              onToggle={() => toggleChapter(chapter.id)}
              currentLessonId={currentLessonId}
              courseSlug={courseSlug}
              courseId={courseId}
              completedLessonIds={completedLessonIds}
              onToggleSidebar={onToggleSidebar}
            />
          ))}
        </TabsContent>

        <TabsContent value="notes" className="m-0 flex-1 overflow-hidden border-0 outline-none">
          <LessonNotes lessonId={currentLessonId || ''} courseId={courseId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Separate component for each chapter to handle lazy loading
interface ChapterItemProps {
  chapter: SidebarChapter;
  chapterIndex: number;
  isOpen: boolean;
  onToggle: () => void;
  currentLessonId?: string;
  courseSlug: string;
  courseId: string;
  completedLessonIds: Set<string>;
  onToggleSidebar: () => void;
}

const ChapterItem = ({
  chapter,
  chapterIndex,
  isOpen,
  onToggle,
  currentLessonId,
  courseSlug,
  courseId,
  completedLessonIds,
  onToggleSidebar,
}: ChapterItemProps) => {
  // Get current user for tracking
  const user = useUser();

  // Get lesson completion toggle functionality
  const toggleTrackMutation = useToggleTrack();

  // Fetch lessons only when chapter is opened
  const { data: lessons = [], isLoading: isLessonsLoading } = usePublishedLessonsByChapter(
    chapter.id,
    isOpen,
  );

  // Convert lessons to sidebar format
  const sidebarLessons: SidebarLesson[] = React.useMemo(() => {
    return lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      contentType: getLessonContentType(lesson.type),
      duration: lesson.durationSec,
      isCompleted: completedLessonIds.has(lesson.id),
    }));
  }, [lessons, completedLessonIds]);

  // Check if a lesson is completed based on tracking data
  const isLessonCompleted = (lessonId: string): boolean => {
    return completedLessonIds.has(lessonId);
  };

  // Handle saving last course lesson to localStorage
  const saveLastCourseLesson = (lessonId: string) => {
    saveLastLessonForCourse(courseSlug, lessonId);
  };

  // Handle lesson completion toggle
  const handleLessonCompletionToggle = (lessonId: string) => {
    toggleTrackMutation.mutate({
      courseId,
      lessonId,
    });
  };

  // Calculate completion based on tracking data
  const completedLessons = sidebarLessons.filter((lesson) => isLessonCompleted(lesson.id)).length;

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="h-auto w-full justify-between border-b border-gray-100 bg-gray-50 px-3 py-2.5 text-left transition-all duration-200 ease-in-out hover:bg-gray-100 sm:px-4 sm:py-3"
        >
          <div className="min-w-0 flex-1">
            <div className="mb-1 truncate text-xs font-medium text-gray-900 sm:text-sm">
              {chapterIndex + 1}. {chapter.title}
            </div>
            <div className="text-[10px] text-gray-500 sm:text-xs">
              {completedLessons}/{chapter.totalLessons} |{' '}
              {secondsToDisplayTime(chapter.totalDuration)}
            </div>
          </div>
          <div className="ml-2 flex shrink-0 items-center sm:ml-4">
            <ChevronDown
              className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-300 ease-in-out sm:h-4 sm:w-4 ${
                isOpen ? 'rotate-180' : 'rotate-0'
              }`}
            />
          </div>
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden transition-all">
        <div className="bg-white">
          {isLessonsLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
            </div>
          ) : (
            sidebarLessons.map((lesson, lessonIndex) => {
              const isCurrentLesson = lesson.id === currentLessonId;
              const lessonCompleted = isLessonCompleted(lesson.id);
              const isLastLesson = lessonIndex === sidebarLessons.length - 1;

              return (
                <React.Fragment key={lesson.id}>
                  <div
                    className={`${
                      isCurrentLesson
                        ? 'border-l-4 border-l-blue-500 bg-blue-50'
                        : 'border-l-4 border-l-transparent hover:border-l-blue-500 hover:bg-blue-50'
                    } transition-colors duration-200`}
                  >
                    <div className="group flex items-center">
                      <Link
                        href={`/learning/${courseSlug}?id=${lesson.id}`}
                        className="block flex-1"
                        onClick={() => {
                          saveLastCourseLesson(lesson.id);
                          // Close sidebar on mobile when lesson is clicked
                          if (window.innerWidth < 1024) {
                            onToggleSidebar();
                          }
                        }}
                      >
                        <div className="px-3 py-2 transition-colors sm:px-4 sm:py-3">
                          <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                              <h4
                                className={`mb-1 truncate text-xs sm:text-sm ${
                                  isCurrentLesson
                                    ? 'font-semibold text-blue-700'
                                    : 'text-gray-900 group-hover:text-blue-700'
                                } transition-colors duration-200`}
                              >
                                {lessonIndex + 1}. {lesson.title}
                              </h4>
                              <div className="flex items-center space-x-1.5 sm:space-x-2">
                                {/* Content Type Icon */}
                                {lesson.contentType === 'video' && (
                                  <MdOutlineSlowMotionVideo
                                    className={`h-3.5 w-3.5 group-hover:text-blue-600 sm:h-4 sm:w-4 ${
                                      isCurrentLesson ? 'text-blue-700' : 'text-gray-400'
                                    } shrink-0 transition-colors duration-200`}
                                  />
                                )}
                                {lesson.contentType === 'quiz' && (
                                  <HelpCircle className="h-3.5 w-3.5 shrink-0 text-gray-400 group-hover:text-blue-600 sm:h-4 sm:w-4" />
                                )}
                                {lesson.contentType === 'article' && (
                                  <LucideFileText className="h-3.5 w-3.5 shrink-0 text-gray-400 group-hover:text-blue-600 sm:h-4 sm:w-4" />
                                )}
                                <span className="text-[10px] whitespace-nowrap text-gray-500 sm:text-xs">
                                  {secondsToDisplayTime(lesson.duration || 0)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>

                      {/* Completion Checkbox */}
                      <div className="flex items-center pr-4">
                        <Checkbox
                          checked={lessonCompleted}
                          disabled={toggleTrackMutation.isPending || !user}
                          className={`h-4 w-4 border transition-all duration-200 ${
                            lessonCompleted
                              ? 'border-blue-600 bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600'
                              : 'border-gray-300 bg-white hover:border-blue-400'
                          } ${
                            toggleTrackMutation.isPending || !user
                              ? 'cursor-not-allowed opacity-50'
                              : 'cursor-pointer hover:shadow-sm'
                          }`}
                          onClick={() => handleLessonCompletionToggle(lesson.id)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dotted line separator between lessons */}
                  {!isLastLesson && <div className="border-t border-dotted border-gray-300"></div>}
                </React.Fragment>
              );
            })
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default LessonSidebar;
