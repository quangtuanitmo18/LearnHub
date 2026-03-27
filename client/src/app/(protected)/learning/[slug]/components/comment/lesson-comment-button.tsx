'use client';

import { Button } from '@/components/ui/button';
import { FaComments } from 'react-icons/fa6';
import { cn } from '@/lib/utils';

interface LessonCommentButtonProps {
  className?: string;
  onClick: () => void;
}

function LessonCommentButton({ className, onClick }: LessonCommentButtonProps) {
  return (
    <div className={cn('fixed z-50', className)}>
      <Button
        onClick={onClick}
        className={cn(
          'h-9 rounded-full px-3 shadow-lg transition-all duration-300 sm:h-10 sm:px-4',
          'bg-linear-to-br from-sky-500 via-blue-600 to-blue-700 text-white',
          'border-2 border-white/30 backdrop-blur-xl',
          'hover:scale-105 hover:shadow-xl hover:shadow-sky-500/25',
          'hover:from-sky-600 hover:via-blue-700 hover:to-blue-800',
          'transform-gpu will-change-transform active:scale-95',
          'flex min-w-fit items-center justify-center gap-1.5 sm:gap-2',
        )}
      >
        <FaComments className="h-4 w-4 text-white drop-shadow-sm sm:h-5 sm:w-5" />
        <span className="text-xs font-medium text-white drop-shadow-sm sm:text-sm">Q&A</span>
      </Button>
    </div>
  );
}

export default LessonCommentButton;
