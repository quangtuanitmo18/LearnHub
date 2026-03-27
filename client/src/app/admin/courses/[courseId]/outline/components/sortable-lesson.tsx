'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  MdAccessTime,
  MdDelete,
  MdDescription,
  MdDragIndicator,
  MdEdit,
  MdHelpOutline,
  MdMoreVert,
  MdOutlineSlowMotionVideo,
  MdVisibility,
  MdVisibilityOff,
} from 'react-icons/md';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { ILesson, LessonType } from '@/types/lesson';
import { secondsToDisplayTime } from '@/utils/format';

const getContentTypeConfig = (type: LessonType) => {
  switch (type) {
    case LessonType.VIDEO:
      return {
        icon: <MdOutlineSlowMotionVideo className="h-4 w-4" />,
        label: 'Video',
      };
    case LessonType.ARTICLE:
      return {
        icon: <MdDescription className="h-4 w-4" />,
        label: 'Article',
      };
    case LessonType.QUIZ:
      return {
        icon: <MdHelpOutline className="h-4 w-4" />,
        label: 'Quiz',
      };
    default:
      return {
        icon: <MdDescription className="h-4 w-4" />,
        label: 'Content',
      };
  }
};

interface SortableLessonProps {
  lesson: ILesson;
  lessonIndex: number;
  onEditLesson: (lesson: ILesson) => void;
  onDeleteLesson: (lessonId: string) => void;
  onToggleLessonPublish: (lessonId: string) => void;
}

const SortableLesson = ({
  lesson,
  lessonIndex,
  onEditLesson,
  onDeleteLesson,
  onToggleLessonPublish,
}: SortableLessonProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lesson.id,
    data: {
      type: 'lesson',
      lesson,
    },
  });
  console.log(lesson);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const contentConfig = React.useMemo(() => getContentTypeConfig(lesson.type), [lesson.type]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-card border-border rounded-lg border transition-colors ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="p-4">
        {/* Main Row */}
        <div className="flex items-center justify-between">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {/* Drag Handle */}
            <div
              {...attributes}
              {...listeners}
              className="text-muted-foreground hover:text-foreground cursor-grab transition-colors hover:cursor-grabbing"
            >
              <MdDragIndicator className="h-4 w-4" />
            </div>

            {/* Lesson Number & Title */}
            <div className="flex min-w-0 flex-1 items-center gap-1">
              <span className="text-sm font-medium">{lessonIndex + 1}.</span>
              <h4 className="text-card-foreground truncate font-medium">{lesson.title}</h4>
            </div>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-2">
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MdMoreVert className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditLesson(lesson);
                  }}
                >
                  <MdEdit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleLessonPublish(lesson.id);
                  }}
                >
                  {lesson.published ? (
                    <>
                      <MdVisibilityOff className="mr-2 h-4 w-4" />
                      Unpublish
                    </>
                  ) : (
                    <>
                      <MdVisibility className="mr-2 h-4 w-4" />
                      Publish
                    </>
                  )}
                </DropdownMenuItem>
                <Separator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteLesson(lesson.id);
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <MdDelete className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Meta Information Row */}
        <div className="mt-1 ml-8 flex items-center gap-4 text-sm">
          {/* Content Type */}
          <div className="flex items-center gap-1">
            <div className="text-muted-foreground">{contentConfig.icon}</div>
            <span className="text-muted-foreground">{contentConfig.label}</span>
          </div>

          {/* Status */}
          <div className="flex items-center gap-1">
            <div
              className={`h-2 w-2 rounded-full ${
                lesson.published ? 'bg-green-500' : 'bg-yellow-500'
              }`}
            />
            <span className="text-muted-foreground">
              {lesson.published ? 'Published' : 'Draft'}
            </span>
          </div>

          {/* Duration */}
          <div className="flex items-center gap-1">
            <MdAccessTime className="text-muted-foreground h-4 w-4" />
            <span className="text-muted-foreground">
              Duration: {secondsToDisplayTime(lesson?.durationSec || 0)}
            </span>
          </div>
        </div>

        {/* Description */}
        {lesson.description && (
          <p className="text-muted-foreground mt-2 ml-8 line-clamp-1 text-sm">
            {lesson.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default React.memo(SortableLesson);
