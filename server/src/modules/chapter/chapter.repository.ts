import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { PaginationQueryDto } from 'src/shared/dto/pagination.dto';
import { BaseService } from 'src/shared/services/base.service';
import { PrismaService } from 'src/shared/services/prisma.service';
import { CreateChapterDto, UpdateChapterDto } from './dto/chapter.dto';

@Injectable()
export class ChapterRepository extends BaseService<
  Prisma.ChapterGetPayload<{ include: { course: true } }>,
  CreateChapterDto,
  UpdateChapterDto,
  Prisma.ChapterWhereUniqueInput
> {
  protected modelName = Prisma.ModelName.Chapter;

  constructor(prismaService: PrismaService) {
    super(prismaService, {
      defaultSortBy: 'order',
      defaultSortOrder: 'asc',
      searchFields: ['title', 'description'],
      selectFields: {
        id: true,
        title: true,
        description: true,
        order: true,
        isPublished: true,
        courseId: true,
        createdAt: true,
        updatedAt: true,
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });
  }

  /**
   * Find chapters by course ID
   */
  async findByCourse(courseId: string, paginationQuery?: PaginationQueryDto) {
    return this.findAll(paginationQuery, {
      courseId,
    });
  }

  /**
   * Find published chapters by course ID
   */
  async findPublishedByCourse(courseId: string) {
    return await this.model.findMany({
      where: {
        courseId,
        isPublished: true,
      },
      orderBy: { order: 'asc' },
      select: this.options.selectFields,
    });
  }

  /**
   * Find chapters ordered by order field with lesson statistics
   */
  async findOrderedByCourse(courseId: string): Promise<any[]> {
    // Fetch all chapters for the course ordered by order field
    const chapters = await this.model.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        title: true,
        description: true,
        order: true,
        isPublished: true,
        courseId: true,
        createdAt: true,
        updatedAt: true,
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    // Get lesson statistics for each chapter
    const chapterIds = chapters.map((chapter) => chapter.id);

    const lessonStats = await this.prismaService.lesson.groupBy({
      by: ['chapterId'],
      where: {
        chapterId: { in: chapterIds },
      },
      _count: {
        _all: true,
      },
      _sum: {
        durationSec: true,
      },
    });

    const publishedLessonStats = await this.prismaService.lesson.groupBy({
      by: ['chapterId'],
      where: {
        chapterId: { in: chapterIds },
        published: true,
      },
      _count: {
        _all: true,
      },
    });

    // Create maps for quick lookup
    const statsMap = new Map(
      lessonStats.map((stat) => [
        stat.chapterId,
        {
          totalLessons: stat._count?._all || 0,
          totalDuration: stat._sum?.durationSec || 0,
        },
      ]),
    );

    const publishedStatsMap = new Map(
      publishedLessonStats.map((stat) => [
        stat.chapterId,
        stat._count?._all || 0,
      ]),
    );

    // Transform chapters with statistics
    const transformedChapters = chapters.map((chapter) => {
      const stats = statsMap.get(chapter.id) || {
        totalLessons: 0,
        totalDuration: 0,
      };
      const totalPublishedLessons = publishedStatsMap.get(chapter.id) || 0;

      return {
        ...chapter,
        totalLessons: stats.totalLessons,
        totalPublishedLessons,
        totalDuration: stats.totalDuration,
      };
    });

    return transformedChapters;
  }

  /**
   * Get the next order number for a course
   */
  async getNextOrder(courseId: string): Promise<number> {
    const lastChapter = await this.model.findFirst({
      where: { courseId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    return lastChapter ? lastChapter.order + 1 : 1;
  }

  /**
   * Check if chapter order exists in course
   */
  async isOrderExists(
    courseId: string,
    order: number,
    excludeId?: string,
  ): Promise<boolean> {
    const chapter = await this.model.findFirst({
      where: {
        courseId,
        order,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });

    return !!chapter;
  }

  /**
   * Reorder chapters after a specific order
   */
  async reorderChapters(courseId: string, fromOrder: number): Promise<void> {
    await this.model.updateMany({
      where: {
        courseId,
        order: {
          gte: fromOrder,
        },
      },
      data: {
        order: {
          increment: 1,
        },
      },
    });
  }

  /**
   * Bulk update chapter orders (for drag and drop reordering)
   */
  async bulkUpdateOrders(
    chapters: Array<{ id: string; order: number }>,
  ): Promise<void> {
    await this.prismaService.$transaction(
      chapters.map((chapter) =>
        this.model.update({
          where: { id: chapter.id },
          data: { order: chapter.order },
        }),
      ),
    );
  }

  /**
   * Get total number of lessons in a chapter
   */
  async getTotalLessons(chapterId: string): Promise<number> {
    return await this.prismaService.lesson.count({
      where: { chapterId },
    });
  }

  /**
   * Get total duration of all lessons in a chapter (in seconds)
   */
  async getTotalDuration(chapterId: string): Promise<number> {
    const result = await this.prismaService.lesson.aggregate({
      where: { chapterId },
      _sum: {
        durationSec: true,
      },
    });

    return result._sum.durationSec || 0;
  }
}
