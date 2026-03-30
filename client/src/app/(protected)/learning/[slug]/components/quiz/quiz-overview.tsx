'use client';

import { Button } from '@/components/ui/button';
import { ILesson } from '@/types/lesson';
import { AttemptStatus, QuizAttempt } from '@/types/quiz';
import { secondsToDisplayTime } from '@/utils/format';
import {
  MdAccessTime,
  MdPlayArrow,
  MdQuestionAnswer,
  MdQuiz,
  MdRefresh,
  MdRestartAlt,
  MdTrendingUp,
} from 'react-icons/md';

interface QuizOverviewProps {
  lesson?: ILesson;
  attempts?: QuizAttempt[];
  maxAttempts?: number | null;
  usedAttempts?: number;
  onStartQuiz?: () => void;
  isStarting?: boolean;
}

// Quiz overview component
const QuizOverview = ({
  lesson,
  attempts = [],
  maxAttempts,
  usedAttempts = 0,
  onStartQuiz,
  isStarting = false,
}: QuizOverviewProps) => {
  // Extract data from lesson quiz content
  const quizTitle = lesson?.title || 'Quiz';
  const description = lesson?.description || 'Knowledge assessment test';
  const totalQuestions = lesson?.quiz?.questions?.length || 0;
  const timeLimit = lesson?.quiz?.durationSec;
  const passingScore = lesson?.quiz?.passScore || 70;

  // Check if user has an ongoing (IN_PROGRESS) attempt
  const inProgressAttempt = attempts.find((a) => a.status === AttemptStatus.IN_PROGRESS);
  const hasOngoingAttempt = !!inProgressAttempt;

  // Calculate attempts info
  const hasStarted = usedAttempts > 0;
  const canRetake = maxAttempts == null || usedAttempts < maxAttempts;

  return (
    <div className="overflow-hidden">
      <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6">
        {/* Section Title */}
        <div className="mb-3 sm:mb-4">
          <h2 className="mb-2 text-lg font-bold text-gray-900 sm:text-xl">Quiz</h2>
        </div>

        {/* Quiz Title with Icon and Status */}
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 sm:h-12 sm:w-12 sm:rounded-xl">
              <MdQuiz className="h-5 w-5 text-blue-600 sm:h-6 sm:w-6" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2 sm:gap-3">
              <h3 className="truncate text-lg font-bold text-gray-900 sm:text-xl md:text-2xl">
                {quizTitle}
              </h3>
            </div>

            <p className="text-sm leading-relaxed text-gray-600 sm:text-base">{description}</p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {/* Quiz Statistics Grid */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:grid-cols-2 sm:gap-6">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 py-2 sm:py-3">
              <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 sm:h-10 sm:w-10">
                  <MdQuestionAnswer className="h-4 w-4 text-blue-600 sm:h-5 sm:w-5" />
                </div>
                <span className="truncate text-xs font-medium text-gray-600 sm:text-sm">
                  Number of questions:
                </span>
              </div>
              <span className="ml-2 shrink-0 text-base font-bold text-gray-900 sm:text-lg">
                {totalQuestions}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-gray-100 py-2 sm:py-3">
              <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 sm:h-10 sm:w-10">
                  <MdAccessTime className="h-4 w-4 text-green-600 sm:h-5 sm:w-5" />
                </div>
                <span className="truncate text-xs font-medium text-gray-600 sm:text-sm">
                  Time limit:
                </span>
              </div>
              <span className="ml-2 shrink-0 text-base font-bold text-gray-900 sm:text-lg">
                {timeLimit ? secondsToDisplayTime(timeLimit) : 'No limit'}
              </span>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 py-2 sm:py-3">
              <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-100 sm:h-10 sm:w-10">
                  <MdRefresh className="h-4 w-4 text-purple-600 sm:h-5 sm:w-5" />
                </div>
                <span className="truncate text-xs font-medium text-gray-600 sm:text-sm">
                  Total attempts:
                </span>
              </div>
              <span className="ml-2 shrink-0 text-base font-bold text-gray-900 sm:text-lg">
                {usedAttempts}/{maxAttempts ?? '∞'}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-gray-100 py-2 sm:py-3">
              <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-100 sm:h-10 sm:w-10">
                  <MdTrendingUp className="h-4 w-4 text-orange-600 sm:h-5 sm:w-5" />
                </div>
                <span className="truncate text-xs font-medium text-gray-600 sm:text-sm">
                  Minimum score to pass:
                </span>
              </div>
              <span className="ml-2 shrink-0 text-base font-bold text-gray-900 sm:text-lg">
                {passingScore}%
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-t border-gray-100 pt-4 sm:pt-6">
          {/* Status Messages */}
          {hasOngoingAttempt && (
            <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-center sm:mb-4 sm:p-4">
              <p className="text-xs font-medium text-blue-700 sm:text-sm">
                You have an ongoing quiz. Click &ldquo;Continue Quiz&rdquo; to complete it.
              </p>
            </div>
          )}

          {maxAttempts != null && usedAttempts >= maxAttempts && !hasOngoingAttempt && (
            <div className="mb-3 rounded-lg bg-gray-50 p-3 text-center sm:mb-4 sm:p-4">
              <p className="text-xs font-medium text-gray-500 italic sm:text-sm">
                No attempts remaining
              </p>
            </div>
          )}

          {/* Button Actions */}
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            {/* Main Action Button */}
            <div className="flex-1">
              {/* Continue ongoing quiz attempt */}
              {hasOngoingAttempt && (
                <Button
                  onClick={onStartQuiz}
                  disabled={isStarting}
                  className="h-10 w-full rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-green-700 sm:h-12 sm:px-6 sm:py-3 sm:text-base"
                >
                  <MdPlayArrow className="mr-1.5 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" />
                  {isStarting ? 'Loading...' : 'Continue Quiz'}
                </Button>
              )}

              {/* Start new quiz (no previous attempts) */}
              {!hasOngoingAttempt && !hasStarted && (
                <Button
                  onClick={onStartQuiz}
                  disabled={isStarting}
                  className="h-10 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-700 sm:h-12 sm:px-6 sm:py-3 sm:text-base"
                >
                  <MdPlayArrow className="mr-1.5 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" />
                  {isStarting ? 'Starting...' : 'Start Quiz'}
                </Button>
              )}

              {/* Retake quiz (has completed attempts and can retake) */}
              {!hasOngoingAttempt && hasStarted && canRetake && (
                <Button
                  onClick={onStartQuiz}
                  disabled={isStarting}
                  variant="outline"
                  className="h-10 w-full rounded-lg border-2 border-blue-600 px-4 py-2.5 text-sm font-semibold text-blue-600 transition-colors duration-200 hover:bg-blue-50 sm:h-12 sm:px-6 sm:py-3 sm:text-base"
                >
                  <MdRestartAlt className="mr-1.5 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" />
                  {isStarting ? 'Starting...' : 'Retake'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizOverview;
