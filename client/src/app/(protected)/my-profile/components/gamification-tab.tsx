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
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg">
      <CardContent className="relative z-10 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-orange-100">Daily Streak</p>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-4xl font-black tracking-tight">{currentStreak}</span>
              <span className="text-lg text-orange-200">days</span>
            </div>
            <p className="mt-1 text-xs text-orange-200">Best: {longestStreak} days</p>
          </div>
          <div className="relative">
            <MdLocalFireDepartment
              className={`h-16 w-16 transition-all duration-500 ${
                isActive
                  ? 'animate-pulse text-yellow-300 drop-shadow-[0_0_15px_rgba(253,224,71,0.6)]'
                  : 'text-orange-300/50'
              }`}
            />
            {isActive && currentStreak >= 7 && (
              <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-orange-900 shadow-md">
                🔥
              </div>
            )}
          </div>
        </div>
      </CardContent>
      {/* Decorative circles */}
      <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-white/5" />
      <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-white/5" />
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
    <Card className="border-0 bg-gradient-to-br from-gray-50 to-white shadow-lg dark:from-gray-900 dark:to-gray-800">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${levelColors[colorIndex]} shadow-lg`}
            >
              <span className="text-xl font-black text-white">{level}</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Level {level}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {totalPoints.toLocaleString()} XP total
              </p>
            </div>
          </div>
          <div className="text-right">
            <MdTrendingUp className="ml-auto h-5 w-5 text-emerald-500" />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {(nextLevelPoints - totalPoints).toLocaleString()} XP to Level {level + 1}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-1.5 flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{currentLevelPoints.toLocaleString()} XP</span>
            <span>{Math.round(progress * 100)}%</span>
            <span>{nextLevelPoints.toLocaleString()} XP</span>
          </div>
          <div className="relative h-3 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${levelColors[colorIndex]} transition-all duration-1000 ease-out`}
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Badge Showcase
const BadgeShowcase = ({ badges }: { badges: GamificationProfile['badges'] }) => {
  if (badges.length === 0) {
    return (
      <Card className="border-0 bg-gradient-to-br from-gray-50 to-white shadow-lg dark:from-gray-900 dark:to-gray-800">
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <MdWorkspacePremium className="h-16 w-16 text-gray-300 dark:text-gray-600" />
          <h3 className="mt-3 text-lg font-semibold text-gray-900 dark:text-white">
            No Badges Yet
          </h3>
          <p className="mt-1 max-w-xs text-sm text-gray-500 dark:text-gray-400">
            Keep learning and completing courses to earn your first badge!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-gradient-to-br from-gray-50 to-white shadow-lg dark:from-gray-900 dark:to-gray-800">
      <CardContent className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <MdMilitaryTech className="h-5 w-5 text-amber-500" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Badge Collection</h3>
          <Badge variant="secondary" className="ml-auto text-xs">
            {badges.length} earned
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className="group relative flex flex-col items-center rounded-xl border border-gray-100 bg-white p-3 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="relative mb-2">
                <img
                  src={badge.imageUrl}
                  alt={badge.name}
                  className="h-14 w-14 rounded-full object-cover shadow-md ring-2 ring-amber-400/50 transition-transform duration-200 group-hover:scale-110"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://api.dicebear.com/7.x/shapes/svg?seed=' + badge.name;
                  }}
                />
                <div className="absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 shadow-sm">
                  <MdStar className="h-3 w-3 text-white" />
                </div>
              </div>
              <h4 className="text-xs font-semibold text-gray-900 dark:text-white">{badge.name}</h4>
              <p className="mt-0.5 line-clamp-2 text-[10px] text-gray-500 dark:text-gray-400">
                {badge.description}
              </p>
              <p className="mt-1 text-[10px] text-gray-400">
                {new Date(badge.earnedAt).toLocaleDateString('vi-VN')}
              </p>
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
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-lg">
      <CardContent className="relative z-10 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-100">Ranking</p>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-3xl font-black tracking-tight">{getRankLabel(rank)}</span>
            </div>
            <p className="mt-1 text-xs text-indigo-200">{totalPoints.toLocaleString()} total XP</p>
          </div>
          <MdEmojiEvents
            className={`h-14 w-14 ${
              rank && rank <= 3 ? 'animate-bounce text-yellow-300' : 'text-indigo-300'
            }`}
          />
        </div>
      </CardContent>
      <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-white/5" />
      <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-white/5" />
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
