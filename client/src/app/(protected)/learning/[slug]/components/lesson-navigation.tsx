'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, PanelRightClose, PanelRightOpen } from 'lucide-react';

interface NavigationLesson {
  id: string;
}

interface LessonNavigationProps {
  courseSlug: string;
  previousLesson?: NavigationLesson;
  nextLesson?: NavigationLesson;
  currentChapterTitle?: string;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

// Lesson navigation component - Arrow function
const LessonNavigation = ({
  courseSlug,
  previousLesson,
  nextLesson,
  currentChapterTitle = 'Chapter',
  isSidebarOpen,
  onToggleSidebar,
}: LessonNavigationProps) => {
  return (
    <div
      id="tour-navigation"
      className={`fixed bottom-0 left-0 z-40 flex h-14 items-center border-t border-gray-200 bg-white px-3 transition-all duration-300 sm:h-16 sm:px-4 md:px-6 ${
        isSidebarOpen ? 'right-0 lg:right-[23%]' : 'right-0'
      }`}
    >
      <div className="flex w-full items-center justify-between gap-2 sm:gap-3">
        {/* Left Section - Chapter Title (Hidden on mobile) */}
        <div className="hidden max-w-[150px] min-w-0 shrink-0 md:flex lg:max-w-[200px]">
          <p className="truncate text-sm font-medium text-gray-600">{currentChapterTitle}</p>
        </div>

        {/* Center Section - Navigation Buttons */}
        <div className="flex flex-1 items-center justify-center space-x-2 sm:space-x-3 md:space-x-4">
          {/* Previous Button */}
          {previousLesson ? (
            <Link href={`/learning/${courseSlug}?id=${previousLesson.id}`}>
              <Button
                variant="outline"
                className="flex h-9 transform-gpu items-center space-x-1 border-gray-300 px-2 py-1.5 text-gray-700 transition-all duration-300 will-change-transform hover:scale-105 hover:border-gray-400 hover:bg-gray-50 hover:shadow-md hover:shadow-gray-500/25 active:scale-95 sm:h-10 sm:space-x-2 sm:px-3 sm:py-2 md:px-4"
              >
                <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden text-xs font-medium sm:inline sm:text-sm">PREVIOUS</span>
                <span className="text-xs font-medium sm:hidden">PREV</span>
              </Button>
            </Link>
          ) : (
            <Button
              variant="outline"
              disabled
              className="flex h-9 cursor-not-allowed items-center space-x-1 border-gray-200 px-2 py-1.5 text-gray-400 opacity-50 transition-all duration-300 sm:h-10 sm:space-x-2 sm:px-3 sm:py-2 md:px-4"
            >
              <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden text-xs font-medium sm:inline sm:text-sm">PREVIOUS</span>
              <span className="text-xs font-medium sm:hidden">PREV</span>
            </Button>
          )}

          {/* Next Button */}
          {nextLesson ? (
            <Link href={`/learning/${courseSlug}?id=${nextLesson.id}`}>
              <Button className="flex h-9 transform-gpu items-center justify-center space-x-1 bg-linear-to-br from-sky-500 via-blue-600 to-blue-700 px-2 py-1.5 text-white shadow-sm transition-all duration-300 will-change-transform hover:scale-105 hover:from-sky-600 hover:via-blue-700 hover:to-blue-800 hover:shadow-md hover:shadow-sky-500/25 active:scale-95 sm:h-10 sm:space-x-2 sm:px-3 sm:py-2 md:px-4">
                <span className="text-xs font-medium sm:text-sm">NEXT</span>
                <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </Link>
          ) : (
            <Button
              disabled
              className="flex h-9 transform-gpu animate-pulse cursor-default items-center space-x-1 bg-linear-to-br from-green-500 via-green-600 to-green-700 px-2 py-1.5 text-white shadow-md transition-all duration-300 will-change-transform hover:shadow-lg hover:shadow-green-500/25 sm:h-10 sm:space-x-2 sm:px-3 sm:py-2 md:px-4"
            >
              <span className="text-xs font-medium sm:text-sm">COMPLETED</span>
            </Button>
          )}
        </div>

        {/* Right Section - Sidebar Toggle */}
        <div className="shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="h-8 w-8 p-1.5 transition-colors hover:bg-gray-100 sm:h-9 sm:w-9 sm:p-2"
            title={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {isSidebarOpen ? (
              <PanelRightClose className="h-4 w-4 text-gray-600 sm:h-5 sm:w-5" />
            ) : (
              <PanelRightOpen className="h-4 w-4 text-gray-600 sm:h-5 sm:w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LessonNavigation;
