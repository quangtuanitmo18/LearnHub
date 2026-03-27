'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BookOpen } from 'lucide-react';
import { ICourse } from '@/types/course';
import { getMediaDisplayUrl } from '@/types/media';
import { DEFAULT_THUMBNAIL } from '@/constants';

interface CourseImageCellProps {
  course: ICourse;
}

export function CourseImageCell({ course }: CourseImageCellProps) {
  const imageUrl = course.image ? getMediaDisplayUrl(course.image) : null;

  return (
    <Avatar className="h-10 w-10">
      <AvatarImage src={imageUrl || DEFAULT_THUMBNAIL} alt={course.title} />
      <AvatarFallback className="bg-primary/10">
        <BookOpen className="text-primary h-5 w-5" />
      </AvatarFallback>
    </Avatar>
  );
}
