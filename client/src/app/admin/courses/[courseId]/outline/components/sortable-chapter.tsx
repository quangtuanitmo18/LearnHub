'use client';

import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  MdAccessTime,
  MdAdd,
  MdDelete,
  MdDescription,
  MdDragIndicator,
  MdEdit,
  MdMenuBook,
  MdMoreVert,
} from 'react-icons/md';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { IChapter } from '@/types/chapter';
import { ILesson } from '@/types/lesson';
import { secondsToTimeString } from '@/utils/format';
import { useLessonsByChapter } from '@/hooks/use-lessons';
import SortableLesson from './sortable-lesson';
import { Skeleton } from '@/components/ui/skeleton';
import React from 'react';

interface SortableChapterProps {
  chapter: IChapter;
  chapterIndex: number;
  isExpanded: boolean;
  onToggleExpanded: (value: string[]) => void;
  onEditChapter: (chapter: IChapter) => void;
  onDeleteChapter: (chapterId: string) => void;
  onAddLesson: (chapterId: string) => void;
  onEditLesson: (lesson: ILesson, chapterId: string) => void;
  onDeleteLesson: (lessonId: string) => void;
  onToggleLessonPublish: (lessonId: string) => void;
  onLessonReorder: (chapterId: string, lessons: ILesson[]) => void;
}

const SortableChapter = ({
  chapter,
  chapterIndex,
  isExpanded,
  onToggleExpanded,
  onEditChapter,
  onDeleteChapter,
  onAddLesson,
  onEditLesson,
  onDeleteLesson,
  onToggleLessonPublish,
  onLessonReorder,
}: SortableChapterProps) => {
  // Fetch lessons only when chapter is expanded
  const { data: lessons = [], isLoading: isLoadingLessons } = useLessonsByChapter(
    chapter.id,
    isExpanded,
  );
  console.log(lessons);

  // Use statistics from chapter data (from API response)
  const publishedLessons = chapter.totalPublishedLessons || 0;
  const totalLessons = chapter.totalLessons || 0;
  const totalChapterDuration = chapter.totalDuration || 0;

  // Local state for lesson drag
  const [activeLessonId, setActiveLessonId] = React.useState<string | null>(null);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: chapter.id,
    data: {
      type: 'chapter',
      chapter,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleLessonDragStart = (event: DragStartEvent) => {
    setActiveLessonId(event.active.id as string);
  };

  const handleLessonDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveLessonId(null);

    if (!over || active.id === over.id) return;

    const oldIndex = lessons.findIndex((lesson) => lesson.id === active.id);
    const newIndex = lessons.findIndex((lesson) => lesson.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reorderedLessons = arrayMove(lessons, oldIndex, newIndex).map(
      (lesson, index: number) => ({
        ...lesson,
        order: index + 1,
      }),
    ) as ILesson[];

    onLessonReorder(chapter.id, reorderedLessons);
  };

  const activeLesson = activeLessonId ? lessons.find((l) => l.id === activeLessonId) : null;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`bg-card border-border hover:bg-accent/30 mb-4 border py-2 transition-colors ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <Accordion
        type="multiple"
        value={isExpanded ? [chapter.id] : []}
        onValueChange={(value) => onToggleExpanded(value)}
        className="w-full"
      >
        <AccordionItem value={chapter.id} className="border-0">
          {/* Chapter Header */}
          <div className="group/chapter">
            <AccordionTrigger
              className={`flex items-center justify-between p-4 transition-colors hover:no-underline ${
                isExpanded ? 'border-border border-b' : ''
              }`}
            >
              <div className="flex min-w-0 flex-1 items-start gap-3">
                {/* Drag Handle */}
                <div
                  {...attributes}
                  {...listeners}
                  className="text-muted-foreground hover:text-foreground cursor-grab transition-colors hover:cursor-grabbing"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MdDragIndicator className="h-4 w-4" />
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium">{chapterIndex + 1}.</span>
                    <h3 className="text-card-foreground truncate font-medium">{chapter.title}</h3>
                  </div>
                  {/* Chapter Meta Info */}
                  <div className="mt-1 flex items-center gap-4 text-sm font-normal">
                    {/* Status */}
                    <div className="flex items-center gap-1">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          chapter.isPublished ? 'bg-green-500' : 'bg-yellow-500'
                        }`}
                      />
                      <span className="text-muted-foreground">
                        {chapter.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>

                    {/* Lessons Count */}
                    <div className="flex items-center gap-1">
                      <MdMenuBook className="text-muted-foreground h-4 w-4" />
                      <span className="text-muted-foreground">
                        lessons: {publishedLessons}/{totalLessons}
                      </span>
                    </div>

                    {/* Duration */}
                    <div className="flex items-center gap-1">
                      <MdAccessTime className="text-muted-foreground h-4 w-4" />
                      <span className="text-muted-foreground">
                        Duration: {secondsToTimeString(totalChapterDuration)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex shrink-0 items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddLesson(chapter.id);
                  }}
                  className="h-8 px-3 text-xs"
                >
                  <MdAdd className="mr-1 h-3 w-3" />
                  Add Lesson
                </Button>

                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MdMoreVert className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();

                        onEditChapter(chapter);
                      }}
                    >
                      <MdEdit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();

                        onDeleteChapter(chapter.id);
                      }}
                      className="text-destructive focus:text-destructive"
                    >
                      <MdDelete className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </AccordionTrigger>
          </div>

          {/* Accordion Content - Lessons */}
          <AccordionContent className="p-0">
            <div className="bg-muted/30 px-6 py-4">
              {isLoadingLessons ? (
                // Loading state for lessons
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="bg-card border-border rounded-lg border p-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-48" />
                        <div className="ml-auto flex items-center gap-2">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-8 w-8 rounded" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : lessons.length === 0 ? (
                <div className="bg-card border-border rounded-lg border border-dashed p-8 text-center">
                  <div className="bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                    <MdDescription className="text-muted-foreground h-8 w-8" />
                  </div>
                  <h4 className="text-card-foreground mb-2 text-base font-semibold">
                    No lessons yet
                  </h4>
                  <p className="text-muted-foreground mx-auto mb-6 max-w-sm text-sm">
                    Get started by creating your first lesson. You can add videos, articles, or
                    quizzes.
                  </p>
                  <Button variant="outline" onClick={() => onAddLesson(chapter.id)}>
                    <MdAdd className="mr-2 h-4 w-4" />
                    Create First Lesson
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
                      Lessons ({lessons.length})
                    </h4>
                  </div>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleLessonDragStart}
                    onDragEnd={handleLessonDragEnd}
                  >
                    <SortableContext
                      items={lessons.map((lesson) => lesson.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {lessons.map((lesson, index) => (
                        <SortableLesson
                          key={lesson.id}
                          lesson={lesson}
                          lessonIndex={index}
                          onEditLesson={(l) => onEditLesson(l, chapter.id)}
                          onDeleteLesson={onDeleteLesson}
                          onToggleLessonPublish={onToggleLessonPublish}
                        />
                      ))}
                    </SortableContext>

                    {/* Drag Overlay for Lessons */}
                    <DragOverlay>
                      {activeLesson ? (
                        <div className="rounded-lg border-2 border-blue-500 bg-white p-4 shadow-lg">
                          <div className="flex items-center gap-2">
                            <MdDragIndicator className="h-5 w-5 text-blue-500" />
                            <span className="font-medium">{activeLesson.title}</span>
                          </div>
                        </div>
                      ) : null}
                    </DragOverlay>
                  </DndContext>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
};

export default SortableChapter;
