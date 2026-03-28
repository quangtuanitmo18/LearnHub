'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MdAccessTime, MdArrowBack, MdFlag } from 'react-icons/md';
import {
  QuizQuestion,
  QuestionType,
  AnswerPayload,
  AttemptStatus,
  SubmitAttemptResponse,
} from '@/types/quiz';
import { useLoadAttempt, useSaveAnswers, useSubmitAttempt } from '@/hooks/use-quiz';
import Loader from '@/components/loader';

interface QuizTakingProps {
  lessonId: string;
  attemptId: string;
  quizTitle?: string;
  onSuccess: (result: SubmitAttemptResponse) => void;
  onExit?: () => void;
}

// Debounce delay for autosave (ms)
const AUTOSAVE_DEBOUNCE_MS = 2000;

// Quiz taking component
const QuizTaking = ({
  lessonId,
  attemptId,
  quizTitle = 'Quiz Assessment',
  onSuccess,
  onExit,
}: QuizTakingProps) => {
  // Local state for selected answers: { questionId: string[] of optionIds }
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());

  // Submission state management
  const [submissionState, setSubmissionState] = useState<{
    isSubmitting: boolean;
    hasSubmitted: boolean;
    submissionError: string | null;
    autoSubmitAttempted: boolean;
  }>({
    isSubmitting: false,
    hasSubmitted: false,
    submissionError: null,
    autoSubmitAttempted: false,
  });

  // Refs for timer and submission control
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const submissionAttemptedRef = useRef(false);
  const isComponentMountedRef = useRef(true);

  // Load attempt data (questions + savedAnswers)
  const {
    data: attemptData,
    isLoading: isAttemptLoading,
    error: attemptError,
  } = useLoadAttempt(attemptId);

  // Mutations
  const saveAnswersMutation = useSaveAnswers();
  const submitAttemptMutation = useSubmitAttempt();

  const questions = attemptData?.questions || [];
  const savedAnswers = attemptData?.savedAnswers || [];
  const expiresAt = attemptData?.expiresAt;
  const status = attemptData?.status;

  // Initialize answers from savedAnswers
  useEffect(() => {
    if (savedAnswers.length > 0 && Object.keys(answers).length === 0) {
      const initialAnswers: Record<string, string[]> = {};
      savedAnswers.forEach((sa) => {
        initialAnswers[sa.questionId] = sa.selectedOptionIds;
      });
      setAnswers(initialAnswers);
    }
  }, [savedAnswers, answers]);

  // Convert answers to API payload format
  const formatAnswersForBackend = useCallback(
    (answersMap: Record<string, string[]>): AnswerPayload[] => {
      return Object.entries(answersMap).map(([questionId, selectedOptionIds]) => ({
        questionId,
        selectedOptionIds,
      }));
    },
    [],
  );

  // Clear timer utility
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Clear autosave timer
  const clearAutosaveTimer = useCallback(() => {
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }
  }, []);

  // Autosave answers (debounced)
  const autosaveAnswers = useCallback(
    (answersMap: Record<string, string[]>) => {
      if (submissionState.hasSubmitted || status !== AttemptStatus.IN_PROGRESS) {
        return;
      }

      clearAutosaveTimer();

      autosaveTimerRef.current = setTimeout(() => {
        const formattedAnswers = formatAnswersForBackend(answersMap);
        if (formattedAnswers.length > 0) {
          saveAnswersMutation.mutate({
            attemptId,
            answers: formattedAnswers,
          });
        }
      }, AUTOSAVE_DEBOUNCE_MS);
    },
    [
      attemptId,
      formatAnswersForBackend,
      saveAnswersMutation,
      submissionState.hasSubmitted,
      status,
      clearAutosaveTimer,
    ],
  );

  // Handle quiz submission
  const handleQuizSubmission = useCallback(
    async (submissionAnswers: Record<string, string[]>, isAutoSubmit = false) => {
      // Prevent multiple submissions
      if (submissionAttemptedRef.current || submissionState.hasSubmitted) {
        return;
      }

      // Mark submission as attempted and clear timers
      submissionAttemptedRef.current = true;
      clearTimer();
      clearAutosaveTimer();

      // Update submission state
      if (isComponentMountedRef.current) {
        setSubmissionState((prev) => ({
          ...prev,
          isSubmitting: true,
          submissionError: null,
          autoSubmitAttempted: isAutoSubmit,
        }));
      }

      // Format answers for backend
      const formattedAnswers = formatAnswersForBackend(submissionAnswers);

      // Submit the quiz
      submitAttemptMutation.mutate(
        {
          attemptId,
          answers: formattedAnswers,
        },
        {
          onSuccess: (result) => {
            if (isComponentMountedRef.current) {
              setSubmissionState((prev) => ({
                ...prev,
                isSubmitting: false,
                hasSubmitted: true,
                submissionError: null,
              }));
            }

            if (onSuccess) {
              onSuccess(result);
            }
          },
          onError: () => {
            if (isComponentMountedRef.current) {
              setSubmissionState((prev) => ({
                ...prev,
                isSubmitting: false,
                submissionError: isAutoSubmit
                  ? 'Auto-submit error when time expired. Please refresh the page.'
                  : 'Error submitting quiz. Please try again.',
              }));
            }

            // Allow retry for manual submissions
            if (!isAutoSubmit) {
              submissionAttemptedRef.current = false;
            }
          },
        },
      );
    },
    [
      attemptId,
      submitAttemptMutation,
      formatAnswersForBackend,
      onSuccess,
      clearTimer,
      clearAutosaveTimer,
      submissionState.hasSubmitted,
    ],
  );

  // Calculate remaining time based on expiresAt
  const calculateRemainingTime = useCallback(() => {
    if (!expiresAt) return 0;

    const expiresAtTime = new Date(expiresAt).getTime();
    const currentTime = Date.now();
    const remaining = Math.max(0, Math.floor((expiresAtTime - currentTime) / 1000));

    return remaining;
  }, [expiresAt]);

  // Initialize timer when attempt data loads
  useEffect(() => {
    if (!attemptData || submissionState.hasSubmitted || submissionState.isSubmitting) {
      return;
    }

    // Check if attempt is already expired or submitted
    if (status === AttemptStatus.EXPIRED || status === AttemptStatus.SUBMITTED) {
      return;
    }

    const remaining = calculateRemainingTime();
    setTimeRemaining(remaining);

    // If time has already expired, auto-submit
    if (
      remaining <= 0 &&
      expiresAt &&
      !submissionState.autoSubmitAttempted &&
      !submissionAttemptedRef.current
    ) {
      handleQuizSubmission(answers, true);
    }
  }, [
    attemptData,
    calculateRemainingTime,
    expiresAt,
    status,
    submissionState.hasSubmitted,
    submissionState.isSubmitting,
    submissionState.autoSubmitAttempted,
    handleQuizSubmission,
    answers,
  ]);

  // Timer countdown effect
  useEffect(() => {
    if (
      !expiresAt ||
      timeRemaining <= 0 ||
      submissionState.hasSubmitted ||
      submissionState.isSubmitting
    ) {
      return;
    }

    clearTimer();

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Time's up - trigger auto-submit
          if (!submissionAttemptedRef.current && isComponentMountedRef.current) {
            setAnswers((currentAnswers) => {
              handleQuizSubmission(currentAnswers, true);
              return currentAnswers;
            });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearTimer();
  }, [
    expiresAt,
    timeRemaining,
    clearTimer,
    submissionState.hasSubmitted,
    submissionState.isSubmitting,
    handleQuizSubmission,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isComponentMountedRef.current = false;
      clearTimer();
      clearAutosaveTimer();
    };
  }, [clearTimer, clearAutosaveTimer]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId: string, optionId: string, questionType: QuestionType) => {
    // Don't allow answer changes if submitted
    if (submissionState.hasSubmitted) return;

    setAnswers((prev) => {
      const currentAnswers = prev[questionId] || [];
      let newAnswers: string[];

      // Handle different question types
      if (questionType === QuestionType.MULTIPLE_CHOICE) {
        // Multiple choice - toggle selection
        newAnswers = currentAnswers.includes(optionId)
          ? currentAnswers.filter((id) => id !== optionId)
          : [...currentAnswers, optionId];
      } else {
        // Single choice (SINGLE_CHOICE, TRUE_FALSE) - replace selection
        newAnswers = [optionId];
      }

      const updatedAnswers = {
        ...prev,
        [questionId]: newAnswers,
      };

      // Trigger autosave
      autosaveAnswers(updatedAnswers);

      return updatedAnswers;
    });
  };

  const handleFlag = (questionId: string) => {
    if (submissionState.hasSubmitted) return;

    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleSubmit = async () => {
    if (submissionState.isSubmitting || submissionState.hasSubmitted) return;

    // Check for answers
    const hasAnyAnswers = Object.values(answers).some(
      (answerArray) => answerArray && answerArray.length > 0,
    );

    if (!hasAnyAnswers) {
      const confirmSubmit = window.confirm(
        "You haven't answered any questions. Are you sure you want to submit?",
      );
      if (!confirmSubmit) return;
    }

    // Submit the quiz manually
    handleQuizSubmission(answers, false);
  };

  // Retry submission function
  const handleRetrySubmission = () => {
    if (!submissionState.autoSubmitAttempted) {
      submissionAttemptedRef.current = false;
      setSubmissionState((prev) => ({
        ...prev,
        submissionError: null,
      }));
    }
  };

  // Loading state
  if (isAttemptLoading) {
    return <Loader />;
  }

  // Error state
  if (attemptError) {
    return (
      <div className="flex h-64 items-center justify-center px-4">
        <div className="text-center">
          <div className="mb-2 text-base text-red-600 sm:text-lg">Error loading quiz</div>
          <Button variant="outline" onClick={onExit} className="h-9 text-sm sm:h-10">
            Go back
          </Button>
        </div>
      </div>
    );
  }

  // No questions state
  if (questions.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center px-4">
        <div className="text-center">
          <div className="mb-2 text-base text-gray-600 sm:text-lg">No questions available</div>
          <Button variant="outline" onClick={onExit} className="h-9 text-sm sm:h-10">
            Go back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-gray-50">
      {/* Submission Error Banner */}
      {submissionState.submissionError && (
        <div className="flex justify-center border-b border-red-200 bg-red-50 px-3 py-2 sm:px-4 sm:py-3 md:px-6">
          <div className="flex w-full max-w-4xl flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center space-x-2">
              <div className="text-xs font-medium text-red-600 sm:text-sm">
                {submissionState.submissionError}
              </div>
            </div>
            {!submissionState.autoSubmitAttempted && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetrySubmission}
                className="h-8 w-full border-red-300 text-xs text-red-600 hover:bg-red-50 sm:w-auto sm:text-sm"
              >
                Retry
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="flex h-full w-full flex-col lg:flex-row">
        {/* Main Quiz Area */}
        <div className="flex flex-1 flex-col">
          {/* Header */}
          <div className="border-b border-gray-200 bg-white px-3 py-3 sm:px-4 sm:py-4 md:px-6">
            <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onExit}
                className="h-8 px-2 sm:h-9 sm:px-3"
              >
                <MdArrowBack className="mr-1 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">Exit</span>
              </Button>
              <h1 className="flex-1 truncate text-sm font-semibold text-gray-900 sm:text-base md:text-lg">
                {quizTitle}
              </h1>
              {submissionState.hasSubmitted && (
                <Badge
                  variant="secondary"
                  className="bg-green-600 px-2 py-0.5 text-[10px] text-white shadow-sm sm:text-xs"
                >
                  Submitted
                </Badge>
              )}
            </div>
          </div>

          {/* All Questions List */}
          <div className="flex-1 overflow-y-auto p-3 pb-24 sm:p-4 md:p-6 lg:pb-6">
            <div className="mx-auto max-w-4xl space-y-4 sm:space-y-6">
              {questions.map((question, questionIndex) => (
                <Card
                  key={question.id}
                  id={`question-${question.id}`}
                  className={`relative border ${
                    submissionState.hasSubmitted ? 'border-gray-300 bg-gray-50' : 'border-gray-200'
                  }`}
                >
                  <CardContent className="p-3 sm:p-4 md:p-6">
                    <div className="space-y-3 sm:space-y-4">
                      {/* Question Number and Text */}
                      <div>
                        <div className="mb-2 flex flex-wrap items-center space-x-2 gap-y-2 sm:mb-3 sm:space-x-3">
                          <Badge
                            variant="secondary"
                            className="bg-blue-50 px-2 py-0.5 text-[10px] text-blue-600 sm:text-xs"
                          >
                            Question {questionIndex + 1}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="px-2 py-0.5 text-[10px] text-gray-500 sm:text-xs"
                          >
                            {question.points} {question.points === 1 ? 'point' : 'points'}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleFlag(question.id)}
                            disabled={submissionState.hasSubmitted}
                            className={`h-7 w-7 p-0 sm:h-8 sm:w-8 ${
                              flaggedQuestions.has(question.id)
                                ? 'bg-orange-50 text-orange-600'
                                : 'text-gray-400'
                            } ${
                              submissionState.hasSubmitted ? 'cursor-not-allowed opacity-50' : ''
                            }`}
                          >
                            <MdFlag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </Button>
                          {answers[question.id] && answers[question.id].length > 0 && (
                            <Badge
                              variant="outline"
                              className="border-green-200 bg-green-50 px-2 py-0.5 text-[10px] text-green-700 sm:text-xs"
                            >
                              Answered
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:gap-4">
                          <p className="flex-1 text-sm leading-relaxed text-gray-900 sm:text-base md:text-lg">
                            {question.text}
                          </p>
                          {question.type === QuestionType.MULTIPLE_CHOICE && (
                            <Badge
                              variant="secondary"
                              className="self-start border-purple-200 bg-purple-100 text-[10px] text-purple-700 sm:text-xs"
                            >
                              Select multiple
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Answer Options */}
                      <div className="space-y-1.5 sm:space-y-2">
                        {question.options.map((option, optionIndex) => {
                          const optionLabel = String.fromCharCode(65 + optionIndex);
                          const questionAnswers = answers[question.id] || [];
                          const isSelected = questionAnswers.includes(option.id);
                          const isMultipleChoice = question.type === QuestionType.MULTIPLE_CHOICE;

                          return (
                            <label
                              key={option.id}
                              className={`flex items-center space-x-2 rounded-lg border p-2 transition-all sm:space-x-3 sm:p-3 ${
                                submissionState.hasSubmitted
                                  ? 'cursor-not-allowed opacity-75'
                                  : 'cursor-pointer'
                              } ${
                                isSelected
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              <input
                                type={isMultipleChoice ? 'checkbox' : 'radio'}
                                name={`question-${question.id}`}
                                value={option.id}
                                checked={isSelected}
                                disabled={submissionState.hasSubmitted}
                                onChange={() =>
                                  handleAnswerSelect(question.id, option.id, question.type)
                                }
                                className="sr-only"
                              />
                              <div
                                className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center border transition-all sm:h-4 sm:w-4 ${
                                  isMultipleChoice
                                    ? `rounded ${
                                        isSelected
                                          ? 'border-blue-500 bg-blue-500'
                                          : 'border-gray-300'
                                      }`
                                    : `rounded-full ${
                                        isSelected
                                          ? 'border-blue-500 bg-blue-500'
                                          : 'border-gray-300'
                                      }`
                                }`}
                              >
                                {isSelected && (
                                  <div
                                    className={`bg-white ${
                                      isMultipleChoice
                                        ? 'h-1.5 w-1.5 rounded-sm sm:h-2 sm:w-2'
                                        : 'h-1.5 w-1.5 rounded-full sm:h-2 sm:w-2'
                                    }`}
                                  />
                                )}
                              </div>
                              <span className="mr-2 shrink-0 text-xs font-medium text-gray-700 sm:mr-3 sm:text-sm">
                                {optionLabel}.
                              </span>
                              <span className="flex-1 text-xs text-gray-900 sm:text-sm md:text-base">
                                {option.text}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Sidebar - Hidden on mobile */}
        <div className="hidden flex-col border-l border-gray-200 bg-white lg:flex lg:w-80">
          <div className="border-b border-gray-200 bg-white p-4 sm:p-6">
            {expiresAt && (
              <div className="mb-3 flex items-center space-x-2 text-gray-700 sm:mb-4">
                <div className="rounded-full bg-blue-50 p-1.5 sm:p-2">
                  <MdAccessTime className="h-4 w-4 text-blue-600 sm:h-5 sm:w-5" />
                </div>
                <span className="text-xs font-medium text-gray-600 sm:text-sm">
                  Time remaining:
                </span>
                <div
                  className={`rounded-lg border px-2 py-0.5 sm:px-3 sm:py-1 ${
                    timeRemaining <= 60 && timeRemaining > 0
                      ? 'border-red-200 bg-red-100'
                      : timeRemaining === 0 || submissionState.hasSubmitted
                        ? 'border-gray-300 bg-gray-200'
                        : 'border-gray-200 bg-gray-100'
                  }`}
                >
                  <span
                    className={`text-sm font-bold tracking-wider sm:text-base ${
                      timeRemaining <= 60 && timeRemaining > 0
                        ? 'text-red-700'
                        : timeRemaining === 0 || submissionState.hasSubmitted
                          ? 'text-gray-500'
                          : 'text-gray-900'
                    }`}
                  >
                    {timeRemaining === 0 || submissionState.hasSubmitted ? (
                      "TIME'S UP"
                    ) : (
                      <span className="text-lg sm:text-xl">{formatTime(timeRemaining)}</span>
                    )}
                  </span>
                </div>
              </div>
            )}
            {submissionState.hasSubmitted ? (
              <div className="w-full rounded-lg border border-green-200 bg-green-100 py-3 text-center text-base font-semibold text-green-700 sm:py-4 sm:text-lg">
                SUBMITTED
              </div>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={submissionState.isSubmitting || (!!expiresAt && timeRemaining === 0)}
                className={`w-full rounded-lg py-3 text-base font-semibold shadow-sm transition-all duration-200 sm:py-4 sm:text-lg ${
                  submissionState.isSubmitting || (!!expiresAt && timeRemaining === 0)
                    ? 'cursor-not-allowed bg-gray-400'
                    : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md active:bg-blue-800'
                } text-white`}
              >
                {submissionState.isSubmitting ? 'SUBMITTING...' : 'SUBMIT'}
              </Button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-3 sm:p-4">
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {questions.map((currentQuestion, index) => {
                const questionNum = index + 1;
                const isAnswered =
                  answers[currentQuestion.id] && answers[currentQuestion.id].length > 0;
                const isFlagged = flaggedQuestions.has(currentQuestion.id);

                return (
                  <button
                    key={questionNum}
                    onClick={() => {
                      const element = document.getElementById(`question-${currentQuestion.id}`);
                      element?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                      });
                    }}
                    className={`h-9 w-9 rounded border-2 text-xs font-medium transition-all sm:h-10 sm:w-10 sm:text-sm ${
                      isAnswered
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : isFlagged
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {questionNum}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile Bottom Bar - Shown on mobile only */}
        <div className="fixed right-0 bottom-0 left-0 z-50 border-t-2 border-gray-200 bg-white shadow-2xl lg:hidden">
          <div className="p-3 sm:p-4">
            <div className="mb-3 flex items-center justify-between gap-2 sm:gap-3">
              {expiresAt && (
                <div className="flex min-w-0 flex-1 items-center space-x-1.5 text-gray-700 sm:space-x-2">
                  <div className="rounded-full bg-blue-50 p-1 sm:p-1.5">
                    <MdAccessTime className="h-3.5 w-3.5 text-blue-600 sm:h-4 sm:w-4" />
                  </div>
                  <span className="text-[10px] font-medium whitespace-nowrap text-gray-600 sm:text-xs">
                    Time:
                  </span>
                  <div
                    className={`rounded border px-1.5 py-0.5 sm:px-2 ${
                      timeRemaining <= 60 && timeRemaining > 0
                        ? 'border-red-200 bg-red-100'
                        : timeRemaining === 0 || submissionState.hasSubmitted
                          ? 'border-gray-300 bg-gray-200'
                          : 'border-gray-200 bg-gray-100'
                    }`}
                  >
                    <span
                      className={`text-[10px] font-bold sm:text-xs ${
                        timeRemaining <= 60 && timeRemaining > 0
                          ? 'text-red-700'
                          : timeRemaining === 0 || submissionState.hasSubmitted
                            ? 'text-gray-500'
                            : 'text-gray-900'
                      }`}
                    >
                      {timeRemaining === 0 || submissionState.hasSubmitted
                        ? 'UP'
                        : formatTime(timeRemaining)}
                    </span>
                  </div>
                </div>
              )}
              {submissionState.hasSubmitted ? (
                <div className="rounded-lg border border-green-200 bg-green-100 px-3 py-1.5 text-[10px] font-semibold text-green-700 sm:px-4 sm:py-2 sm:text-xs">
                  SUBMITTED
                </div>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={submissionState.isSubmitting || (!!expiresAt && timeRemaining === 0)}
                  className={`h-auto rounded-lg px-3 py-1.5 text-[10px] font-semibold shadow-sm transition-all duration-200 sm:px-4 sm:py-2 sm:text-xs ${
                    submissionState.isSubmitting || (!!expiresAt && timeRemaining === 0)
                      ? 'cursor-not-allowed bg-gray-400'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white`}
                >
                  {submissionState.isSubmitting ? '...' : 'SUBMIT'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizTaking;
