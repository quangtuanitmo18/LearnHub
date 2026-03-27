'use client';

import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { MdAdd, MdDescription, MdDragIndicator } from 'react-icons/md';
import { toast } from 'sonner';

import { ProtectedRoute } from '@/components/auth/protected-route';
import Loader from '@/components/loader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { OPERATIONS, RESOURCES } from '@/configs/permission';
import { IChapter } from '@/types/chapter';
import dynamic from 'next/dynamic';

// Import chapter hooks
import {
  chapterKeys,
  useChaptersByCourse,
  useDeleteChapter,
  useReorderChapters,
} from '@/hooks/use-chapters';

// Import lesson hooks
import {
  lessonsKeys,
  useDeleteLesson,
  useReorderLessons,
  useToggleLessonPublish,
} from '@/hooks/use-lessons';

// Import lightweight skeleton statically (used for loading states)
import ChapterSkeleton from './components/chapter-skeleton';
import { ILesson } from '@/types/lesson';

// Dynamic imports for heavy components (changing to default imports)
const ChapterFormDialog = dynamic(() => import('./components/chapter-form-dialog'), {
  loading: () => <Loader />,
  ssr: false,
});

const LessonFormDialog = dynamic(() => import('./components/lesson-form-dialog'), {
  loading: () => <Loader />,
  ssr: false,
});

const SortableChapter = dynamic(() => import('./components/sortable-chapter'), {
  loading: () => <ChapterSkeleton />,
  ssr: false,
});

