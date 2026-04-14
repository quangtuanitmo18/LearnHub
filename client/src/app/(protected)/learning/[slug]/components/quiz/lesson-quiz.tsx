'use client';

import Loader from '@/components/loader';
import { useAttemptResult, useAttemptsList, useStartAttempt } from '@/hooks/use-quiz';
import { ILesson } from '@/types/lesson';
import { AttemptStatus, SubmitAttemptResponse } from '@/types/quiz';
import { useEffect, useState } from 'react';
import QuizAttemptDetailsDialog from './quiz-attempt-details-dialog';
import QuizHistoryTable from './quiz-history-table';
import QuizOverview from './quiz-overview';
import QuizResult from './quiz-result';
import QuizTaking from './quiz-taking';

type QuizState = 'overview' | 'taking' | 'result';

interface LessonQuizProps {
  lesson: ILesson;
}

const LessonQuiz = ({ lesson }: LessonQuizProps) => {
  const [quizState, setQuizState] = useState<QuizState>('overview');
  const [currentAttemptId, setCurrentAttemptId] = useState<string | null>(null);
  const [submitResult, setSubmitResult] = useState<SubmitAttemptResponse | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  console.log('LessonQuiz render:', submitResult);

  // Get lessonId for quiz
  const lessonId = lesson.id;

  // Fetch attempts list
  const {
    data: attemptsData,
    isLoading: isAttemptsLoading,
    refetch: refetchAttempts,
  } = useAttemptsList(lessonId);

  const attempts = attemptsData?.attempts || [];
  const maxAttempts = attemptsData?.maxAttempts;
  const usedAttempts = attemptsData?.usedAttempts || 0;

  // Start/resume attempt mutation
  const startAttempt = useStartAttempt();

  // Get result for viewing (when clicking view details)
  const { data: attemptResultData } = useAttemptResult(
    quizState === 'result' ? currentAttemptId : null,
  );

  // Check for IN_PROGRESS attempt on mount
  useEffect(() => {
    if (attemptsData && !isAttemptsLoading) {
      const inProgressAttempt = attempts.find((a) => a.status === AttemptStatus.IN_PROGRESS);
      if (inProgressAttempt) {
        setCurrentAttemptId(inProgressAttempt.attemptId);
        setQuizState('taking');
      }
    }
  }, [attemptsData, isAttemptsLoading, attempts]);

  const handleStartQuiz = async () => {
    try {
      const response = await startAttempt.mutateAsync(lessonId);
      setCurrentAttemptId(response.attemptId);
      setQuizState('taking');
    } catch (error) {
      console.error('Failed to start quiz:', error);
    }
  };

  const handleExitQuiz = () => {
    setCurrentAttemptId(null);
    setQuizState('overview');
    refetchAttempts();
  };

  const handleQuizSuccess = (result: SubmitAttemptResponse) => {
    setSubmitResult(result);
    setQuizState('result');
    refetchAttempts();
  };

  const handleBackToOverview = () => {
    setCurrentAttemptId(null);
    setSubmitResult(null);
    setQuizState('overview');
  };

  const handleViewDetails = (attemptId: string) => {
    setCurrentAttemptId(attemptId);
    setQuizState('result');
  };

  const handleRetry = async () => {
    setSubmitResult(null);
    await handleStartQuiz();
  };

  // Check if lesson has quiz content
  if (!lesson.quiz) {
    return (
      <div className="flex h-64 items-center justify-center px-4">
        <div className="text-center">
          <div className="mb-2 text-base text-gray-600 sm:text-lg">This lesson has no quiz</div>
        </div>
      </div>
    );
  }

  // Show loading while fetching attempts
  if (isAttemptsLoading) {
    return <Loader />;
  }

  // Quiz Result Mode
  if (quizState === 'result') {
    // Use submit result if available, otherwise use fetched result
    const resultData = submitResult || attemptResultData;
    console.log('Rendering QuizResult with data:', resultData);

    if (!resultData) {
      return <Loader />;
    }

    const scorePercent =
      resultData.maxScore > 0 ? (resultData.score / resultData.maxScore) * 100 : 0;

    // Calculate time spent in seconds
    const timeSpent =
      resultData.startedAt && resultData.submittedAt
        ? Math.floor(
            (new Date(resultData.submittedAt).getTime() -
              new Date(resultData.startedAt).getTime()) /
              1000,
          )
        : 0;

    return (
      <>
        <QuizResult
          score={scorePercent}
          totalQuestions={resultData.totalCount}
          correctAnswers={resultData.correctCount}
          timeSpent={timeSpent}
          passingScore={lesson.quiz?.passScore || 70}
          isPassed={resultData.passed}
          isResultMasked={resultData.isResultMasked}
          showResultDate={lesson.quiz?.showResultDate}
          onRetry={usedAttempts < (maxAttempts || Infinity) ? handleRetry : undefined}
          onBackToOverview={handleBackToOverview}
          onViewDetails={
            resultData && !resultData.isResultMasked ? () => setIsDetailsOpen(true) : undefined
          }
        />
        <QuizAttemptDetailsDialog
          open={isDetailsOpen}
          attemptId={currentAttemptId || resultData.attemptId}
          onOpenChange={setIsDetailsOpen}
        />
      </>
    );
  }

  // Quiz Taking Mode
  if (quizState === 'taking' && currentAttemptId) {
    return (
      <QuizTaking
        lessonId={lessonId}
        attemptId={currentAttemptId}
        quizTitle={lesson.title}
        onSuccess={handleQuizSuccess}
        onExit={handleExitQuiz}
      />
    );
  }

  // Default Overview Mode
  return (
    <div className="h-full w-full">
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-6">
        {/* Combined Card for Quiz Overview and History */}
        <div className="overflow-hidden rounded-lg border-0 bg-white shadow-md sm:rounded-xl sm:shadow-lg">
          {/* Quiz Overview Section */}
          <div className="border-b border-gray-100">
            <QuizOverview
              lesson={lesson}
              attempts={attempts}
              maxAttempts={maxAttempts}
              usedAttempts={usedAttempts}
              onStartQuiz={handleStartQuiz}
              isStarting={startAttempt.isPending}
            />
          </div>

          {/* Quiz History Section */}
          <div className="p-4 sm:p-6">
            <QuizHistoryTable
              attempts={attempts}
              isLoading={isAttemptsLoading}
              passingScore={lesson.quiz?.passScore}
              onRefresh={refetchAttempts}
              onViewDetails={handleViewDetails}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonQuiz;
