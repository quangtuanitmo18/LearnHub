"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import QuizAttemptDetailsDialog from "./quiz-attempt-details-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AttemptStatus, QuizAttempt } from "@/types/quiz";
import { secondsToDisplayTime } from "@/utils/format";
import {
  MdAccessTime,
  MdCancel,
  MdCheckCircle,
  MdQuiz,
  MdVisibility,
  MdHourglassEmpty,
} from "react-icons/md";

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
  passingScore = 70, // eslint-disable-line @typescript-eslint/no-unused-vars
  onRefresh, // eslint-disable-line @typescript-eslint/no-unused-vars
  onViewDetails, // eslint-disable-line @typescript-eslint/no-unused-vars
}: QuizHistoryTableProps) => {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);


  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const getStatusBadge = (attempt: QuizAttempt) => {
    switch (attempt.status) {
      case AttemptStatus.SUBMITTED:
        const isPassed = attempt.passed === true;
        return (
          <Badge
            variant={isPassed ? "default" : "destructive"}
            className={
              isPassed
                ? "bg-green-500 hover:bg-green-600 text-white border-green-500"
                : "bg-pink-500 hover:bg-pink-600 text-white border-pink-500"
            }
          >
            {isPassed ? (
              <>
                <MdCheckCircle className="h-3 w-3 mr-1" />
                Passed
              </>
            ) : (
              <>
                <MdCancel className="h-3 w-3 mr-1" />
                Failed
              </>
            )}
          </Badge>
        );
      case AttemptStatus.IN_PROGRESS:
        return (
          <Badge
            variant="secondary"
            className="bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
          >
            <MdAccessTime className="h-3 w-3 mr-1" />
            In Progress
          </Badge>
        );
      case AttemptStatus.EXPIRED:
        return (
          <Badge variant="outline" className="border-gray-400 text-gray-600">
            <MdHourglassEmpty className="h-3 w-3 mr-1" />
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
  const completedAttempts = attempts.filter(
    (a) => a.status !== AttemptStatus.IN_PROGRESS
  );

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">
            Quiz History
          </h3>
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="text-xs sm:text-sm text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  if (completedAttempts.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">
            Quiz History
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center h-32 text-center px-4">
          <MdQuiz className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-2" />
          <div className="text-xs sm:text-sm text-gray-500">
            You haven&apos;t completed this quiz yet
          </div>
        </div>
      </div>
    );
  }

  // Calculate summary statistics
  const submittedAttempts = completedAttempts.filter(
    (a) => a.status === AttemptStatus.SUBMITTED
  );
  const passedAttempts = submittedAttempts.filter((a) => a.passed === true);

  const scores = submittedAttempts
    .filter((a) => a.score !== null && a.maxScore !== null && a.maxScore > 0)
    .map((a) => ((a.score || 0) / (a.maxScore || 1)) * 100);

  const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
  const averageScore =
    scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
          Quiz History
        </h3>
      </div>

      {/* Table - Horizontal scroll on mobile */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="font-medium text-gray-700 text-xs sm:text-sm whitespace-nowrap">
                  #
                </TableHead>
                <TableHead className="font-medium text-gray-700 text-xs sm:text-sm whitespace-nowrap">
                  Date
                </TableHead>
                <TableHead className="font-medium text-gray-700 text-xs sm:text-sm text-center whitespace-nowrap">
                  Score
                </TableHead>
                <TableHead className="font-medium text-gray-700 text-xs sm:text-sm text-center whitespace-nowrap">
                  Correct
                </TableHead>
                <TableHead className="font-medium text-gray-700 text-xs sm:text-sm text-center whitespace-nowrap">
                  Time
                </TableHead>
                <TableHead className="font-medium text-gray-700 text-xs sm:text-sm text-center whitespace-nowrap">
                  Result
                </TableHead>
                <TableHead className="font-medium text-gray-700 text-xs sm:text-sm text-center whitespace-nowrap">
                  Details
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {completedAttempts
                .sort(
                  (a, b) =>
                    new Date(b.startedAt).getTime() -
                    new Date(a.startedAt).getTime()
                )
                .map((attempt) => {
                  const scorePercent =
                    attempt.maxScore && attempt.maxScore > 0
                      ? ((attempt.score || 0) / attempt.maxScore) * 100
                      : 0;
                  const duration = calculateDuration(attempt);

                  return (
                    <TableRow
                      key={attempt.attemptId}
                      className="hover:bg-gray-50/50 border-b border-gray-100"
                    >
                      {/* Attempt Number */}
                      <TableCell className="font-medium text-xs sm:text-sm text-gray-900 py-2 sm:py-3">
                        {attempt.attemptNo}
                      </TableCell>

                      {/* Date */}
                      <TableCell className="font-medium text-xs sm:text-sm text-gray-900 py-2 sm:py-3 whitespace-nowrap">
                        {formatDate(attempt.submittedAt || attempt.startedAt)}
                      </TableCell>

                      {/* Score */}
                      <TableCell className="text-center text-xs sm:text-sm text-gray-600 py-2 sm:py-3 whitespace-nowrap">
                        {attempt.status === AttemptStatus.SUBMITTED ? (
                          <>
                            {attempt.score}/{attempt.maxScore} (
                            {scorePercent.toFixed(1)}%)
                          </>
                        ) : (
                          "-"
                        )}
                      </TableCell>

                      {/* Correct Answers */}
                      <TableCell className="text-center text-xs sm:text-sm text-gray-600 py-2 sm:py-3">
                        {attempt.status === AttemptStatus.SUBMITTED ? (
                          <>
                            {attempt.correctCount}/{attempt.totalCount}
                          </>
                        ) : (
                          "-"
                        )}
                      </TableCell>

                      {/* Duration */}
                      <TableCell className="text-center text-xs sm:text-sm text-gray-600 py-2 sm:py-3 whitespace-nowrap">
                        {duration > 0 ? secondsToDisplayTime(duration) : "-"}
                      </TableCell>

                      {/* Result */}
                      <TableCell className="text-center py-2 sm:py-3">
                        {getStatusBadge(attempt)}
                      </TableCell>

                      {/* Details */}
                      <TableCell className="text-center py-2 sm:py-3">
                        {attempt.status === AttemptStatus.SUBMITTED && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-gray-100"
                            onClick={() => {
                              setSelectedAttemptId(attempt.attemptId);
                              setDetailsOpen(true);
                            }}
                          >
                            <MdVisibility className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" />
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
        <div className="mt-4 sm:mt-6 grid grid-cols-3 gap-3 sm:gap-4 md:gap-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-xs sm:text-sm text-gray-600 mb-0.5 sm:mb-1">
              Highest:
            </div>
            <div className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">
              {highestScore.toFixed(1)}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs sm:text-sm text-gray-600 mb-0.5 sm:mb-1">
              Average:
            </div>
            <div className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">
              {averageScore.toFixed(1)}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs sm:text-sm text-gray-600 mb-0.5 sm:mb-1">
              Passed:
            </div>
            <div className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">
              {passedAttempts.length}/{submittedAttempts.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizHistoryTable;
