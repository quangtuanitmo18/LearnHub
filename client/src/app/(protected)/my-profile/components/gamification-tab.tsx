'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  MdLocalFireDepartment,
  MdEmojiEvents,
  MdStar,
  MdTrendingUp,
  MdMilitaryTech,
  MdWorkspacePremium,
} from 'react-icons/md';
import GamificationService, { type GamificationProfile } from '@/services/gamification';

// Streak Fire display
const StreakFire = ({
  currentStreak,
  longestStreak,
}: {
  currentStreak: number;
  longestStreak: number;
}) => {
  const isActive = currentStreak > 0;

  return (
    <Card className="group relative overflow-hidden border-0 bg-linear-to-br from-white via-orange-50/30 to-red-50/30 shadow-lg transition-all duration-500 hover:-translate-y-1 hover:shadow-xl dark:from-gray-900 dark:via-orange-950/20 dark:to-red-950/20">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 right-0 h-24 w-24 animate-pulse rounded-full bg-linear-to-br from-orange-400/20 to-red-400/20 blur-xl sm:h-32 sm:w-32" />
        <div className="absolute bottom-0 left-0 h-20 w-20 animate-pulse rounded-full bg-linear-to-br from-yellow-400/20 to-orange-400/20 blur-xl delay-1000 sm:h-24 sm:w-24" />
      </div>

      <CardContent className="relative z-10 p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-100 to-red-100 shadow-sm dark:from-orange-900/40 dark:to-red-900/40">
                <MdLocalFireDepartment className="h-5 w-5 text-orange-500" />
              </div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Daily Streak</p>
            </div>
            
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="bg-gradient-to-br from-orange-600 to-red-600 bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-5xl drop-shadow-sm">
                {currentStreak}
              </span>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">days</span>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Best streak: <span className="font-semibold text-gray-700 dark:text-gray-300">{longestStreak}</span> days
            </p>
          </div>
          <div className="relative">
            <MdLocalFireDepartment
              className={`h-16 w-16 transition-all duration-500 sm:h-20 sm:w-20 ${
                isActive
                  ? 'animate-pulse text-orange-400 drop-shadow-[0_0_15px_rgba(251,146,60,0.6)]'
                  : 'text-gray-300 dark:text-gray-700'
              }`}
            />
            {isActive && currentStreak >= 7 && (
              <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-xs font-bold text-white shadow-md">
                🔥
              </div>
            )}
          </div>
        </div>
      </CardContent>
      {/* Subtle border glow */}
      <div className="pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-r from-orange-500/10 via-red-500/10 to-yellow-500/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    </Card>
  );
};

