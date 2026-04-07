import { DynamicStructuredTool } from '@langchain/core/tools';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import { z } from 'zod';

/**
 * Exposes system actions as LangChain tools that the LLM can invoke.
 * Each tool wraps an existing repository/service method.
 */
@Injectable()
export class ToolsService {
  private readonly logger = new Logger(ToolsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns all available tools for the LLM to use.
   */
  getTools(userId: string): DynamicStructuredTool[] {
    return [
      this.createGetLearningProgressTool(userId),
      this.createLookupCouponTool(),
      this.createGetCourseDetailsTool(),
    ];
  }

  private createGetLearningProgressTool(userId: string): DynamicStructuredTool {
    return new DynamicStructuredTool({
      name: 'get_learning_progress',
      description:
        'Get the current learning progress for this student. Returns courses they are enrolled in and completion percentage.',
      schema: z.object({}),
      func: async () => {
        try {
          const progress = await this.prisma.userLessonProgress.findMany({
            where: { userId },
            include: {
              course: { select: { id: true, title: true } },
              lesson: { select: { id: true, title: true } },
            },
            orderBy: { updatedAt: 'desc' },
            take: 20,
          });

          if (progress.length === 0) {
            return JSON.stringify({
              message: 'This student has not started any courses yet.',
              courses: [],
            });
          }

          // Group by course
          const courseMap = new Map<
            string,
            {
              title: string;
              completed: number;
              total: number;
              lastLesson: string;
            }
          >();
          for (const p of progress) {
            const courseId = p.courseId;
            if (!courseMap.has(courseId)) {
              // Count total lessons in course
              const totalLessons = await this.prisma.lesson.count({
                where: { courseId },
              });
              courseMap.set(courseId, {
                title: p.course.title ?? 'Untitled Course',
                completed: 0,
                total: totalLessons,
                lastLesson: p.lesson.title ?? 'Unknown',
              });
            }
            const entry = courseMap.get(courseId)!;
            entry.completed++;
            entry.lastLesson = p.lesson.title ?? entry.lastLesson;
          }

          const courses = Array.from(courseMap.entries()).map(([id, data]) => ({
            courseId: id,
            title: data.title,
            completedLessons: data.completed,
            totalLessons: data.total,
            progressPercent:
              data.total > 0
                ? Math.round((data.completed / data.total) * 100)
                : 0,
            lastLesson: data.lastLesson,
          }));

          return JSON.stringify({ courses });
        } catch (error) {
          this.logger.error('get_learning_progress failed', error);
          return JSON.stringify({ error: 'Failed to fetch learning progress' });
        }
      },
    });
  }

  private createLookupCouponTool(): DynamicStructuredTool {
    return new DynamicStructuredTool({
      name: 'lookup_coupon',
      description:
        'Check if a coupon code is valid and return its details (discount amount, expiry, conditions).',
      schema: z.object({
        couponCode: z.string().describe('The coupon code to look up'),
      }),
      func: async ({ couponCode }) => {
        try {
          const coupon = await this.prisma.coupon.findFirst({
            where: {
              code: { equals: couponCode, mode: 'insensitive' },
            },
            include: {
              courses: { select: { id: true, title: true } },
            },
          });

          if (!coupon) {
            return JSON.stringify({
              valid: false,
              message: `Coupon "${couponCode}" not found.`,
            });
          }

          const now = new Date();
          const isExpired = coupon.endDate && coupon.endDate < now;
          const isNotStarted = coupon.startDate && coupon.startDate > now;
          const isUsedUp =
            coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses;

          return JSON.stringify({
            valid: !isExpired && !isNotStarted && !isUsedUp && coupon.isActive,
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: Number(coupon.discountValue),
            minPurchaseAmount: coupon.minPurchaseAmount
              ? Number(coupon.minPurchaseAmount)
              : null,
            startDate: coupon.startDate,
            endDate: coupon.endDate,
            usedCount: coupon.usedCount,
            maxUses: coupon.maxUses,
            applicableCourses:
              coupon.courses.length > 0
                ? coupon.courses.map((c) => c.title)
                : ['All courses'],
            reason: isExpired
              ? 'Expired'
              : isNotStarted
                ? 'Not started yet'
                : isUsedUp
                  ? 'Usage limit reached'
                  : !coupon.isActive
                    ? 'Inactive'
                    : 'Valid',
          });
        } catch (error) {
          this.logger.error('lookup_coupon failed', error);
          return JSON.stringify({ error: 'Failed to look up coupon' });
        }
      },
    });
  }

  private createGetCourseDetailsTool(): DynamicStructuredTool {
    return new DynamicStructuredTool({
      name: 'get_course_details',
      description:
        'Get detailed information about a specific course by its title or keyword. Use when the user asks about a specific course.',
      schema: z.object({
        keyword: z.string().describe('Course title or keyword to search for'),
      }),
      func: async ({ keyword }) => {
        try {
          const courses = await this.prisma.course.findMany({
            where: {
              title: { contains: keyword, mode: 'insensitive' },
              status: 'PUBLISHED',
            },
            include: {
              chapters: {
                select: {
                  title: true,
                  _count: { select: { lessons: true } },
                },
                orderBy: { order: 'asc' },
              },
              category: { select: { name: true } },
              author: { select: { username: true } },
              _count: { select: { reviews: true } },
            },
            take: 3,
          });

          if (courses.length === 0) {
            return JSON.stringify({
              found: false,
              message: `No courses found matching "${keyword}".`,
            });
          }

          const result = courses.map((c) => ({
            id: c.id,
            title: c.title,
            description: c.description,
            level: c.level,
            price: Number(c.price),
            category: c.category?.name,
            author: c.author?.username,
            totalChapters: c.chapters.length,
            totalLessons: c.chapters.reduce(
              (sum, ch) => sum + ch._count.lessons,
              0,
            ),
            totalReviews: c._count.reviews,
            chapters: c.chapters.map((ch) => ({
              title: ch.title,
              lessonCount: ch._count.lessons,
            })),
          }));

          return JSON.stringify({ found: true, courses: result });
        } catch (error) {
          this.logger.error('get_course_details failed', error);
          return JSON.stringify({ error: 'Failed to fetch course details' });
        }
      },
    });
  }
}
