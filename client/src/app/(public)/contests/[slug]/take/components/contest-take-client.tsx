'use client';

import { useContestAttempts } from '@/hooks/use-contests';
import { useAttemptResult } from '@/hooks/use-quiz';
import { useIsAuthenticated, useIsLoading } from '@/stores/auth-store';
import { Contest } from '@/types/contest';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import QuizTaking from '@/app/(protected)/learning/[slug]/components/quiz/quiz-taking';
import QuizResult from '@/app/(protected)/learning/[slug]/components/quiz/quiz-result';

interface ContestTakeClientProps {
  contest: Contest;
}

const ContestTakeClient = ({ contest }: ContestTakeClientProps) => {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const authLoading = useIsLoading();
  const [activeAttemptId, setActiveAttemptId] = useState<string | null>(null);
  const [completedAttemptId, setCompletedAttemptId] = useState<string | null>(null);

  // Always enable, we will handle redirect if unauthenticated
  const {
    data: attemptsData,
    isLoading: attemptsLoading,
    refetch,
  } = useContestAttempts(contest.id, isAuthenticated);

  const { data: attemptResultData } = useAttemptResult(completedAttemptId, {
    enabled: !!completedAttemptId,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/auth/login?callbackUrl=/contests/${contest.slug}`);
    }
  }, [authLoading, isAuthenticated, router, contest.slug]);

  useEffect(() => {
    const data = attemptsData as any;
    if (data?.attempts && data.attempts.length > 0) {
      // Find an in-progress attempt
      const active = data.attempts.find((a: any) => a.status === 'IN_PROGRESS');
      if (active) {
        setActiveAttemptId(active.attemptId || active.id || active._id);
        setCompletedAttemptId(null);
      } else {
        // Find the most recent completed attempt
        const latest = data.attempts[0];
        setActiveAttemptId(null);
        setCompletedAttemptId(latest.attemptId || latest.id || latest._id);
      }
    }
  }, [attemptsData]);

  if (authLoading || attemptsLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        <p className="text-sm text-slate-500">Loading your contest session...</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (activeAttemptId) {
    return (
      <div className="container mx-auto py-8">
        <QuizTaking
          lessonId={contest.id} // Re-using lessonId prop to pass contestId since endpoints are identical structurally
          attemptId={activeAttemptId}
          quizTitle={contest.title}
          onSuccess={() => {
            refetch();
          }}
          onExit={() => {
            router.push(`/contests/${contest.slug}`);
          }}
        />
      </div>
    );
  }

  if (completedAttemptId) {
    if (!attemptResultData) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
          <p className="text-sm text-slate-500">Loading your results...</p>
        </div>
      );
    }

    const scorePercent =
      attemptResultData.maxScore && attemptResultData.maxScore > 0
        ? (attemptResultData.score / attemptResultData.maxScore) * 100
        : 0;

    const timeSpent =
      attemptResultData.startedAt && attemptResultData.submittedAt
        ? Math.floor(
            (new Date(attemptResultData.submittedAt).getTime() -
              new Date(attemptResultData.startedAt).getTime()) /
              1000,
          )
        : 0;

    return (
      <div className="container mx-auto py-8">
        <QuizResult
          score={scorePercent}
          totalQuestions={attemptResultData.totalCount}
          correctAnswers={attemptResultData.correctCount}
          timeSpent={timeSpent}
          passingScore={contest.passScore || 0}
          isPassed={attemptResultData.passed}
          isResultMasked={attemptResultData.isResultMasked}
          showResultDate={contest.showResultDate}
          onRetry={
            contest.maxAttempts && (attemptsData as any)?.attempts?.length >= contest.maxAttempts
              ? undefined
              : () => {
                  router.push(`/contests/${contest.slug}`);
                }
          }
          onBackToOverview={() => {
            router.push(`/contests/${contest.slug}`);
          }}
        />
      </div>
    );
  }

  // If no attempts found, they shouldn't be here without clicking start.
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <h2 className="mb-4 text-xl font-bold">No active attempt found</h2>
      <button
        className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        onClick={() => router.push(`/contests/${contest.slug}`)}
      >
        Go back to contest details
      </button>
    </div>
  );
};

export default ContestTakeClient;
