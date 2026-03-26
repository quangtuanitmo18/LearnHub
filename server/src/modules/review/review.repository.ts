import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/shared/services/base.service';
import { PrismaService } from 'src/shared/services/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { PaginationQueryDto } from 'src/shared/dto/pagination.dto';
import { ReviewStatusType } from 'src/shared/constants/review.constant';

@Injectable()
export class ReviewRepository extends BaseService<
  Prisma.ReviewGetPayload<{ include: { user: true; course: true } }>,
  any,
  any,
  Prisma.ReviewWhereUniqueInput
> {
  protected modelName = Prisma.ModelName.Review;

  constructor(prismaService: PrismaService) {
    super(prismaService, {
      defaultSortBy: 'createdAt',
      defaultSortOrder: 'desc',
      searchFields: ['content'],
      selectFields: {
        id: true,
        star: true,
        content: true,
        status: true,
        userId: true,
        courseId: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            image: true,
          },
        },
      },
    });
  }

  /**
   * Find reviews by course
   */
  async findByCourse(
    courseId: string,
    paginationQuery?: PaginationQueryDto,
    status?: ReviewStatusType,
  ) {
    const where: any = { courseId };
    if (status) {
      where.status = status;
    }
    return this.findAll(paginationQuery, where);
  }

  /**
   * Find reviews by user
   */
  async findByUser(userId: string, paginationQuery?: PaginationQueryDto) {
    return this.findAll(paginationQuery, { userId });
  }

  /**
   * Find reviews by status
   */
  async findByStatus(
    status: ReviewStatusType,
    paginationQuery?: PaginationQueryDto,
  ) {
    return this.findAll(paginationQuery, { status });
  }

  /**
   * Find user's review for a specific course
   */
  async findUserCourseReview(userId: string, courseId: string) {
    return this.findFirst({ userId, courseId });
  }

  /**
   * Check if user has reviewed a course
   */
  async hasUserReviewedCourse(
    userId: string,
    courseId: string,
  ): Promise<boolean> {
    const review = await this.findUserCourseReview(userId, courseId);
    return !!review;
  }

  /**
   * Bulk delete reviews by IDs
   */
  async bulkDelete(ids: string[]) {
    return this.prismaService.review.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }

  /**
   * Update review status
   */
  async updateStatus(reviewId: string, status: ReviewStatusType) {
    return await this.prismaService.review.update({
      where: { id: reviewId },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            image: true,
          },
        },
      },
    });
  }

  /**
   * Get course review statistics
   */
  async getCourseReviewStats(courseId: string) {
    const [total, averageRating, ratingDistribution] = await Promise.all([
      this.prismaService.review.count({
        where: { courseId, status: 'APPROVED' },
      }),
      this.prismaService.review.aggregate({
        where: { courseId, status: 'APPROVED' },
        _avg: {
          star: true,
        },
      }),
      this.getRatingDistribution(courseId),
    ]);

    return {
      total,
      averageRating: averageRating._avg.star || 0,
      ratingDistribution,
    };
  }

  /**
   * Get rating distribution for a course
   */
  private async getRatingDistribution(courseId: string) {
    const reviews = await this.prismaService.review.groupBy({
      by: ['star'],
      where: { courseId, status: 'APPROVED' },
      _count: {
        star: true,
      },
    });

    const distribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    reviews.forEach((review) => {
      distribution[review.star as 1 | 2 | 3 | 4 | 5] = review._count.star;
    });

    return distribution;
  }

  /**
   * Get user review statistics
   */
  async getUserReviewStats(userId: string) {
    const [total, pending, approved, rejected] = await Promise.all([
      this.prismaService.review.count({ where: { userId } }),
      this.prismaService.review.count({
        where: { userId, status: 'PENDING' },
      }),
      this.prismaService.review.count({
        where: { userId, status: 'APPROVED' },
      }),
      this.prismaService.review.count({
        where: { userId, status: 'REJECTED' },
      }),
    ]);

    return {
      total,
      pending,
      approved,
      rejected,
    };
  }

  /**
   * Get overall review statistics (admin)
   */
  async getOverallStats() {
    const [total, pending, approved, rejected] = await Promise.all([
      this.prismaService.review.count(),
      this.prismaService.review.count({ where: { status: 'PENDING' } }),
      this.prismaService.review.count({ where: { status: 'APPROVED' } }),
      this.prismaService.review.count({ where: { status: 'REJECTED' } }),
    ]);

    return {
      total,
      pending,
      approved,
      rejected,
    };
  }
}
