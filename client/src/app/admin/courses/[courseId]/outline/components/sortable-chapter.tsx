"use client";

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
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  MdAccessTime,
  MdAdd,
  MdDelete,
  MdDescription,
  MdDragIndicator,
  MdEdit,
  MdMenuBook,
  MdMoreVert,
} from "react-icons/md";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IChapter } from "@/types/chapter";
import { ILesson } from "@/types/lesson";
import { secondsToTimeString } from "@/utils/format";
import { useLessonsByChapter } from "@/hooks/use-lessons";
import SortableLesson from "./sortable-lesson";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

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
  const { data: lessons = [], isLoading: isLoadingLessons } =
    useLessonsByChapter(chapter.id, isExpanded);
  console.log(lessons);

  // Use statistics from chapter data (from API response)
  const publishedLessons = chapter.totalPublishedLessons || 0;
  const totalLessons = chapter.totalLessons || 0;
  const totalChapterDuration = chapter.totalDuration || 0;

  // Local state for lesson drag
  const [activeLessonId, setActiveLessonId] = React.useState<string | null>(
    null
  );

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: chapter.id,
    data: {
      type: "chapter",
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
    })
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
      })
    ) as ILesson[];

    onLessonReorder(chapter.id, reorderedLessons);
  };

  const activeLesson = activeLessonId
    ? lessons.find((l) => l.id === activeLessonId)
    : null;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`mb-4 py-2 bg-card border border-border hover:bg-accent/30 transition-colors ${
        isDragging ? "opacity-50" : ""
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
              className={`flex items-center justify-between p-4 hover:no-underline transition-colors ${
                isExpanded ? "border-b border-border" : ""
              }`}
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {/* Drag Handle */}
                <div
                  {...attributes}
                  {...listeners}
                  className="cursor-grab hover:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MdDragIndicator className="h-4 w-4" />
                </div>

                <div className="flex  flex-col gap-1 flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium ">
                      {chapterIndex + 1}.
                    </span>
                    <h3 className="font-medium text-card-foreground truncate">
                      {chapter.title}
                    </h3>
                  </div>
                  {/* Chapter Meta Info */}
                  <div className="flex items-center gap-4 mt-1 text-sm font-normal">
                    {/* Status */}
                    <div className="flex items-center gap-1">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          chapter.isPublished ? "bg-green-500" : "bg-yellow-500"
                        }`}
                      />
                      <span className="text-muted-foreground">
                        {chapter.isPublished ? "Published" : "Draft"}
                      </span>
                    </div>

                    {/* Lessons Count */}
                    <div className="flex items-center gap-1">
                      <MdMenuBook className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        lessons: {publishedLessons}/{totalLessons}
                      </span>
                    </div>

                    {/* Duration */}
                    <div className="flex items-center gap-1">
                      <MdAccessTime className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Duration: {secondsToTimeString(totalChapterDuration)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddLesson(chapter.id);
                  }}
                  className="h-8 px-3 text-xs"
                >
                  <MdAdd className="h-3 w-3 mr-1" />
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
                      <MdEdit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();

                        onDeleteChapter(chapter.id);
                      }}
                      className="text-destructive focus:text-destructive"
                    >
                      <MdDelete className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </AccordionTrigger>
          </div>

          {/* Accordion Content - Lessons */}
          <AccordionContent className="p-0">
            <div className="px-6 py-4 bg-muted/30">
              {isLoadingLessons ? (
                // Loading state for lessons
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="bg-card rounded-lg p-4 border border-border"
                    >
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
                <div className="bg-card rounded-lg p-8 text-center border border-dashed border-border">
                  <div className="bg-muted rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <MdDescription className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h4 className="text-base font-semibold text-card-foreground mb-2">
                    No lessons yet
                  </h4>
                  <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                    Get started by creating your first lesson. You can add
                    videos, articles, or quizzes.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => onAddLesson(chapter.id)}
                  >
                    <MdAdd className="h-4 w-4 mr-2" />
                    Create First Lesson
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
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
                        <div className="bg-white rounded-lg shadow-lg border-2 border-blue-500 p-4">
                          <div className="flex items-center gap-2">
                            <MdDragIndicator className="h-5 w-5 text-blue-500" />
                            <span className="font-medium">
                              {activeLesson.title}
                            </span>
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
