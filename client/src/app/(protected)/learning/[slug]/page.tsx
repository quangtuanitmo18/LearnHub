'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import dynamic from 'next/dynamic';
import { notFound, useSearchParams } from 'next/navigation';
import React from 'react';
import { VideoPlayerProvider } from './context/video-player-context';

import { useLesson, usePublishedLessonsByChapter } from '@/hooks/use-lessons';
import { useUserCourseTracks } from '@/hooks/use-track';
import { LessonType } from '@/types/lesson';

// Static imports for critical components
import Loader from '@/components/loader';
import LessonCommentButton from './components/comment/lesson-comment-button';
import LessonHeader from './components/lesson-header';
import LessonNavigation from './components/lesson-navigation';
import { useLessonTour } from './components/lesson-tour';
import { usePublishedChaptersByCourse } from '@/hooks/use-chapters';

const LessonSidebar = dynamic(() => import('./components/lesson-sidebar'));

// Dynamic imports with SSR configuration
const LessonVideoPlayer = dynamic(() => import('./components/lesson-video-player'), {
  ssr: false,
});

const LessonArticleContent = dynamic(() => import('./components/lesson-article-content'));

const LessonCommentDrawer = dynamic(() => import('./components/comment/lesson-comment-drawer'), {
  ssr: false,
});

const LessonQuiz = dynamic(() => import('./components/quiz/lesson-quiz'), {
  ssr: false,
});

// Types
interface ChapterWithLessons {
  id: string;
  title: string;
  description?: string;
  order: number;
  isPublished: boolean;
  courseId: string;
  totalLessons: number;
  totalDuration: number;
}

const LessonPage = () => {
  const searchParams = useSearchParams();

  const lessonId = searchParams.get('id') || '';

  // Fetch lesson data
  const { data: lesson, isLoading } = useLesson(lessonId || '');

  // Fetch course chapters
  const { data: chapters = [] } = usePublishedChaptersByCourse(lesson?.courseId || '');
  console.log('Chapters data:', chapters);

  // Fetch lessons for current chapter (for navigation)
  const { data: chapterLessons = [] } = usePublishedLessonsByChapter(lesson?.chapterId || '');

  // Fetch user's tracking data
  const { data: tracks } = useUserCourseTracks(lesson?.courseId || '');

  const completedCount = React.useMemo(() => {
    return (tracks || []).length;
  }, [tracks]);

  // Calculate total lessons from chapter data
  const totalLessons = React.useMemo(() => {
    return (
      (chapters as ChapterWithLessons[])?.reduce(
        (total, chapter) => total + (chapter?.totalLessons || 0),
        0,
      ) || 0
    );
  }, [chapters]);

  // Prepare sidebar data - simplified chapters (lessons fetched lazily by sidebar)
  const sidebarChapters = React.useMemo(() => {
    return (
      (chapters as ChapterWithLessons[])?.map((chapter) => ({
        id: chapter?.id,
        title: chapter?.title,
        totalLessons: chapter?.totalLessons || 0,
        totalDuration: chapter?.totalDuration || 0,
      })) || []
    );
  }, [chapters]);

  // Calculate previous/next lesson for navigation
  const currentLessonIndex = chapterLessons.findIndex((l) => l?.id === lessonId);
  const previousLesson =
    currentLessonIndex > 0 ? chapterLessons[currentLessonIndex - 1] : undefined;
  const nextLesson =
    currentLessonIndex < chapterLessons.length - 1
      ? chapterLessons[currentLessonIndex + 1]
      : undefined;

  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Comment drawer state - simplified to single state
  const [showComments, setShowComments] = React.useState(false);

  const handleOpenComments = () => {
    setShowComments(true);
  };

  // Guided tour
  const { startTour } = useLessonTour();

  // Find current chapter title from lesson data
  const currentChapterTitle = React.useMemo(() => {
    return lesson?.chapter?.title || 'Chapter';
  }, [lesson?.chapter?.title]);

  // Render lesson content based on lesson type
  const renderLessonContent = () => {
    switch (lesson?.type) {
      case LessonType.VIDEO:
        return (
          <LessonVideoPlayer
            title={lesson?.title}
            isSidebarOpen={isSidebarOpen}
            videoUrl={lesson?.video?.url || ''}
            description={lesson?.description || ''}
          />
        );

      case LessonType.ARTICLE:
        return (
          <LessonArticleContent title={lesson?.title} content={lesson?.article?.content || ''} />
        );

      case LessonType.QUIZ:
        return <LessonQuiz lesson={lesson} />;

      default:
        return (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Unknown lesson content type: {lesson?.type}</AlertDescription>
          </Alert>
        );
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  if (!lesson) {
    notFound();
  }

  return (
    <VideoPlayerProvider>
    <div className="h-screen overflow-hidden">
      {/* Backdrop overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="bg-opacity-50 fixed inset-0 z-40 bg-black transition-opacity duration-300 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <LessonHeader
        courseTitle={lesson?.course?.title || 'Course'}
        courseSlug={lesson?.course?.slug || ''}
        courseId={lesson?.courseId || ''}
        completedLessons={completedCount}
        totalLessons={totalLessons}
        onGuideClick={startTour}
      />

      <div
        className={`h-screen pt-16 pb-16 transition-all duration-300 ${
          isSidebarOpen ? 'lg:pr-[23%]' : 'pr-0'
        }`}
      >
        <div className="h-full w-full overflow-y-auto">{renderLessonContent()}</div>
      </div>

      <LessonNavigation
        courseSlug={lesson?.course?.slug || ''}
        previousLesson={previousLesson ? { id: previousLesson?.id } : undefined}
        nextLesson={nextLesson ? { id: nextLesson?.id } : undefined}
        currentChapterTitle={currentChapterTitle}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
      />

      <LessonSidebar
        courseTitle={lesson?.course?.title || 'Course'}
        courseSlug={lesson?.course?.slug || ''}
        courseId={lesson?.courseId || ''}
        chapters={sidebarChapters}
        currentLessonId={lessonId}
        currentChapterId={lesson?.chapterId || ''}
        tracks={tracks}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
      />

      <LessonCommentButton
        className={`bottom-20 sm:bottom-20 ${
          isSidebarOpen ? 'right-4 lg:right-[25%]' : 'right-4 sm:right-10'
        }`}
        onClick={handleOpenComments}
      />

      {/* Only render drawer if user has clicked the button */}
      {showComments && (
        <LessonCommentDrawer
          lessonId={lessonId}
          isOpen={showComments}
          onOpenChange={setShowComments}
        />
      )}
    </div>
    </VideoPlayerProvider>
  );
};

export default LessonPage;
