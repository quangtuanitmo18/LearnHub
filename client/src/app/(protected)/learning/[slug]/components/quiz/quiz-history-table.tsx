'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import QuizAttemptDetailsDialog from './quiz-attempt-details-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AttemptStatus, QuizAttempt } from '@/types/quiz';
import { secondsToDisplayTime } from '@/utils/format';
import {
  MdAccessTime,
  MdCancel,
  MdCheckCircle,
  MdQuiz,
  MdVisibility,
  MdHourglassEmpty,
} from 'react-icons/md';

interface QuizHistoryTableProps {
  attempts?: QuizAttempt[];
  isLoading?: boolean;
  passingScore?: number;
  onRefresh?: () => void;
  onViewDetails?: (attemptId: string) => void;
}

// Quiz history table component
const QuizHistoryTable = ({
  attempts = [],
  isLoading = false,
  passingScore = 70,
  onRefresh,
  onViewDetails,
}: QuizHistoryTableProps) => {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const getStatusBadge = (attempt: QuizAttempt) => {
    switch (attempt.status) {
      case AttemptStatus.SUBMITTED:
        const isPassed = attempt.passed === true;
        return (
          <Badge
            variant={isPassed ? 'default' : 'destructive'}
            className={
              isPassed
                ? 'border-green-500 bg-green-500 text-white hover:bg-green-600'
                : 'border-pink-500 bg-pink-500 text-white hover:bg-pink-600'
            }
          >
            {isPassed ? (
              <>
                <MdCheckCircle className="mr-1 h-3 w-3" />
                Passed
              </>
            ) : (
              <>
                <MdCancel className="mr-1 h-3 w-3" />
                Failed
              </>
            )}
          </Badge>
        );
      case AttemptStatus.IN_PROGRESS:
        return (
          <Badge
            variant="secondary"
            className="border-blue-500 bg-blue-500 text-white hover:bg-blue-600"
          >
            <MdAccessTime className="mr-1 h-3 w-3" />
            In Progress
          </Badge>
        );
      case AttemptStatus.EXPIRED:
        return (
          <Badge variant="outline" className="border-gray-400 text-gray-600">
            <MdHourglassEmpty className="mr-1 h-3 w-3" />
            Expired
          </Badge>
        );
      default:
        return null;
    }
  };

  // Calculate duration from startedAt to submittedAt
  const calculateDuration = (attempt: QuizAttempt): number => {
    if (!attempt.submittedAt) return 0;
    const start = new Date(attempt.startedAt).getTime();
    const end = new Date(attempt.submittedAt).getTime();
    return Math.floor((end - start) / 1000); // in seconds
  };

  // Filter out IN_PROGRESS attempts for history display
  const completedAttempts = attempts.filter((a) => a.status !== AttemptStatus.IN_PROGRESS);

  if (isLoading) {
    return (
      <div>
        <div className="mb-4 flex items-center justify-between sm:mb-6">
          <h3 className="text-lg font-bold text-gray-900 sm:text-xl">Quiz History</h3>
        </div>
        <div className="flex h-32 items-center justify-center">
          <div className="text-xs text-gray-500 sm:text-sm">Loading...</div>
        </div>
      </div>
    );
  }

  if (completedAttempts.length === 0) {
    return (
      <div>
        <div className="mb-4 flex items-center justify-between sm:mb-6">
          <h3 className="text-lg font-bold text-gray-900 sm:text-xl">Quiz History</h3>
        </div>
        <div className="flex h-32 flex-col items-center justify-center px-4 text-center">
          <MdQuiz className="mb-2 h-10 w-10 text-gray-400 sm:h-12 sm:w-12" />
          <div className="text-xs text-gray-500 sm:text-sm">
            You haven&apos;t completed this quiz yet
          </div>
        </div>
      </div>
    );
  }

  // Calculate summary statistics
  const submittedAttempts = completedAttempts.filter((a) => a.status === AttemptStatus.SUBMITTED);
  const passedAttempts = submittedAttempts.filter((a) => a.passed === true);

  const scores = submittedAttempts
    .filter((a) => a.score !== null && a.maxScore !== null && a.maxScore > 0)
    .map((a) => ((a.score || 0) / (a.maxScore || 1)) * 100);

  const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
  const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

  return (
    <div>
      {/* Header */}
      <div className="mb-3 flex items-center justify-between sm:mb-4">
        <h3 className="text-base font-semibold text-gray-900 sm:text-lg">Quiz History</h3>
      </div>

      {/* Table - Horizontal scroll on mobile */}
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="text-xs font-medium whitespace-nowrap text-gray-700 sm:text-sm">
                  #
                </TableHead>
                <TableHead className="text-xs font-medium whitespace-nowrap text-gray-700 sm:text-sm">
                  Date
                </TableHead>
                <TableHead className="text-center text-xs font-medium whitespace-nowrap text-gray-700 sm:text-sm">
                  Score
                </TableHead>
                <TableHead className="text-center text-xs font-medium whitespace-nowrap text-gray-700 sm:text-sm">
                  Correct
                </TableHead>
                <TableHead className="text-center text-xs font-medium whitespace-nowrap text-gray-700 sm:text-sm">
                  Time
                </TableHead>
                <TableHead className="text-center text-xs font-medium whitespace-nowrap text-gray-700 sm:text-sm">
                  Result
                </TableHead>
                <TableHead className="text-center text-xs font-medium whitespace-nowrap text-gray-700 sm:text-sm">
                  Details
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {completedAttempts
                .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
                .map((attempt) => {
                  const scorePercent =
                    attempt.maxScore && attempt.maxScore > 0
                      ? ((attempt.score || 0) / attempt.maxScore) * 100
                      : 0;
                  const duration = calculateDuration(attempt);

                  return (
                    <TableRow
                      key={attempt.attemptId}
                      className="border-b border-gray-100 hover:bg-gray-50/50"
                    >
                      {/* Attempt Number */}
                      <TableCell className="py-2 text-xs font-medium text-gray-900 sm:py-3 sm:text-sm">
                        {attempt.attemptNo}
                      </TableCell>

                      {/* Date */}
                      <TableCell className="py-2 text-xs font-medium whitespace-nowrap text-gray-900 sm:py-3 sm:text-sm">
                        {formatDate(attempt.submittedAt || attempt.startedAt)}
                      </TableCell>

                      {/* Score */}
                      <TableCell className="py-2 text-center text-xs whitespace-nowrap text-gray-600 sm:py-3 sm:text-sm">
                        {attempt.status === AttemptStatus.SUBMITTED ? (
                          <>
                            {attempt.score}/{attempt.maxScore} ({scorePercent.toFixed(1)}%)
                          </>
                        ) : (
                          '-'
                        )}
                      </TableCell>

                      {/* Correct Answers */}
                      <TableCell className="py-2 text-center text-xs text-gray-600 sm:py-3 sm:text-sm">
                        {attempt.status === AttemptStatus.SUBMITTED ? (
                          <>
                            {attempt.correctCount}/{attempt.totalCount}
                          </>
                        ) : (
                          '-'
                        )}
                      </TableCell>

                      {/* Duration */}
                      <TableCell className="py-2 text-center text-xs whitespace-nowrap text-gray-600 sm:py-3 sm:text-sm">
                        {duration > 0 ? secondsToDisplayTime(duration) : '-'}
                      </TableCell>

                      {/* Result */}
                      <TableCell className="py-2 text-center sm:py-3">
                        {getStatusBadge(attempt)}
                      </TableCell>

                      {/* Details */}
                      <TableCell className="py-2 text-center sm:py-3">
                        {attempt.status === AttemptStatus.SUBMITTED && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 hover:bg-gray-100 sm:h-8 sm:w-8"
                            onClick={() => {
                              setSelectedAttemptId(attempt.attemptId);
                              setDetailsOpen(true);
                            }}
                          >
                            <MdVisibility className="h-3.5 w-3.5 text-gray-500 sm:h-4 sm:w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </div>
      </div>

      <QuizAttemptDetailsDialog
        open={detailsOpen}
        attemptId={selectedAttemptId}
        onOpenChange={(open) => {
          setDetailsOpen(open);
          if (!open) {
            setSelectedAttemptId(null);
          }
        }}
      />

      {/* Summary Statistics */}
      {submittedAttempts.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-3 rounded-lg bg-gray-50 p-3 sm:mt-6 sm:gap-4 sm:p-4 md:gap-6">
          <div className="text-center">
            <div className="mb-0.5 text-xs text-gray-600 sm:mb-1 sm:text-sm">Highest:</div>
            <div className="text-sm font-semibold text-gray-900 sm:text-base md:text-lg">
              {highestScore.toFixed(1)}%
            </div>
          </div>
          <div className="text-center">
            <div className="mb-0.5 text-xs text-gray-600 sm:mb-1 sm:text-sm">Average:</div>
            <div className="text-sm font-semibold text-gray-900 sm:text-base md:text-lg">
              {averageScore.toFixed(1)}%
            </div>
          </div>
          <div className="text-center">
            <div className="mb-0.5 text-xs text-gray-600 sm:mb-1 sm:text-sm">Passed:</div>
            <div className="text-sm font-semibold text-gray-900 sm:text-base md:text-lg">
              {passedAttempts.length}/{submittedAttempts.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizHistoryTable;
