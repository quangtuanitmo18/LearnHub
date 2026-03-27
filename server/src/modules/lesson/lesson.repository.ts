import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { BaseService } from 'src/shared/services/base.service';
import { PrismaService } from 'src/shared/services/prisma.service';
import { UpdateLessonDto } from './dto/lesson.dto';

// Define the lesson payload type with relations
type LessonWithRelations = Prisma.LessonGetPayload<{
  include: {
    course: true;
    chapter: true;
    article: true;
    video: true;
    quiz: {
      include: {
        questions: {
          include: {
            options: true;
          };
        };
      };
    };
  };
}>;

@Injectable()
export class LessonRepository extends BaseService<
  LessonWithRelations,
  any,
  UpdateLessonDto,
  Prisma.LessonWhereUniqueInput
> {
  protected modelName = Prisma.ModelName.Lesson;

  constructor(prismaService: PrismaService) {
    super(prismaService, {
      defaultSortBy: 'order',
      defaultSortOrder: 'asc',
      searchFields: ['title'],
      selectFields: {
        id: true,
        type: true,
        title: true,
        description: true,
        slug: true,
        order: true,
        published: true,
        durationSec: true,
        courseId: true,
        chapterId: true,
        createdAt: true,
        updatedAt: true,
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        chapter: {
          select: {
            id: true,
            title: true,
            order: true,
          },
        },
      },
    });
  }

  /**
   * Select fields for lesson with content
   */
  private getFullSelectFields() {
    return {
      id: true,
      type: true,
      title: true,
      description: true,
      slug: true,
      order: true,
      published: true,
      durationSec: true,
      courseId: true,
      chapterId: true,
      createdAt: true,
      updatedAt: true,
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
      chapter: {
        select: {
          id: true,
          title: true,
          order: true,
        },
      },
      article: true,
      video: true,
      quiz: {
        include: {
          questions: {
            orderBy: { order: 'asc' as const },
            include: {
              options: {
                orderBy: { order: 'asc' as const },
              },
            },
          },
        },
      },
    };
  }

  /**
   * Find lessons by chapter ID (ordered by order field)
   */
  async findByChapter(chapterId: string): Promise<any[]> {
    return await this.model.findMany({
      where: { chapterId },
      orderBy: { order: 'asc' },
      select: this.options.selectFields,
    });
  }

  /**
   * Find published lessons by chapter ID
   */
  async findPublishedByChapter(chapterId: string) {
    return await this.model.findMany({
      where: {
        chapterId,
        published: true,
      },
      orderBy: { order: 'asc' },
      select: this.options.selectFields,
    });
  }

  /**
   * Get the next order number for a chapter
   */
  async getNextOrder(chapterId: string): Promise<number> {
    const lastLesson = await this.model.findFirst({
      where: { chapterId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    return lastLesson ? lastLesson.order + 1 : 1;
  }

  /**
   * Check if lesson order exists in chapter
   */
  async isOrderExists(
    chapterId: string,
    order: number,
    excludeId?: string,
  ): Promise<boolean> {
    const lesson = await this.model.findFirst({
      where: {
        chapterId,
        order,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });

    return !!lesson;
  }

  /**
   * Reorder lessons after a specific order
   */
  async reorderLessons(chapterId: string, fromOrder: number): Promise<void> {
    await this.model.updateMany({
      where: {
        chapterId,
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
   * Find lesson by ID with full content data (Article, Video, or Quiz with questions)
   */
  async findWithContent(where: Prisma.LessonWhereUniqueInput) {
    return await this.model.findUnique({
      where,
      select: this.getFullSelectFields(),
    });
  }

  /**
   * Check if slug is unique
   */
  async isSlugUnique(slug: string, excludeId?: string): Promise<boolean> {
    const lesson = await this.model.findFirst({
      where: {
        slug,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });

    return !lesson;
  }

  /**
   * Bulk update lesson orders (for drag and drop reordering)
   */
  async bulkUpdateOrders(
    lessons: Array<{ id: string; order: number }>,
  ): Promise<void> {
    await this.prismaService.$transaction(
      lessons.map((lesson) =>
        this.model.update({
          where: { id: lesson.id },
          data: { order: lesson.order },
        }),
      ),
    );
  }
}
