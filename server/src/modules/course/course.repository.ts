import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/shared/services/base.service';
import { PrismaService } from 'src/shared/services/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import {
  CreateCourseDto,
  UpdateCourseDto,
  CourseQueryDto,
  PublicCourseQueryDto,
} from './dto/course.dto';
import { CourseType } from 'src/shared/constants/course.constant';
import {
  PaginationQueryDto,
  PaginatedResponseDto,
} from 'src/shared/dto/pagination.dto';
import { min } from 'class-validator';
import { size } from 'zod';

@Injectable()
export class CourseRepository extends BaseService<
  Prisma.CourseGetPayload<{ include: { author: true; category: true } }>,
  CreateCourseDto,
  UpdateCourseDto,
  Prisma.CourseWhereUniqueInput
> {
  protected modelName = Prisma.ModelName.Course;

  constructor(prismaService: PrismaService) {
    super(prismaService, {
      defaultSortBy: 'createdAt',
      defaultSortOrder: 'desc',
      searchFields: ['title', 'description', 'excerpt'],
      selectFields: {
        id: true,
        title: true,
        slug: true,
        image: {
          select: {
            id: true,
            filename: true,
            storageKey: true,
            size: true,
            cdnBaseUrl: true,
            mimetype: true,
          },
        },
        previewImages: {
          select: {
            id: true,
            filename: true,
            storageKey: true,
            size: true,
            cdnBaseUrl: true,
            mimetype: true,
          },
        },
        description: true,
        excerpt: true,
        introUrl: true,
        price: true,
        oldPrice: true,
        isFree: true,
        status: true,
        view: true,
        sold: true,
        level: true,
        info: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  }

  /**
   * Create a course with media relations
   */
  async createCourse(data: CreateCourseDto & { authorId: string }) {
    const { previewImageIds, ...courseData } = data;

    return await this.model.create({
      data: {
        ...courseData,
        previewImages: previewImageIds?.length
          ? { connect: previewImageIds.map((id) => ({ id })) }
          : undefined,
      },
      include: {
        image: {
          select: {
            id: true,
            filename: true,
            storageKey: true,
            cdnBaseUrl: true,
            mimetype: true,
          },
        },
        previewImages: {
          select: {
            id: true,
            filename: true,
            storageKey: true,
            cdnBaseUrl: true,
            mimetype: true,
          },
        },
        author: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  }

  /**
   * Update a course with media relations
   */
  async updateCourse(id: string, data: UpdateCourseDto) {
    const { previewImageIds, ...courseData } = data;

    // Build the update data
    const updateData: any = { ...courseData };

    // Handle previewImages relation if provided
    if (previewImageIds !== undefined) {
      updateData.previewImages = {
        set: previewImageIds.map((mediaId) => ({ id: mediaId })),
      };
    }

    return await this.model.update({
      where: { id },
      data: updateData,
      include: {
        image: {
          select: {
            id: true,
            filename: true,
            storageKey: true,
            cdnBaseUrl: true,
            mimetype: true,
          },
        },
        previewImages: {
          select: {
            id: true,
            filename: true,
            storageKey: true,
            cdnBaseUrl: true,
            mimetype: true,
          },
        },
        author: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  }

  /**
   * Bulk delete courses by IDs
   */
  async bulkDelete(ids: string[]) {
    return this.prismaService.course.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }

  /**
   * Find all courses with filtering by status, level, and type
   */
  async findAllCourses(
    courseQuery?: CourseQueryDto,
  ): Promise<PaginatedResponseDto<any>> {
    // Build additional where conditions for status, level, and type filters
    const additionalWhere: any = {};

    if (courseQuery?.status) {
      if (Array.isArray(courseQuery.status)) {
        additionalWhere.status = { in: courseQuery.status };
      } else {
        additionalWhere.status = courseQuery.status;
      }
    }

    if (courseQuery?.level) {
      if (Array.isArray(courseQuery.level)) {
        additionalWhere.level = { in: courseQuery.level };
      } else {
        additionalWhere.level = courseQuery.level;
      }
    }

    if (courseQuery?.type) {
      const typeFilters = Array.isArray(courseQuery.type)
        ? courseQuery.type
        : [courseQuery.type];

      const typeConditions: any[] = [];

      for (const type of typeFilters) {
        switch (type) {
          case CourseType.FREE:
            typeConditions.push({ isFree: true });
            break;
          case CourseType.PAID:
            typeConditions.push({ isFree: false });
            break;
        }
      }

      if (typeConditions.length > 0) {
        if (additionalWhere.OR) {
          // If there are already OR conditions, combine them
          additionalWhere.AND = [
            { OR: additionalWhere.OR },
            { OR: typeConditions },
          ];
          delete additionalWhere.OR;
        } else {
          additionalWhere.OR = typeConditions;
        }
      }
    }

    // Use the base findAll method with additional filters
    return this.findAll(courseQuery, additionalWhere);
  }

  /**
   * Find course by slug
   */
  async findBySlug(slug: string) {
    return this.findOneOrNull({ slug });
  }

  /**
   * Find published courses
   */
  async findPublished(paginationQuery?: PaginationQueryDto) {
    return this.findAll(paginationQuery, { status: 'PUBLISHED' });
  }

  /**
   * Find published courses with additional counts (totalLessons and enrolledStudents)
   */
  async findPublishedWithCounts(paginationQuery?: PaginationQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = this.options.defaultSortBy,
      sortOrder = this.options.defaultSortOrder,
    } = paginationQuery || {};

    const skip = (page - 1) * limit;

    const searchConditions = this.buildSearchConditions(search);
    const where = { AND: [searchConditions, { status: 'PUBLISHED' }] };

    const orderBy = { [sortBy as string]: sortOrder };

    const findManyOptions: any = {
      where,
      orderBy,
      skip,
      take: limit,
      select: {
        ...this.options.selectFields,
        _count: {
          select: {
            lessons: true,
          },
        },
      },
    };

    const [records, total] = await Promise.all([
      this.model.findMany(findManyOptions),
      this.model.count({ where }),
    ]);

    // Transform the results to include totalLessons and enrolledStudents
    const transformedRecords = records.map((course: any) => {
      const { _count, ...courseData } = course;
      return {
        ...courseData,
        totalLessons: _count?.lessons || 0,
        enrolledStudents: course.sold || 0, // Use sold field as enrolled students count
      };
    });

    return new PaginatedResponseDto(
      transformedRecords as any[],
      total as number,
      page,
      limit,
    );
  }

  /**
   * Find published courses with advanced filtering and sorting for public API
   */
  async findPublishedWithFilters(
    publicQuery?: PublicCourseQueryDto,
  ): Promise<PaginatedResponseDto<any>> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'newest',
      sortOrder = 'desc',
      minPrice,
      maxPrice,
      level,
      type,
    } = publicQuery || {};

    const skip = (page - 1) * limit;

    // Build search conditions
    const searchConditions = this.buildSearchConditions(search);

    // Build where clause
    const whereConditions: any[] = [searchConditions, { status: 'PUBLISHED' }];

    // Price filtering
    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceCondition: any = {};
      if (minPrice !== undefined) {
        priceCondition.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        priceCondition.lte = maxPrice;
      }
      whereConditions.push({ price: priceCondition });
    }

    // Level filtering
    if (level) {
      if (Array.isArray(level)) {
        whereConditions.push({ level: { in: level } });
      } else {
        whereConditions.push({ level });
      }
    }

    // Type filtering (free/paid)
    if (type) {
      const typeFilters = Array.isArray(type) ? type : [type];
      const typeConditions: any[] = [];

      for (const courseType of typeFilters) {
        switch (courseType) {
          case 'FREE':
            typeConditions.push({ isFree: true });
            break;
          case 'PAID':
            typeConditions.push({ isFree: false });
            break;
        }
      }

      if (typeConditions.length > 0) {
        whereConditions.push({ OR: typeConditions });
      }
    }

    const where = { AND: whereConditions };

    // Build order by clause
    let orderBy: any;
    switch (sortBy) {
      case 'newest':
        orderBy = { createdAt: sortOrder };
        break;
      case 'rating':
        // Assuming you have a rating field or calculate it
        orderBy = { createdAt: sortOrder }; // Fallback to newest for now
        break;
      case 'price':
        orderBy = { price: sortOrder };
        break;
      case 'alphabetical':
        orderBy = { title: sortOrder };
        break;
      case 'popular':
        orderBy = { sold: sortOrder };
        break;
      default:
        orderBy = { [sortBy]: sortOrder };
    }

    const findManyOptions: any = {
      where,
      orderBy,
      skip,
      take: limit,
      select: {
        ...this.options.selectFields,
        _count: {
          select: {
            lessons: true,
          },
        },
      },
    };

    const [records, total] = await Promise.all([
      this.model.findMany(findManyOptions),
      this.model.count({ where }),
    ]);

    // Transform the results to include additional statistics
    const transformedRecords = await Promise.all(
      records.map(async (course: any) => {
        const { _count, ...courseData } = course;

        // Get additional statistics for each course
        const [totalDuration, reviewStats] = await Promise.all([
          this.getTotalDuration(course.id),
          this.getReviewStats(course.id),
        ]);

        return {
          ...courseData,
          totalLessons: _count?.lessons || 0,
          enrolledStudents: course.sold || 0,
          totalDuration,
          totalReviews: reviewStats.totalReviews,
          averageRating: reviewStats.averageRating,
        };
      }),
    );

    return new PaginatedResponseDto(transformedRecords, total, page, limit);
  }

  /**
   * Check if slug exists (excluding current course for updates)
   */
  async isSlugExists(slug: string, excludeId?: string) {
    const where: Prisma.CourseWhereInput = { slug };
    if (excludeId) {
      where.NOT = { id: excludeId };
    }
    const course = await this.findFirst(where);
    return !!course;
  }

  /**
   * Increment course views
   */
  async incrementViews(id: string) {
    return await this.prismaService.course.update({
      where: { id },
      data: {
        view: {
          increment: 1,
        },
      },
    });
  }

  /**
   * Increment course sold count
   */
  async incrementSold(id: string) {
    return await this.prismaService.course.update({
      where: { id },
      data: {
        sold: {
          increment: 1,
        },
      },
    });
  }

  /**
   * Get total number of lessons in a course
   */
  async getTotalLessons(courseId: string): Promise<number> {
    return await this.prismaService.lesson.count({
      where: { courseId },
    });
  }

  /**
   * Get total duration of all lessons in a course (in seconds)
   */
  async getTotalDuration(courseId: string): Promise<number> {
    const result = await this.prismaService.lesson.aggregate({
      where: { courseId },
      _sum: {
        durationSec: true,
      },
    });

    return result._sum.durationSec || 0;
  }

  /**
   * Get number of enrolled students (unique users who purchased the course)
   */
  async getEnrolledStudents(courseId: string): Promise<number> {
    const uniqueOrders = await this.prismaService.orderItem.findMany({
      where: { courseId },
      distinct: ['orderId'],
      select: {
        order: {
          select: {
            userId: true,
          },
        },
      },
    });

    // Count unique users
    const uniqueUsers = new Set(
      uniqueOrders.map((item) => item.order.userId).filter(Boolean),
    );

    return uniqueUsers.size;
  }

  /**
   * Get review statistics for a course (total reviews and average rating)
   */
  async getReviewStats(
    courseId: string,
  ): Promise<{ totalReviews: number; averageRating: number }> {
    const stats = await this.prismaService.review.aggregate({
      where: {
        courseId,
        status: 'APPROVED',
      },
      _count: {
        id: true,
      },
      _avg: {
        star: true,
      },
    });

    return {
      totalReviews: stats._count.id || 0,
      averageRating: stats._avg.star ? Number(stats._avg.star.toFixed(1)) : 0,
    };
  }
}
