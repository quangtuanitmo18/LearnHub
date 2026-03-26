import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/shared/services/base.service';
import { PrismaService } from 'src/shared/services/prisma.service';
import { Prisma } from 'src/generated/prisma/client';

@Injectable()
export class UserLessonProgressRepository extends BaseService<
  any,
  Prisma.UserLessonProgressUncheckedCreateInput,
  Prisma.UserLessonProgressUncheckedUpdateInput,
  Prisma.UserLessonProgressWhereUniqueInput
> {
  protected modelName = Prisma.ModelName.UserLessonProgress;

  // Handle camelCase delegate name for Prisma
  protected get model() {
    return this.prismaService.userLessonProgress;
  }

  constructor(prismaService: PrismaService) {
    super(prismaService, {
      defaultSortBy: 'createdAt',
      defaultSortOrder: 'desc',
      searchFields: [],
      selectFields: {
        id: true,
        userId: true,
        lessonId: true,
        courseId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Find progress by user and lesson
   */
  async findByUserAndLesson(
    userId: string,
    lessonId: string,
  ): Promise<Record<string, unknown> | null> {
    return this.findOneOrNull({
      unique_user_lesson_progress: {
        userId,
        lessonId,
      },
    });
  }

  /**
   * Toggle progress: create if missing, delete if exists
   */
  async toggleProgress(userId: string, lessonId: string, courseId: string) {
    const existing = await this.findByUserAndLesson(userId, lessonId);
    if (existing) {
      await this.model.delete({
        where: {
          unique_user_lesson_progress: {
            userId,
            lessonId,
          },
        },
      });
      return { removed: true };
    }

    return this.model.create({
      data: {
        userId,
        lessonId,
        courseId,
      },
      select: {
        id: true,
        userId: true,
        lessonId: true,
        courseId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Find all progress items by user within a course
   */
  async findManyByUserAndCourse(userId: string, courseId: string) {
    return this.model.findMany({
      where: {
        userId,
        courseId,
      },
      orderBy: [{ createdAt: 'desc' }],
      select: {
        id: true,
        userId: true,
        lessonId: true,
        courseId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