// Level Progress Bar
const LevelProgressBar = ({
  level,
  progress,
  totalPoints,
  currentLevelPoints,
  nextLevelPoints,
}: {
  level: number;
  progress: number;
  totalPoints: number;
  currentLevelPoints: number;
  nextLevelPoints: number;
}) => {
  const levelColors = [
    'from-emerald-500 to-teal-500',
    'from-blue-500 to-indigo-500',
    'from-indigo-500 to-violet-500',
    'from-amber-500 to-orange-500',
    'from-rose-500 to-pink-500',
  ];
  const colorIndex = (level - 1) % levelColors.length;

  return (
    <Card className="group relative overflow-hidden border-0 bg-linear-to-br from-white via-gray-50/50 to-slate-50/50 shadow-lg transition-all duration-500 hover:shadow-xl dark:from-gray-900 dark:via-gray-800/10 dark:to-slate-800/10">
      <CardContent className="relative z-10 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${levelColors[colorIndex]} shadow-md ring-4 ring-white/50 dark:ring-gray-800/50`}
            >
              <span className="text-2xl font-black text-white drop-shadow-md">{level}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-gray-900 sm:text-xl dark:text-white">Level {level}</h3>
                <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-[10px] text-emerald-600 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-400">
                  {Math.round(progress * 100)}%
                </Badge>
              </div>
              <p className="mt-0.5 text-xs text-gray-500 sm:text-sm dark:text-gray-400">
                <span className="font-semibold text-gray-700 dark:text-gray-300">{totalPoints.toLocaleString()}</span> XP total
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:flex-col sm:items-end sm:gap-1">
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-1 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
              <MdTrendingUp className="h-4 w-4" />
              <span className="text-xs font-semibold">Keep going!</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <span className="font-semibold text-gray-700 dark:text-gray-300">{(nextLevelPoints - totalPoints).toLocaleString()}</span> XP to Lvl {level + 1}
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <div className="flex justify-between text-[10px] font-medium text-gray-400 sm:text-xs">
            <span>{currentLevelPoints.toLocaleString()} XP</span>
            <span>{nextLevelPoints.toLocaleString()} XP</span>
          </div>
          <div className="group/progress relative h-3 overflow-hidden rounded-full bg-gray-100 shadow-inner sm:h-4 dark:bg-gray-800">
            <div
              className={`relative h-full rounded-full bg-gradient-to-r ${levelColors[colorIndex]} transition-all duration-1000 ease-out`}
              style={{ width: `${Math.max(progress * 100, 2)}%` }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            </div>
          </div>
        </div>
      </CardContent>
      {/* Subtle border glow */}
      <div className="pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-r from-gray-200/20 via-slate-200/20 to-gray-200/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:from-gray-700/20 dark:via-slate-700/20 dark:to-gray-700/20" />
    </Card>
  );
};

// Badge Showcase
const BadgeShowcase = ({ badges }: { badges: GamificationProfile['badges'] }) => {
  if (badges.length === 0) {
    return (
      <Card className="border-0 bg-linear-to-br from-white via-gray-50/50 to-slate-50/50 shadow-lg dark:from-gray-900 dark:via-gray-800/10 dark:to-slate-800/10">
        <CardContent className="flex flex-col items-center justify-center p-8 text-center sm:p-12">
          <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
            <MdWorkspacePremium className="h-10 w-10 text-gray-400 dark:text-gray-500 sm:h-12 sm:w-12" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 sm:text-xl dark:text-white">
            No Badges Yet
          </h3>
          <p className="mt-2 max-w-sm text-sm text-gray-500 dark:text-gray-400">
            Keep learning, maintain your streak, and complete challenges to earn your first badge!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-linear-to-br from-white via-amber-50/10 to-yellow-50/10 shadow-lg dark:from-gray-900 dark:via-amber-900/5 dark:to-yellow-900/5">
      <CardContent className="p-5 sm:p-6">
        <div className="mb-5 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 justify-center items-center rounded-xl bg-gradient-to-br from-amber-100 to-yellow-200 shadow-sm dark:from-amber-900/40 dark:to-yellow-900/40">
               <MdMilitaryTech className="h-6 w-6 text-amber-600 sm:h-7 sm:w-7 dark:text-amber-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 sm:text-xl dark:text-white">Badge Collection</h3>
          </div>
          <Badge className="border border-amber-200 bg-amber-50 px-3 py-1 font-semibold text-amber-600 dark:border-amber-800/50 dark:bg-amber-900/20 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40">
            {badges.length} badges earned
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className="group relative flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-4 text-center shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl dark:border-gray-800 dark:bg-gray-800/80"
            >
              {/* Highlight background on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-50/50 to-yellow-50/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-amber-900/10 dark:to-yellow-900/10" />
              
              <div className="relative mb-3 z-10 pt-2">
                <img
                  src={badge.imageUrl}
                  alt={badge.name}
                  className="h-16 w-16 rounded-full object-cover shadow-md ring-4 ring-amber-100 transition-transform duration-500 ease-out group-hover:scale-110 sm:h-20 sm:w-20 dark:ring-gray-700"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://api.dicebear.com/7.x/shapes/svg?seed=' + badge.name;
                  }}
                />
                <div className="absolute -right-2 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-md ring-2 ring-white dark:ring-gray-800">
                  <MdStar className="h-3.5 w-3.5 text-white" />
                </div>
              </div>
              <h4 className="z-10 text-sm font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:block transition-all">{badge.name}</h4>
              <p className="z-10 mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                {badge.description}
              </p>
              <div className="mt-auto pt-3 z-10 w-full">
                <div className="flex w-full justify-center rounded-lg bg-gray-50 py-1.5 dark:bg-gray-700/50">
                  <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                    Earned on {new Date(badge.earnedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Rank Card
const RankCard = ({ rank, totalPoints }: { rank: number | null; totalPoints: number }) => {
  const getRankLabel = (rank: number | null) => {
    if (!rank) return 'Unranked';
    if (rank <= 3) return 'Top 3 🏆';
    if (rank <= 10) return 'Top 10';
    if (rank <= 50) return 'Top 50';
    return `#${rank}`;
  };

  return (
    <Card className="group relative overflow-hidden border-0 bg-linear-to-br from-white via-indigo-50/30 to-blue-50/30 shadow-lg transition-all duration-500 hover:-translate-y-1 hover:shadow-xl dark:from-gray-900 dark:via-indigo-950/20 dark:to-blue-950/20">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 right-0 h-24 w-24 animate-pulse rounded-full bg-linear-to-br from-indigo-400/20 to-blue-400/20 blur-xl sm:h-32 sm:w-32" />
        <div className="absolute bottom-0 left-0 h-20 w-20 animate-pulse rounded-full bg-linear-to-br from-cyan-400/20 to-indigo-400/20 blur-xl delay-1000 sm:h-24 sm:w-24" />
      </div>

      <CardContent className="relative z-10 p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-100 to-blue-100 shadow-sm dark:from-indigo-900/40 dark:to-blue-900/40">
                <MdEmojiEvents className="h-5 w-5 text-indigo-500" />
              </div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Global Ranking</p>
            </div>
            
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="bg-gradient-to-br from-indigo-600 to-blue-600 bg-clip-text text-3xl font-black tracking-tight text-transparent sm:text-4xl drop-shadow-sm">
                {getRankLabel(rank)}
              </span>
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Total Points: <span className="font-semibold text-gray-700 dark:text-gray-300">{totalPoints.toLocaleString()}</span> XP
            </p>
          </div>
          <div className="relative">
            <MdEmojiEvents
              className={`h-16 w-16 transition-all duration-500 sm:h-20 sm:w-20 ${
                rank && rank <= 3
                  ? 'animate-bounce text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]'
                  : 'text-indigo-400 drop-shadow-sm'
              }`}
            />
          </div>
        </div>
      </CardContent>
      {/* Subtle border glow */}
      <div className="pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-500/10 via-blue-500/10 to-cyan-500/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    </Card>
  );
};

// Main GamificationTab
const GamificationTab = () => {
  const [profile, setProfile] = useState<GamificationProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const data = await GamificationService.getMyProfile();
      setProfile(data);
    } catch {
      console.error('Failed to fetch gamification profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>
    );
  }

  if (!profile) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">Unable to load gamification data.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
          🎮 Achievements
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Track your learning progress, streaks, and earned badges.
        </p>
      </div>

      <Separator />

      {/* Top Stats: Streak + Rank */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StreakFire currentStreak={profile.currentStreak} longestStreak={profile.longestStreak} />
        <RankCard rank={profile.rank} totalPoints={profile.totalPoints} />
      </div>

      {/* Level Progress */}
      <LevelProgressBar
        level={profile.level.level}
        progress={profile.level.progress}
        totalPoints={profile.totalPoints}
        currentLevelPoints={profile.level.currentLevelPoints}
        nextLevelPoints={profile.level.nextLevelPoints}
      />

      {/* Badge Collection */}
      <BadgeShowcase badges={profile.badges} />
    </div>
  );
};

export default GamificationTab;