const CourseStatistics = dynamic(() => import('./components/course-statistics'), {
  loading: () => (
    <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="bg-muted h-4 w-4 animate-pulse rounded" />
              <div className="bg-muted h-4 w-20 animate-pulse rounded" />
            </div>
            <div className="bg-muted mt-2 h-8 w-16 animate-pulse rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  ),
  ssr: false,
});

const CourseOutlinePage = () => {
  const params = useParams();
  const courseId = params.courseId as string;
  const queryClient = useQueryClient();

  // API hooks - Chapters
  const { data: chapters, isLoading } = useChaptersByCourse(courseId);

  const deleteChapterMutation = useDeleteChapter();
  const reorderChaptersMutation = useReorderChapters();

  // API hooks - Lessons
  const deleteLessonMutation = useDeleteLesson();
  const toggleLessonPublishMutation = useToggleLessonPublish();
  const reorderLessonsMutation = useReorderLessons();

  // Local state
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [optimisticChapters, setOptimisticChapters] = useState<IChapter[] | null>(null);

  // Dialog states
  const [chapterDialogOpen, setChapterDialogOpen] = useState(false);
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<IChapter | undefined>();
  const [editingLessonId, setEditingLessonId] = useState<string | undefined>();
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');

  // Use optimistic chapters when dragging, otherwise use server data
  const chaptersToRender = optimisticChapters || chapters;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (active.id !== over?.id) {
      const oldIndex = chapters?.findIndex((chapter) => chapter.id === active.id);
      const newIndex = chapters?.findIndex((chapter) => chapter.id === over?.id);

      // Optimistic Update: Update UI immediately
      const reorderedChapters = arrayMove(chapters || [], oldIndex || 0, newIndex || 0);
      setOptimisticChapters(reorderedChapters);

      const reorderData = {
        chapters: reorderedChapters.map((chapter, index) => ({
          id: chapter.id,
          order: index + 1,
        })),
      };

      // Send API request
      reorderChaptersMutation.mutate(reorderData, {
        onSuccess: () => {
          // Success: Update cache with new data, clear optimistic state
          queryClient.setQueryData(chapterKeys.courseChapters(courseId), reorderedChapters);
          toast.success('Chapter order updated');
          setOptimisticChapters(null);
        },
        onError: () => {
          // Error: Rollback UI to previous state
          toast.error('Failed to update chapter order');
          setOptimisticChapters(null);
        },
      });
    }
  };

  const handleLessonReorder = (chapterId: string, reorderedLessons: ILesson[]) => {
    // Optimistic Update: Update lessons cache immediately
    queryClient.setQueryData(lessonsKeys.chapterLessons(chapterId), reorderedLessons);

    const reorderData = reorderedLessons.map((lesson, index) => ({
      id: lesson.id,
      order: index + 1,
    }));

    reorderLessonsMutation.mutate(
      { reorderData: { lessons: reorderData } },
      {
        onSuccess: () => {
          // Success: Invalidate to ensure fresh data
          queryClient.invalidateQueries({
            queryKey: lessonsKeys.chapterLessons(chapterId),
          });
          // Also invalidate chapters to update totalLessons count if needed
          queryClient.invalidateQueries({
            queryKey: chapterKeys.courseChapters(courseId),
          });
          toast.success('Lesson order updated');
        },
        onError: () => {
          // Error: Invalidate to restore server state
          queryClient.invalidateQueries({
            queryKey: lessonsKeys.chapterLessons(chapterId),
          });
          toast.error('Failed to update lesson order');
        },
      },
    );
  };

  const handleAccordionChange = (expandedChapterIds: string[]) => {
    const newExpanded = new Set(expandedChapterIds);
    setExpandedChapters(newExpanded);
  };

  const handleAddChapter = () => {
    setEditingChapter(undefined);
    setChapterDialogOpen(true);
  };

  const handleEditChapter = (chapter: IChapter) => {
    setEditingChapter(chapter);
    setChapterDialogOpen(true);
  };

  const handleDeleteChapter = (chapterId: string) => {
    deleteChapterMutation.mutate(chapterId, {
      onSuccess: () => {
        toast.success('Chapter deleted successfully');
      },
      onError: () => {
        toast.error('Failed to delete chapter');
      },
    });
  };

  const handleAddLesson = (chapterId: string) => {
    setSelectedChapterId(chapterId);
    setEditingLessonId(undefined);
    setLessonDialogOpen(true);
  };

  const handleEditLesson = (lesson: ILesson, chapterId: string) => {
    setSelectedChapterId(chapterId);
    setEditingLessonId(lesson.id);
    setLessonDialogOpen(true);
  };

  const handleDeleteLesson = (lessonId: string) => {
    deleteLessonMutation.mutate(lessonId, {
      onSuccess: () => {
        toast.success('Lesson deleted successfully');
      },
      onError: () => {
        toast.error('Failed to delete lesson');
      },
    });
  };

  const handleToggleLessonPublish = (lessonId: string) => {
    toggleLessonPublishMutation.mutate(lessonId, {
      onSuccess: (updatedLesson) => {
        toast.success(
          `Lesson ${updatedLesson.published ? 'published' : 'unpublished'} successfully`,
        );
      },
      onError: () => {
        toast.error('Failed to update lesson status');
      },
    });
  };

  const handleLessonSuccess = () => {
    // Auto-expand the chapter to show the new lesson if it was a creation
    if (!editingLessonId && selectedChapterId) {
      const expandedArray = Array.from(expandedChapters);
      if (!expandedArray.includes(selectedChapterId)) {
        handleAccordionChange([...expandedArray, selectedChapterId]);
      }
    }
  };

  const handleChapterDialogChange = (open: boolean) => {
    setChapterDialogOpen(open);
    // Clear editing chapter when dialog closes to prevent state conflicts
    if (!open) {
      setEditingChapter(undefined);
    }
  };

  // Calculate statistics from chaptersToRender (using new API response format)
  const totalChapters = chaptersToRender?.length || 0;

  // Sum up statistics from all chapters
  const { totalLessons, publishedLessons, totalDuration } = (chaptersToRender || []).reduce(
    (acc, chapter) => ({
      totalLessons: acc.totalLessons + (chapter.totalLessons || 0),
      publishedLessons: acc.publishedLessons + (chapter.totalPublishedLessons || 0),
      totalDuration: acc.totalDuration + (chapter.totalDuration || 0),
    }),
    { totalLessons: 0, publishedLessons: 0, totalDuration: 0 },
  );

  return (
    <ProtectedRoute resource={RESOURCES.COURSE} action={OPERATIONS.READ}>
      <div className="container mx-auto space-y-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Course Outline</h1>
            <p className="mt-1 text-gray-600">
              Organize your course content with chapters and lessons
            </p>
          </div>
          <Button onClick={handleAddChapter}>
            <MdAdd className="mr-2 h-4 w-4" />
            Add Chapter
          </Button>
        </div>

        {/* Course Statistics */}
        <CourseStatistics
          totalChapters={totalChapters}
          totalLessons={totalLessons}
          publishedLessons={publishedLessons}
          totalDuration={totalDuration}
          isLoading={isLoading}
        />

        {/* Course Outline */}
        <div className="space-y-4">
          {isLoading ? (
            // Loading state
            Array.from({ length: 3 }).map((_, index) => <ChapterSkeleton key={index} />)
          ) : chaptersToRender?.length === 0 ? (
            // Empty state
            <Card>
              <CardContent className="p-12 text-center">
                <div className="mb-4 text-gray-400">
                  <MdDescription className="mx-auto h-12 w-12" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-600">No chapters yet</h3>
                <p className="mb-6 text-gray-500">Get started by creating your first chapter</p>
                <Button onClick={handleAddChapter}>
                  <MdAdd className="mr-2 h-4 w-4" />
                  Create First Chapter
                </Button>
              </CardContent>
            </Card>
          ) : (
            // Chapters with drag and drop
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={chaptersToRender?.map((chapter) => chapter.id) || []}
                strategy={verticalListSortingStrategy}
              >
                {chaptersToRender?.map((chapter, index) => (
                  <SortableChapter
                    key={chapter.id}
                    chapter={chapter}
                    chapterIndex={index}
                    isExpanded={expandedChapters.has(chapter.id)}
                    onToggleExpanded={handleAccordionChange}
                    onEditChapter={handleEditChapter}
                    onDeleteChapter={handleDeleteChapter}
                    onAddLesson={handleAddLesson}
                    onEditLesson={handleEditLesson}
                    onDeleteLesson={handleDeleteLesson}
                    onToggleLessonPublish={handleToggleLessonPublish}
                    onLessonReorder={handleLessonReorder}
                  />
                ))}
              </SortableContext>

              {/* Drag Overlay */}
              <DragOverlay>
                {activeId ? (
                  <div className="rounded-lg border border-blue-500 bg-white p-4 shadow-lg">
                    <div className="flex items-center gap-2">
                      <MdDragIndicator className="h-5 w-5 text-blue-500" />
                      <span className="font-medium">
                        {chaptersToRender?.find((c) => c.id === activeId)?.title || 'Item'}
                      </span>
                    </div>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
        </div>

        {/* Dialogs */}
        <ChapterFormDialog
          open={chapterDialogOpen}
          onOpenChange={handleChapterDialogChange}
          chapter={editingChapter}
          courseId={courseId}
        />

        <LessonFormDialog
          open={lessonDialogOpen}
          onOpenChange={setLessonDialogOpen}
          lessonId={editingLessonId}
          chapterId={selectedChapterId}
          courseId={courseId}
          onSuccess={handleLessonSuccess}
        />
      </div>
    </ProtectedRoute>
  );
};

export default CourseOutlinePage;
