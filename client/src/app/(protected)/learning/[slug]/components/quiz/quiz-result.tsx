'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  MdCheckCircle,
  MdCancel,
  MdRefresh,
  MdArrowBack,
  MdTrendingUp,
  MdAccessTime,
  MdQuestionAnswer,
} from 'react-icons/md';
import { secondsToDisplayTime } from '@/utils/format';

interface QuizResultProps {
  score: number; // percentage
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number; // in minutes
  passingScore: number; // percentage
  isPassed: boolean;
  onRetry?: () => void;
  onBackToOverview?: () => void;
  onViewDetails?: () => void;
  isResultMasked?: boolean;
  showResultDate?: string | null;
}

// Quiz result component - Arrow function
const QuizResult = ({
  score,
  totalQuestions,
  correctAnswers,
  timeSpent,
  passingScore,
  isPassed,
  onRetry,
  onBackToOverview,
  onViewDetails,
  isResultMasked = false,
  showResultDate,
}: QuizResultProps) => {
  const incorrectAnswers = totalQuestions - correctAnswers;

  // Format the result date if available
  const formattedResultDate = showResultDate
    ? new Date(showResultDate).toLocaleString()
    : 'a later date';

  return (
    <div className="flex h-full w-full items-center justify-center bg-gray-50 p-4 sm:p-6">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-4 sm:p-6 md:p-8">
          <div className="space-y-4 text-center sm:space-y-6">
            {/* Result Icon and Status */}
            <div className="space-y-3 sm:space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full sm:h-20 sm:w-20">
                {isPassed ? (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 sm:h-20 sm:w-20">
                    <MdCheckCircle className="h-8 w-8 text-green-600 sm:h-10 sm:w-10" />
                  </div>
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 sm:h-20 sm:w-20">
                    <MdCancel className="h-8 w-8 text-red-600 sm:h-10 sm:w-10" />
                  </div>
                )}
              </div>

              <div>
                <h1 className="mb-2 text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl">
                  {isResultMasked
                    ? 'Submitted Successfully!'
                    : isPassed
                      ? 'Congratulations!'
                      : 'Requirements not met'}
                </h1>
                <p className="px-2 text-sm text-gray-600 sm:text-base md:text-lg">
                  {isResultMasked
                    ? `Your answers have been saved. The results are hidden and will be published on ${formattedResultDate}.`
                    : isPassed
                      ? 'You have successfully completed the quiz'
                      : 'You need to achieve at least ' + passingScore + '% to pass the quiz'}
                </p>
              </div>

              {/* Score Display */}
              {!isResultMasked && (
                <div className="space-y-2 sm:space-y-3">
                  <Badge
                    variant={isPassed ? 'default' : 'destructive'}
                    className={`px-4 py-2 text-xl font-bold sm:px-6 sm:py-3 sm:text-2xl ${
                      isPassed
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-red-500 text-white hover:bg-red-600'
                    }`}
                  >
                    {score.toFixed(1)}%
                  </Badge>
                  <div className="mx-auto w-full max-w-md px-2">
                    <Progress value={score} className="h-2 sm:h-3" />
                    <div className="mt-1 flex justify-between text-xs text-gray-500 sm:text-sm">
                      <span>0%</span>
                      <span className="text-center font-medium">Required: {passingScore}%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Statistics */}
            {!isResultMasked && (
              <div className="grid grid-cols-1 gap-3 border-t border-gray-200 py-4 sm:grid-cols-2 sm:gap-4 sm:py-6 md:gap-6">
                <div className="space-y-3 sm:space-y-4">
                  <div className="rounded-lg bg-gray-50 p-3 sm:p-4">
                    <div className="mb-1.5 flex items-center gap-2 sm:mb-2 sm:gap-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 sm:h-8 sm:w-8">
                        <MdQuestionAnswer className="h-3.5 w-3.5 text-blue-600 sm:h-4 sm:w-4" />
                      </div>
                      <span className="text-xs font-medium text-gray-600 sm:text-sm">
                        Correct answers
                      </span>
                    </div>
                    <p className="text-xl font-bold text-gray-900 sm:text-2xl">
                      {correctAnswers}/{totalQuestions}
                    </p>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-3 sm:p-4">
                    <div className="mb-1.5 flex items-center gap-2 sm:mb-2 sm:gap-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-100 sm:h-8 sm:w-8">
                        <MdCancel className="h-3.5 w-3.5 text-orange-600 sm:h-4 sm:w-4" />
                      </div>
                      <span className="text-xs font-medium text-gray-600 sm:text-sm">
                        Wrong answers
                      </span>
                    </div>
                    <p className="text-xl font-bold text-gray-900 sm:text-2xl">
                      {incorrectAnswers}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <div className="rounded-lg bg-gray-50 p-3 sm:p-4">
                    <div className="mb-1.5 flex items-center gap-2 sm:mb-2 sm:gap-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-100 sm:h-8 sm:w-8">
                        <MdAccessTime className="h-3.5 w-3.5 text-green-600 sm:h-4 sm:w-4" />
                      </div>
                      <span className="text-xs font-medium text-gray-600 sm:text-sm">
                        Completion time
                      </span>
                    </div>
                    <p className="text-xl font-bold text-gray-900 sm:text-2xl">
                      {secondsToDisplayTime(timeSpent)}
                    </p>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-3 sm:p-4">
                    <div className="mb-1.5 flex items-center gap-2 sm:mb-2 sm:gap-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100 sm:h-8 sm:w-8">
                        <MdTrendingUp className="h-3.5 w-3.5 text-purple-600 sm:h-4 sm:w-4" />
                      </div>
                      <span className="text-xs font-medium text-gray-600 sm:text-sm">
                        Score achieved
                      </span>
                    </div>
                    <p className="text-xl font-bold text-gray-900 sm:text-2xl">
                      {((score / 100) * totalQuestions).toFixed(1)}/{totalQuestions}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div
              className={`flex flex-col gap-3 ${isResultMasked ? 'pt-2 sm:pt-4' : 'border-t border-gray-200 pt-4 sm:pt-6'} sm:flex-row sm:gap-4`}
            >
              <Button
                variant="outline"
                onClick={onBackToOverview}
                className="h-10 flex-1 text-sm sm:h-11"
              >
                <MdArrowBack className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Back to overview</span>
                <span className="sm:hidden">Back</span>
              </Button>

              {onViewDetails && (
                <Button
                  variant="outline"
                  onClick={onViewDetails}
                  className="h-10 flex-1 text-sm sm:h-11"
                >
                  View details
                </Button>
              )}

              {onRetry && (
                <Button
                  onClick={onRetry}
                  className="h-10 flex-1 bg-blue-600 text-sm hover:bg-blue-700 sm:h-11"
                >
                  <MdRefresh className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />
                  Retake
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizResult;
