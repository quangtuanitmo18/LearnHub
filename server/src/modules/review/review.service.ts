import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ReviewRepository } from './review.repository';
import { CourseRepository } from '../course/course.repository';
import { OrderRepository } from '../order/order.repository';
import {
  CreateReviewDto,
  UpdateReviewDto,
  UpdateReviewStatusDto,
  ReviewQueryDto,
} from './dto/review.dto';
import { PaginationQueryDto } from 'src/shared/dto/pagination.dto';
import {
  ReviewStatus,
  type ReviewStatusType,
} from 'src/shared/constants/review.constant';

@Injectable()
export class ReviewService {
  constructor(
    private readonly reviewRepository: ReviewRepository,
    private readonly courseRepository: CourseRepository,
    private readonly orderRepository: OrderRepository,
  ) {}

  /**
   * Create a review
   */
  async createReview(userId: string, createReviewDto: CreateReviewDto) {
    const { courseId, star, content } = createReviewDto;

    // Check if course exists
    const course = await this.courseRepository.findOneOrNull({ id: courseId });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check if user has access to the course (purchased or membership)
    const accessCheck = await this.orderRepository.hasUserCourseAccess(
      userId,
      courseId,
    );
    if (!accessCheck.hasAccess) {
      throw new ForbiddenException(
        'You must purchase the course or have an active membership before you can review it',
      );
    }

    // Create review (users can review multiple times)
    return await this.reviewRepository.create({
      userId,
      courseId,
      star,
      content,
      status: ReviewStatus.APPROVED,
    });
  }

  /**
   * Get all reviews (admin)
   */
  async getAllReviews(
    paginationQuery?: PaginationQueryDto,
    queryDto?: ReviewQueryDto,
  ) {
    const additionalWhere: any = {};

    if (queryDto?.status) {
      additionalWhere.status = queryDto.status;
    }

    if (queryDto?.star) {
      additionalWhere.star = queryDto.star;
    }

    if (queryDto?.courseId) {
      additionalWhere.courseId = queryDto.courseId;
    }

    if (queryDto?.userId) {
      additionalWhere.userId = queryDto.userId;
    }

    // Filter by minimum star rating if provided in pagination query
    if (paginationQuery?.minStar) {
      additionalWhere.star = {
        gte: paginationQuery.minStar,
      };
    }

    return this.reviewRepository.findAll(paginationQuery, additionalWhere);
  }

  /**
   * Get reviews by course
   */
  async getCourseReviews(
    courseId: string,
    paginationQuery?: PaginationQueryDto,
    status?: ReviewStatusType,
  ) {
    // Verify course exists
    const course = await this.courseRepository.findOneOrNull({ id: courseId });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // For public, only show approved reviews
    const reviewStatus = status || ReviewStatus.APPROVED;

    const additionalWhere: any = { status: reviewStatus };

    // Filter by minimum star rating if provided
    if (paginationQuery?.minStar) {
      additionalWhere.star = {
        gte: paginationQuery.minStar,
      };
    }

    return this.reviewRepository.findAll(paginationQuery, {
      ...additionalWhere,
      courseId,
    });
  }

  /**
   * Get review by ID
   */
  async getReviewById(reviewId: string, userId?: string) {
    const review = await this.reviewRepository.findOneOrNull({ id: reviewId });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // If userId provided, verify ownership for non-admin
    if (userId && review.userId !== userId) {
      throw new ForbiddenException('You do not have access to this review');
    }

    return review;
  }

  /**
   * Update review
   */
  async updateReview(
    reviewId: string,
    userId: string,
    updateReviewDto: UpdateReviewDto,
  ) {
    const review = await this.reviewRepository.findOneOrNull({ id: reviewId });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Verify ownership
    if (review.userId !== userId) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    return this.reviewRepository.update({ id: reviewId }, updateReviewDto);
  }

  /**
   * Delete review
   */
  async deleteReview(reviewId: string, userId: string) {
    const review = await this.reviewRepository.findOneOrNull({ id: reviewId });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Verify ownership
    if (review.userId !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    return this.reviewRepository.delete({ id: reviewId });
  }

  /**
   * Bulk delete reviews (admin only)
   */
  async bulkDeleteReviews(ids: string[]) {
    if (!ids || ids.length === 0) {
      throw new BadRequestException('No IDs provided for deletion');
    }

    const result = await this.reviewRepository.bulkDelete(ids);

    if (result.count === 0) {
      throw new NotFoundException('No reviews found with the provided IDs');
    }

    return {
      deletedCount: result.count,
      message: `Successfully deleted ${result.count} ${result.count === 1 ? 'review' : 'reviews'}`,
    };
  }

  /**
   * Update review status (admin)
   */
  async updateReviewStatus(
    reviewId: string,
    updateStatusDto: UpdateReviewStatusDto,
  ) {
    const review = await this.reviewRepository.findOneOrNull({ id: reviewId });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return this.reviewRepository.updateStatus(reviewId, updateStatusDto.status);
  }

  /**
   * Get course review statistics
   */
  async getCourseReviewStats(courseId: string) {
    // Verify course exists
    const course = await this.courseRepository.findOneOrNull({ id: courseId });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return this.reviewRepository.getCourseReviewStats(courseId);
  }
}
