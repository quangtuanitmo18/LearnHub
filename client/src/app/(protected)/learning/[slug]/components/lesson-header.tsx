'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CircularProgress } from '@/components/ui/circular-progress';
import { ArrowLeft, Compass } from 'lucide-react';

import { useClaimCertificate, useMyCertificates } from '@/hooks/use-certificate';
import { Award, Loader2 } from 'lucide-react';

interface LessonHeaderProps {
  courseTitle: string;
  courseSlug: string;
  courseId?: string;
  completedLessons: number;
  totalLessons: number;
  onGuideClick?: () => void;
}

// Lesson header component - Arrow function
const LessonHeader = ({
  courseTitle,
  courseSlug,
  courseId,
  completedLessons,
  totalLessons,
  onGuideClick,
}: LessonHeaderProps) => {
  const claimMutation = useClaimCertificate();
  const progressPercentage =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const { data: certificates } = useMyCertificates();
  const hasClaimed = certificates?.some((cert) => cert.courseId === courseId);
  const router = useRouter();

  const isCompleted = completedLessons === totalLessons && totalLessons > 0;

  const handleClaim = () => {
    if (!courseId) return;
    if (hasClaimed) {
      router.push('/my-certificates');
      return;
    }
    claimMutation.mutate(courseId, {
      onSuccess: () => {
        // Option to redirect to dashboard upon claiming
        router.push('/my-certificates');
      }
    });
  };

  return (
    <div className="fixed top-0 right-0 left-0 z-50 border-b border-slate-700 bg-slate-900 text-white">
      <div className="flex h-14 items-center justify-between px-3 sm:h-16 sm:px-4 md:px-6">
        {/* Left Section */}
        <div className="flex min-w-0 flex-1 items-center space-x-2 sm:space-x-3 md:space-x-4">
          <Link href={`/courses/${courseSlug}`}>
            <Button
              variant="ghost"
              size="sm"
              className="group h-8 w-8 p-1.5 text-white transition-all duration-200 hover:bg-slate-800 hover:text-white sm:h-9 sm:w-9 sm:p-2"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-colors duration-200 group-hover:text-white sm:h-4 sm:w-4" />
            </Button>
          </Link>

          <h1 className="truncate text-xs font-semibold sm:text-sm md:text-base">{courseTitle}</h1>
        </div>

        {/* Right Section */}
        <div className="flex shrink-0 items-center space-x-2 text-xs sm:space-x-4 sm:text-sm md:space-x-6">
          {/* Certificate or Progress */}
          {isCompleted ? (
            <Button 
              onClick={handleClaim} 
              disabled={claimMutation.isPending && !hasClaimed}
              size="sm"
              className={hasClaimed 
                ? "bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-md" 
                : "bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white border-0 shadow-lg"}
            >
              {claimMutation.isPending && !hasClaimed ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Award className="mr-1.5 h-4 w-4" />
              )}
              {hasClaimed ? 'View Certificate' : 'Claim Certificate'}
            </Button>
          ) : (
            <div
              id="tour-progress"
              className="flex items-center space-x-1.5 sm:space-x-2 md:space-x-3"
            >
              <CircularProgress
                value={progressPercentage}
                size="sm"
                color="blue"
                thickness={3}
                className="h-8 w-8 text-white sm:h-10 sm:w-10"
              />
              <div className="hidden text-center sm:block">
                <div className="text-xs font-semibold whitespace-nowrap sm:text-sm">
                  {completedLessons}/{totalLessons} lessons
                </div>
              </div>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={onGuideClick}
            className="group hidden h-9 items-center space-x-2 text-white transition-all duration-200 hover:bg-slate-800 hover:text-white md:flex"
          >
            <Compass className="h-4 w-4 transition-transform duration-200 group-hover:rotate-45" />
            <span className="transition-colors duration-200 group-hover:text-white">Guide</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LessonHeader;
