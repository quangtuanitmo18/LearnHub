import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { BadgeCondition, PointReason } from 'src/generated/prisma/client';
import { PrismaService } from 'src/shared/services/prisma.service';
import { NotificationType } from '../notification/dto/notification.dto';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class GamificationService {
  private readonly logger = new Logger(GamificationService.name);
  private redisClient: any;

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly notificationService: NotificationService,
  ) {
    // Cast to access the underlying ioredis client within CacheManager
    this.redisClient = (this.cacheManager as any).store.client;
  }

  /**
   * Calculate user level from total points.
   * Formula: Level = floor(sqrt(totalPoints / 50)) + 1
   * Level thresholds: L1=0, L2=50, L3=200, L4=450, L5=800...
   */
  private calculateLevel(totalPoints: number): {
    level: number;
    currentLevelPoints: number;
    nextLevelPoints: number;
    progress: number;
  } {
    const level = Math.floor(Math.sqrt(totalPoints / 50)) + 1;
    const currentLevelPoints = Math.pow(level - 1, 2) * 50;
    const nextLevelPoints = Math.pow(level, 2) * 50;
    const pointsInLevel = totalPoints - currentLevelPoints;
    const pointsNeeded = nextLevelPoints - currentLevelPoints;
    const progress =
      pointsNeeded > 0 ? Math.min(pointsInLevel / pointsNeeded, 1) : 1;

    return { level, currentLevelPoints, nextLevelPoints, progress };
  }

  async handleAddPoints(
    userId: string,
    points: number,
    reason: PointReason,
    metadata?: any,
  ) {
    // 1. Database Transaction for safe atomicity
    const updatedPoints = await this.prisma.$transaction(async (tx) => {
      const now = new Date();
      const existingStat = await tx.userGamification.findUnique({
        where: { userId },
      });

      let currentStreak = 1;
      let longestStreak = 1;

      if (existingStat) {
        currentStreak = existingStat.currentStreak;
        longestStreak = existingStat.longestStreak;

        if (existingStat.lastActiveDate) {
          const diffInMs =
            now.getTime() - existingStat.lastActiveDate.getTime();
          const diffInHours = diffInMs / (1000 * 60 * 60);

          if (diffInHours >= 24 && diffInHours < 48) {
            currentStreak += 1;
            if (currentStreak > longestStreak) {
              longestStreak = currentStreak;
            }
          } else if (diffInHours >= 48) {
            currentStreak = 1;
          }
        }
      }

      // Upsert: Update points and streaks or create initial record if it doesn't exist
      const stat = await tx.userGamification.upsert({
        where: { userId },
        update: {
          totalPoints: { increment: points },
          currentStreak,
          longestStreak,
          lastActiveDate: now,
        },
        create: {
          userId,
          totalPoints: points,
          currentStreak,
          longestStreak,
          lastActiveDate: now,
        },
      });

      // Log the point allocation history
      await tx.pointHistory.create({
        data: {
          userId,
          points,
          reason,
          metadata: metadata || {},
        },
      });

      // Evaluate Badges
      const allBadges = await tx.badge.findMany();
      if (allBadges.length > 0) {
        const existingUserBadges = await tx.userBadge.findMany({
          where: { userId },
          select: { badgeId: true },
        });
        const existingBadgeIds = new Set(
          existingUserBadges.map((ub) => ub.badgeId),
        );

        const newBadgesToAward = allBadges.filter((badge) => {
          if (existingBadgeIds.has(badge.id)) return false;

          switch (badge.conditionType) {
            case 'POINTS_REACHED':
              return stat.totalPoints >= badge.conditionValue;
            case 'STREAK_REACHED':
              return stat.currentStreak >= badge.conditionValue;
            default:
              return false;
          }
        });

        if (newBadgesToAward.length > 0) {
          await tx.userBadge.createMany({
            data: newBadgesToAward.map((badge) => ({
              userId,
              badgeId: badge.id,
            })),
          });

          // Push real-time notification for each badge earned
          for (const badge of newBadgesToAward) {
            void this.notificationService.notifyUser(userId, {
              type: NotificationType.SYSTEM,
              title: 'Huy Hiệu Mới! 🎖️',
              message: `Chúc mừng bạn đã nhận được huy hiệu "${badge.name}"!`,
              data: {
                badgeId: badge.id,
                badgeName: badge.name,
                badgeImage: badge.imageUrl,
              },
            });
          }

          this.logger.debug(
            `Awarded ${newBadgesToAward.length} new badges to user ${userId}`,
          );
        }
      }

      return stat.totalPoints;
    });

    this.logger.debug(
      `(+) ${points} points awarded to user ${userId} for ${reason}. Total: ${updatedPoints}`,
    );

    // 2. Update Redis ZSet for near-instant Leaderboard retrieval
    if (this.redisClient) {
      await this.redisClient.zadd(
        'leaderboard_all_time',
        updatedPoints,
        userId,
      );
    }
  }

  async getUserProfile(userId: string) {
    const stat = await this.prisma.userGamification.findUnique({
      where: { userId },
      include: {
        user: {
          include: {
            badges: {
              include: {
                badge: true,
              },
              orderBy: { earnedAt: 'desc' },
            },
          },
        },
      },
    });

    if (!stat) {
      return {
        totalPoints: 0,
        currentStreak: 0,
        longestStreak: 0,
        rank: null,
        level: this.calculateLevel(0),
        badges: [],
      };
    }

    let rank = null;
    if (this.redisClient) {
      const zrank = await this.redisClient.zrevrank(
        'leaderboard_all_time',
        userId,
      );
      if (zrank !== null) {
        rank = zrank + 1;
      }
    }

    return {
      totalPoints: stat.totalPoints,
      currentStreak: stat.currentStreak,
      longestStreak: stat.longestStreak,
      rank,
      level: this.calculateLevel(stat.totalPoints),
      badges:
        stat.user?.badges.map((ub) => ({
          ...ub.badge,
          earnedAt: ub.earnedAt,
        })) || [],
    };
  }

  // --- API Functions ---

  async getLeaderboard(limit: number = 100) {
    if (!this.redisClient) return [];

    // ZREVRANGE: Retrieve highest scores in descending order (0 to limit - 1)
    const results = await this.redisClient.zrevrange(
      'leaderboard_all_time',
      0,
      limit - 1,
      'WITHSCORES',
    );

    const leaderboard: Array<{ userId: string; points: number; rank: number }> =
      [];
    for (let i = 0; i < results.length; i += 2) {
      leaderboard.push({
        userId: results[i],
        points: parseInt(results[i + 1], 10),
        rank: i / 2 + 1,
      });
    }

    if (leaderboard.length > 0) {
      const userIds = leaderboard.map((l) => l.userId);
      const users = await this.prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, username: true, avatar: true },
      });

      return leaderboard.map((l) => {
        const u = users.find((x) => x.id === l.userId);
        return {
          ...l,
          username: u?.username || 'Unknown User',
          avatar: u?.avatar || null,
        };
      });
    }

    return leaderboard;
  }

  // --- Admin Badge CRUD ---
  getAllBadges() {
    return this.prisma.badge.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { users: true } },
      },
    });
  }

  async createBadge(data: {
    name: string;
    description: string;
    imageUrl: string;
    conditionType: BadgeCondition;
    conditionValue: number;
  }) {
    const existing = await this.prisma.badge.findUnique({
      where: { name: data.name },
    });
    if (existing) {
      throw new BadRequestException(
        `Badge with name "${data.name}" already exists`,
      );
    }

    return this.prisma.badge.create({ data });
  }

  async updateBadge(
    badgeId: string,
    data: {
      name?: string;
      description?: string;
      imageUrl?: string;
      conditionType?: BadgeCondition;
      conditionValue?: number;
    },
  ) {
    const badge = await this.prisma.badge.findUnique({
      where: { id: badgeId },
    });
    if (!badge) {
      throw new NotFoundException('Badge not found');
    }

    return this.prisma.badge.update({
      where: { id: badgeId },
      data,
    });
  }

  async deleteBadge(badgeId: string) {
    const badge = await this.prisma.badge.findUnique({
      where: { id: badgeId },
    });
    if (!badge) {
      throw new NotFoundException('Badge not found');
    }

    return this.prisma.badge.delete({ where: { id: badgeId } });
  }
}
