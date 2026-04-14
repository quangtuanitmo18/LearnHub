'use client';

import QuizHistoryTable from '@/app/(protected)/learning/[slug]/components/quiz/quiz-history-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useContestAttempts, useStartContestAttempt } from '@/hooks/use-contests';
import { useIsAuthenticated } from '@/stores/auth-store';
import { Contest } from '@/types/contest';
import { format } from 'date-fns';
import {
  AlertCircle,
  Award,
  CheckCircle2,
  Clock,
  HelpCircle,
  Loader2,
  MoveRight,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

interface ContestDetailClientProps {
  initialContest: Contest;
  slug: string;
}

const ContestDetailClient = ({ initialContest }: ContestDetailClientProps) => {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const { mutate: startAttempt, isPending } = useStartContestAttempt();
  const [starting, setStarting] = useState(false);

  const {
    data: attemptsData,
    isLoading: attemptsLoading,
    refetch,
  } = useContestAttempts(initialContest.id, isAuthenticated);

  const isLive =
    (!initialContest.startTime || new Date(initialContest.startTime) <= new Date()) &&
    (!initialContest.endTime || new Date(initialContest.endTime) > new Date());

  const isEnded = initialContest.endTime && new Date(initialContest.endTime) <= new Date();

  const isUpcoming = initialContest.startTime && new Date(initialContest.startTime) > new Date();

  const handleStartContest = () => {
    if (!isAuthenticated) {
      toast.info('Please log in or register to join this contest.');
      router.push(`/auth/login?callbackUrl=/contests/${initialContest.slug}`);
      return;
    }

    if (isEnded) {
      toast.error('This contest has already ended.');
      return;
    }

    if (isUpcoming) {
      toast.error('This contest has not started yet.');
      return;
    }

    setStarting(true);
    startAttempt(initialContest.id, {
      onSuccess: (data) => {
        // Assume data returns the attemptId or we just navigate to the take page
        toast.success('Contest started! Good luck!');
        router.push(`/contests/${initialContest.slug}/take`);
      },
      onError: (err: any) => {
        setStarting(false);
      },
    });
  };

  return (
    <>
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-linear-to-br from-indigo-900 via-violet-800 to-purple-900 pt-8 pb-16">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/30 to-purple-600/30" />
        <div className="absolute top-10 left-10 h-64 w-64 animate-pulse rounded-full bg-white/5 blur-3xl" />
        <div className="absolute right-10 bottom-10 h-96 w-96 animate-pulse rounded-full bg-violet-400/10 blur-3xl delay-1000" />

        <div className="relative container mx-auto mt-12 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-10 lg:flex-row">
            <div className="flex-1 text-center lg:text-left">
              <div className="mb-4 inline-flex items-center gap-2">
                {isLive ? (
                  <Badge
                    variant="destructive"
                    className="animate-pulse bg-red-500 px-3 py-1 text-sm"
                  >
                    LIVE NOW
                  </Badge>
                ) : isEnded ? (
                  <Badge
                    variant="secondary"
                    className="bg-slate-200 px-3 py-1 text-sm text-slate-800"
                  >
                    ENDED
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 px-3 py-1 text-sm text-blue-800"
                  >
                    UPCOMING
                  </Badge>
                )}
                {initialContest.isMembership && (
                  <Badge className="bg-amber-500 px-3 py-1 font-semibold text-white">
                    PRO Exclusive
                  </Badge>
                )}
              </div>

              <h1 className="mb-6 text-4xl leading-tight font-extrabold text-white md:text-5xl lg:text-6xl">
                {initialContest.title}
              </h1>

              <p className="mx-auto mb-8 max-w-2xl text-xl text-indigo-100 lg:mx-0">
                Are you ready for the challenge? Compete with thousands of others, test your
                knowledge, and earn your place on the leaderboard.
              </p>

              <div className="flex flex-wrap justify-center gap-4 lg:justify-start">
                {isEnded ? (
                  <Button
                    size="lg"
                    variant="secondary"
                    className="h-12 px-8 text-base font-semibold"
                    asChild
                  >
                    <a href={`/contests/${initialContest.slug}/take`}>View Results</a>
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    className={`h-12 gap-2 border-0 px-8 text-base font-semibold text-white ${isUpcoming ? 'cursor-not-allowed bg-slate-400' : 'bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700'}`}
                    onClick={handleStartContest}
                    disabled={isPending || starting || !!isUpcoming}
                  >
                    {isPending || starting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" /> Preparing...
                      </>
                    ) : isUpcoming ? (
                      <>
                        Upcoming Contests <MoveRight className="h-5 w-5" />
                      </>
                    ) : (
                      <>
                        Start Contest <MoveRight className="h-5 w-5" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            <div className="w-full max-w-md lg:w-1/3">
              <Card className="overflow-hidden border-0 bg-white/10 text-white shadow-2xl backdrop-blur-md">
                <CardContent className="p-6">
                  {initialContest.imageId ? (
                    <img
                      src={initialContest.imageId}
                      className="mb-6 aspect-video w-full rounded-lg object-cover"
                      alt="Contest Thumbnail"
                    />
                  ) : null}

                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-white/20 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-white/10 p-2">
                          <HelpCircle className="h-5 w-5 text-amber-300" />
                        </div>
                        <span className="font-medium text-slate-100">Questions</span>
                      </div>
                      <span className="text-xl font-bold">
                        {initialContest._count?.questions || 0}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-b border-white/20 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-white/10 p-2">
                          <Clock className="h-5 w-5 text-blue-300" />
                        </div>
                        <span className="font-medium text-slate-100">Time Limit</span>
                      </div>
                      <span className="text-xl font-bold">
                        {initialContest.durationSec
                          ? `${Math.round(initialContest.durationSec / 60)} mins`
                          : 'Unlimited'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-b border-white/20 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-white/10 p-2">
                          <AlertCircle className="h-5 w-5 text-pink-300" />
                        </div>
                        <span className="font-medium text-slate-100">Max Attempts</span>
                      </div>
                      <span className="text-xl font-bold">
                        {initialContest.maxAttempts ? initialContest.maxAttempts : 'Unlimited'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-white/10 p-2">
                          <Award className="h-5 w-5 text-emerald-300" />
                        </div>
                        <span className="font-medium text-slate-100">Passing Score</span>
                      </div>
                      <span className="text-xl font-bold">
                        {initialContest.passScore ? `${initialContest.passScore}%` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Modern wave design */}
        <div className="absolute right-0 bottom-0 left-0">
          <svg viewBox="0 0 1440 120" className="h-auto w-full">
            <path
              fill="#ffffff"
              d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,85.3C1248,85,1344,75,1392,69.3L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
            />
          </svg>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-12">
          <section>
            <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold">
              <div className="h-6 w-1.5 rounded-full bg-indigo-600" />
              Contest Description
            </h2>
            <div className="prose prose-slate prose-lg max-w-none text-slate-600">
              {initialContest.description ? (
                <div dangerouslySetInnerHTML={{ __html: initialContest.description }} />
              ) : (
                <p>
                  No extra details provided for this contest. Prepare yourself and hit start when
                  you are ready!
                </p>
              )}
            </div>
          </section>

          <section>
            <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold">
              <div className="h-6 w-1.5 rounded-full bg-indigo-600" />
              Rules & Guidelines
            </h2>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-6 sm:p-8">
              <ul className="space-y-4 text-slate-700">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-500" />
                  <span>
                    <strong>Time Limit:</strong> Once you start, the timer cannot be paused. Make
                    sure you have a stable internet connection and{' '}
                    {initialContest.durationSec
                      ? Math.round(initialContest.durationSec / 60) + ' minutes'
                      : 'plenty of time'}{' '}
                    to spare.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-500" />
                  <span>
                    <strong>Submission:</strong> The contest will automatically submit when the
                    timer runs out. You can also submit manually early.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-500" />
                  <span>
                    <strong>Availability window:</strong> You must start and complete the contest
                    between{' '}
                    {initialContest.startTime ? (
                      <strong className="text-indigo-600">
                        {format(new Date(initialContest.startTime), 'MMM d, yyyy h:mm a')}
                      </strong>
                    ) : (
                      'now'
                    )}
                    {' and '}
                    {initialContest.endTime ? (
                      <strong className="text-indigo-600">
                        {format(new Date(initialContest.endTime), 'MMM d, yyyy h:mm a')}
                      </strong>
                    ) : (
                      'an indefinite time in the future'
                    )}
                    .
                  </span>
                </li>
              </ul>
            </div>
          </section>

          {isAuthenticated && (
            <section>
              <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold">
                <div className="h-6 w-1.5 rounded-full bg-indigo-600" />
                My Attempts History
              </h2>
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <QuizHistoryTable
                  attempts={(attemptsData as any)?.attempts || []}
                  isLoading={attemptsLoading}
                  passingScore={initialContest.passScore || 0}
                  onRefresh={refetch}
                />
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
};

export default ContestDetailClient;
