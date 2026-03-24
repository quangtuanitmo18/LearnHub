"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  MdQuiz,
  MdPlayArrow,
  MdRestartAlt,
  MdAccessTime,
  MdQuestionAnswer,
  MdTrendingUp,
  MdRefresh,
} from "react-icons/md";
import { QuizAttempt, AttemptStatus } from "@/types/quiz";
import { secondsToDisplayTime } from "@/utils/format";
import { ILesson } from "@/types/lesson";

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
  const quizTitle = lesson?.title || "Quiz";
  const description = lesson?.description || "Knowledge assessment test";
  const totalQuestions = lesson?.quiz?.questions?.length || 0;
  const timeLimit = lesson?.quiz?.durationSec;
  const passingScore = lesson?.quiz?.passScore || 70;

  // Check if user has an ongoing (IN_PROGRESS) attempt
  const inProgressAttempt = attempts.find(
    (a) => a.status === AttemptStatus.IN_PROGRESS
  );
  const hasOngoingAttempt = !!inProgressAttempt;

  // Calculate attempts info
  const hasStarted = usedAttempts > 0;
  const canRetake = maxAttempts === null || usedAttempts < maxAttempts;

  return (
    <div className="overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 p-4 sm:p-6">
        {/* Section Title */}
        <div className="mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
            Quiz
          </h2>
        </div>

        {/* Quiz Title with Icon and Status */}
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="shrink-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center">
              <MdQuiz className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">
                {quizTitle}
              </h3>
            </div>

            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {/* Quiz Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between py-2 sm:py-3 border-b border-gray-100">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                  <MdQuestionAnswer className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
                <span className="text-xs sm:text-sm text-gray-600 font-medium truncate">
                  Number of questions:
                </span>
              </div>
              <span className="text-base sm:text-lg font-bold text-gray-900 ml-2 shrink-0">
                {totalQuestions}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 sm:py-3 border-b border-gray-100">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                  <MdAccessTime className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                </div>
                <span className="text-xs sm:text-sm text-gray-600 font-medium truncate">
                  Time limit:
                </span>
              </div>
              <span className="text-base sm:text-lg font-bold text-gray-900 ml-2 shrink-0">
                {timeLimit ? secondsToDisplayTime(timeLimit) : "No limit"}
              </span>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between py-2 sm:py-3 border-b border-gray-100">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                  <MdRefresh className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                </div>
                <span className="text-xs sm:text-sm text-gray-600 font-medium truncate">
                  Total attempts:
                </span>
              </div>
              <span className="text-base sm:text-lg font-bold text-gray-900 ml-2 shrink-0">
                {usedAttempts}/{maxAttempts ?? "∞"}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 sm:py-3 border-b border-gray-100">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                  <MdTrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                </div>
                <span className="text-xs sm:text-sm text-gray-600 font-medium truncate">
                  Minimum score to pass:
                </span>
              </div>
              <span className="text-base sm:text-lg font-bold text-gray-900 ml-2 shrink-0">
                {passingScore}%
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 sm:pt-6 border-t border-gray-100">
          {/* Status Messages */}
          {hasOngoingAttempt && (
            <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-blue-50 rounded-lg text-center border border-blue-200">
              <p className="text-xs sm:text-sm text-blue-700 font-medium">
                You have an ongoing quiz. Click &ldquo;Continue Quiz&rdquo; to
                complete it.
              </p>
            </div>
          )}

          {maxAttempts !== null &&
            usedAttempts >= maxAttempts &&
            !hasOngoingAttempt && (
              <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-xs sm:text-sm text-gray-500 italic font-medium">
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
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors duration-200 text-sm sm:text-base h-10 sm:h-12"
                >
                  <MdPlayArrow className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                  {isStarting ? "Loading..." : "Continue Quiz"}
                </Button>
              )}

              {/* Start new quiz (no previous attempts) */}
              {!hasOngoingAttempt && !hasStarted && (
                <Button
                  onClick={onStartQuiz}
                  disabled={isStarting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors duration-200 text-sm sm:text-base h-10 sm:h-12"
                >
                  <MdPlayArrow className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                  {isStarting ? "Starting..." : "Start Quiz"}
                </Button>
              )}

              {/* Retake quiz (has completed attempts and can retake) */}
              {!hasOngoingAttempt && hasStarted && canRetake && (
                <Button
                  onClick={onStartQuiz}
                  disabled={isStarting}
                  variant="outline"
                  className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors duration-200 text-sm sm:text-base h-10 sm:h-12"
                >
                  <MdRestartAlt className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                  {isStarting ? "Starting..." : "Retake"}
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
