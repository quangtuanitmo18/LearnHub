'use client';

import { usePublicContests } from '@/hooks/use-contests';
import { Contest } from '@/types/contest';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, Trophy, Users, MoveRight, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface ContestsContentProps {
  initialContests: Contest[];
}

const ContestsContent = ({ initialContests }: ContestsContentProps) => {
  const { data: contests = initialContests, isLoading } = usePublicContests();

  const activeContests = contests.filter((c) => !c.endTime || new Date(c.endTime) > new Date());
  const pastContests = contests.filter((c) => c.endTime && new Date(c.endTime) <= new Date());

  const renderContestCard = (contest: Contest) => (
    <Card
      key={contest.id}
      className="flex h-full flex-col overflow-hidden transition-all hover:shadow-lg"
    >
      <div className="relative aspect-video w-full bg-slate-100 dark:bg-slate-800">
        {contest.imageId ? (
          <img src={contest.imageId} alt={contest.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-slate-400">
            <Trophy className="mb-2 h-12 w-12 opacity-20" />
            <span className="text-sm font-medium">Contest Banner</span>
          </div>
        )}
        <div className="absolute top-3 right-3 flex gap-2">
          {contest.isMembership && (
            <Badge className="bg-amber-500 font-semibold text-white hover:bg-amber-600">PRO</Badge>
          )}
          {contest.startTime && new Date(contest.startTime) > new Date() ? (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Upcoming
            </Badge>
          ) : contest.endTime && new Date(contest.endTime) < new Date() ? (
            <Badge variant="secondary" className="bg-slate-100 text-slate-600">
              Ended
            </Badge>
          ) : (
            <Badge variant="destructive" className="animate-pulse bg-red-500">
              Live
            </Badge>
          )}
        </div>
      </div>

      <CardHeader className="p-5 pb-3">
        <CardTitle className="line-clamp-1 text-xl font-bold">{contest.title}</CardTitle>
        <CardDescription className="mt-1 line-clamp-2 min-h-10">
          {contest.description || 'No description provided for this contest.'}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 p-5 pt-0">
        <div className="text-muted-foreground mt-4 grid grid-cols-2 gap-x-2 gap-y-3 text-sm">
          <div className="flex items-center gap-1.5">
            <HelpCircle className="h-4 w-4 text-emerald-500" />
            <span>{contest._count?.questions || 0} Questions</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-blue-500" />
            <span>
              {contest.durationSec
                ? `${Math.round(contest.durationSec / 60)} minutes`
                : 'Unlimited'}
            </span>
          </div>
          {(contest.startTime || contest.endTime) && (
            <div className="col-span-2 mt-1 flex items-center gap-1.5 border-t pt-2">
              <Calendar className="h-4 w-4 text-orange-500" />
              <span className="text-xs font-medium">
                {contest.startTime ? format(new Date(contest.startTime), 'MMM d, h:mm a') : 'Now'}
                {' - '}
                {contest.endTime
                  ? format(new Date(contest.endTime), 'MMM d, h:mm a')
                  : 'Indefinite'}
              </span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0">
        <Button asChild className="w-full gap-2 transition-transform group-hover:translate-x-1">
          <Link href={`/contests/${contest.slug}`}>
            View Details <MoveRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:py-16">
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-96 w-full animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800"
            />
          ))}
        </div>
      ) : contests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <Trophy className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            No Contests Available
          </h3>
          <p className="mt-2 max-w-md text-slate-500 dark:text-slate-400">
            There are currently no active or upcoming contests. Check back later for new challenges!
          </p>
        </div>
      ) : (
        <div className="space-y-16">
          {activeContests.length > 0 && (
            <section>
              <h2 className="mb-8 flex items-center gap-2 text-2xl font-bold tracking-tight">
                <div className="h-8 w-2 rounded-full bg-indigo-600" />
                Active & Upcoming Contests
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {activeContests.map(renderContestCard)}
              </div>
            </section>
          )}

          {pastContests.length > 0 && (
            <section>
              <h2 className="mb-8 flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-400">
                <div className="h-8 w-2 rounded-full bg-slate-300 dark:bg-slate-700" />
                Past Contests
              </h2>
              <div className="grid grid-cols-1 gap-6 opacity-80 transition-opacity hover:opacity-100 sm:grid-cols-2 lg:grid-cols-3">
                {pastContests.map(renderContestCard)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default ContestsContent;
