'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useMyContestHistory } from '@/hooks/use-contests';
import { format } from 'date-fns';
import { Clock, Loader2, MoveRight, PlayCircle, Trophy } from 'lucide-react';
import Link from 'next/link';

const MyContestsTab = () => {
  const { data: myContests, isLoading } = useMyContestHistory();

  if (isLoading) {
    return (
      <Card className="border-0 bg-white shadow-xl dark:bg-slate-900">
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
          <p className="text-slate-500">Loading your contest history...</p>
        </div>
      </Card>
    );
  }

  if (!myContests || myContests.length === 0) {
    return (
      <Card className="border-0 bg-white shadow-xl dark:bg-slate-900">
        <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <Trophy className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">No Contests Yet</h3>
          <p className="mb-6 max-w-md text-slate-500 dark:text-slate-400">
            You haven&apos;t participated in any contests yet. Join one to test your knowledge and
            see how you rank against others!
          </p>
          <Button asChild className="bg-indigo-600 text-white hover:bg-indigo-700">
            <Link href="/contests">Browse Contests</Link>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-white shadow-xl dark:bg-slate-900">
      <div className="border-b border-slate-100 px-6 py-5 dark:border-slate-800">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">My Contests</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Track your contest participation and highest scores
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/contests">Find More</Link>
          </Button>
        </div>
      </div>

      <CardContent className="p-0">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {myContests.map((historyItem) => (
            <div
              key={historyItem.contest.id}
              className="p-6 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                    {historyItem.contest.endTime &&
                    new Date(historyItem.contest.endTime) < new Date() ? (
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                        Ended
                      </Badge>
                    ) : (
                      <Badge
                        variant="destructive"
                        className="bg-red-100 text-red-700 hover:bg-red-100"
                      >
                        Live
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {historyItem.contest.title}
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <PlayCircle className="h-4 w-4" />
                      <span>{historyItem.totalAttempts} attempt(s)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      <span>
                        Last: {format(new Date(historyItem.lastAttemptAt), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-col items-start gap-4 sm:mt-0 sm:items-end">
                  <div className="text-left sm:text-right">
                    <div className="text-sm font-medium text-slate-500">Highest Score</div>
                    <div className="flex items-end gap-1 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      {historyItem.bestScore ?? 0}%
                      {historyItem.contest.passScore && historyItem.bestScore !== undefined ? (
                        <Badge
                          variant="outline"
                          className={
                            historyItem.bestScore >= historyItem.contest.passScore
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-amber-50 text-amber-600'
                          }
                        >
                          {historyItem.bestScore >= historyItem.contest.passScore
                            ? 'Passed'
                            : 'Failed'}
                        </Badge>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex w-full gap-2 sm:w-auto">
                    <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                      <Link href={`/contests/${historyItem.contest.slug}`}>Details</Link>
                    </Button>
                    <Button asChild size="sm" className="w-full gap-1 sm:w-auto">
                      <Link href={`/contests/${historyItem.contest.slug}/take`}>
                        {historyItem.contest.endTime &&
                        new Date(historyItem.contest.endTime) < new Date()
                          ? 'Review'
                          : 'Resume / Retry'}
                        <MoveRight className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MyContestsTab;
