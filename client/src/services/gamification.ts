import { ApiService } from '@/lib/api-service';

const ENDPOINTS = {
  MY_PROFILE: '/gamification/me',
  LEADERBOARD: '/gamification/leaderboard',
} as const;

export interface GamificationBadge {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  conditionType: 'POINTS_REACHED' | 'STREAK_REACHED' | 'LESSONS_COMPLETED';
  conditionValue: number;
  earnedAt: string;
}

export interface LevelInfo {
  level: number;
  currentLevelPoints: number;
  nextLevelPoints: number;
  progress: number;
}

export interface GamificationProfile {
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  rank: number | null;
  level: LevelInfo;
  badges: GamificationBadge[];
}

export interface LeaderboardEntry {
  userId: string;
  points: number;
  rank: number;
  username: string;
  avatar: string | null;
}

export class GamificationService {
  static async getMyProfile(): Promise<GamificationProfile> {
    return ApiService.get<GamificationProfile>(ENDPOINTS.MY_PROFILE);
  }

  static async getLeaderboard(limit: number = 100): Promise<LeaderboardEntry[]> {
    return ApiService.get<LeaderboardEntry[]>(`${ENDPOINTS.LEADERBOARD}?limit=${limit}`);
  }
}

export default GamificationService;
