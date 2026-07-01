import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateCourseDto,
  UpdateCourseDto,
  CourseQueryDto,
  PublicCourseQueryDto,
} from './dto/course.dto';
import { PaginationQueryDto } from 'src/shared/dto/pagination.dto';
import { CourseRepository } from './course.repository';
import { UserRepository } from '../user/user.repository';
import { CategoryRepository } from '../category/category.repository';
import { NotificationService } from '../notification/notification.service';
import { PrismaService } from 'src/shared/services/prisma.service';
import { CourseStatus } from 'src/shared/constants/course.constant';
import { OrderStatus } from 'src/shared/constants/order.constant';

@Injectable()
export class CourseService {
  constructor(
    private readonly courseRepository: CourseRepository,
    private readonly userRepository: UserRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly notificationService: NotificationService,
    private readonly prismaService: PrismaService,
  ) {}

  async getAllCourses(courseQuery?: CourseQueryDto) {
    return await this.courseRepository.findAllCourses(courseQuery);
  }

  async getPublishedCourses(publicQuery?: PublicCourseQueryDto) {
    return await this.courseRepository.findPublishedWithFilters(publicQuery);
  }

  /**
   * Get user's enrolled courses with progress
   */
  async getMyCourses(userId: string) {
    // 1. Get all courses the user is enrolled in via completed orders
    const orders = await this.prismaService.orderItem.findMany({
      where: {
        order: {
          userId,
          status: OrderStatus.COMPLETED,
          orderType: 'COURSE',
        },
      },
      select: {
        courseId: true,
      },
      distinct: ['courseId'],
    });

    if (!orders || orders.length === 0) {
      return [];
    }

    const courseIds = orders.map((order) => order.courseId);

    // 2. Fetch all courses in a single query
    const courses = await this.prismaService.course.findMany({
      where: { id: { in: courseIds } },
      include: {
        image: true,
      },
    });

    if (!courses.length) return [];

    // 3. Batch fetch all statistics in parallel (4 queries total instead of 4 * N)
    const [totalLessonsGroups, reviewStatsGroups, completedLessonsGroups] =
      await Promise.all([
        // Total lessons per course
        this.prismaService.lesson.groupBy({
          by: ['courseId'],
          where: { courseId: { in: courseIds } },
          _count: { id: true },
        }),
        // Review stats per course
        this.prismaService.review.groupBy({
          by: ['courseId'],
          where: { courseId: { in: courseIds }, status: 'APPROVED' },
          _count: { id: true },
          _avg: { star: true },
        }),
        // Completed lessons per course for this user
        this.prismaService.userLessonProgress.groupBy({
          by: ['courseId'],
          where: { courseId: { in: courseIds }, userId },
          _count: { id: true },
        }),
      ]);

    // Create maps for O(1) lookup
    const totalLessonsMap = new Map<string, number>(
      totalLessonsGroups.map(
        (g) => [g.courseId, g._count.id] as [string, number],
      ),
    );
    const reviewsMap = new Map<
      string,
      { totalReviews: number; averageRating: number }
    >(
      reviewStatsGroups.map(
        (g) =>
          [
            g.courseId,
            {
              totalReviews: g._count.id || 0,
              averageRating: g._avg.star ? Number(g._avg.star.toFixed(1)) : 0,
            },
          ] as [string, { totalReviews: number; averageRating: number }],
      ),
    );
    const completedLessonsMap = new Map<string, number>(
      completedLessonsGroups.map(
        (g) => [g.courseId, g._count.id] as [string, number],
      ),
    );

    // 4. Transform to final response
    const enrolledCourses = courses.map((course) => {
      const reviewStats = reviewsMap.get(course.id) || {
        totalReviews: 0,
        averageRating: 0,
      };

      return {
        id: course.id,
        title: course.title,
        slug: course.slug,
        image: course.image
          ? `${course.image.cdnBaseUrl}/${course.image.storageKey}`
          : '',
        description: course.description || '',
        level: course.level,
        averageRating: reviewStats.averageRating,
        totalReviews: reviewStats.totalReviews,
        totalLessons: totalLessonsMap.get(course.id) || 0,
        completedLessons: completedLessonsMap.get(course.id) || 0,
      };
    });

    return enrolledCourses;
  }

  async getCourseById(id: string) {
    const course = await this.courseRepository.findOneOrNull({ id });
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    return course;
  }

  async getCourseBySlug(slug: string) {
    const course = await this.courseRepository.findBySlug(slug);

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Increment view count
    await this.courseRepository.incrementViews(course.id);

    // Get additional statistics
    const [totalLessons, totalDuration, enrolledStudents, reviewStats] =
      await Promise.all([
        this.courseRepository.getTotalLessons(course.id),
        this.courseRepository.getTotalDuration(course.id),
        this.courseRepository.getEnrolledStudents(course.id),
        this.courseRepository.getReviewStats(course.id),
      ]);

    return {
      ...course,
      totalLessons,
      totalDuration,
      enrolledStudents,
      totalReviews: reviewStats.totalReviews,
      averageRating: reviewStats.averageRating,
    };
  }

  async createCourse(createCourseDto: CreateCourseDto, authorId: string) {
    // Validate author
    const author = await this.userRepository.findOneOrNull({
      id: authorId,
    });
    if (!author) {
      throw new BadRequestException('Author not found');
    }

    // Validate category if provided
    if (createCourseDto.categoryId) {
      const category = await this.categoryRepository.findOneOrNull({
        id: createCourseDto.categoryId,
      });
      if (!category) {
        throw new BadRequestException('Category not found');
      }
    }

    // Check if slug already exists
    if (createCourseDto.slug) {
      const existingSlug = await this.courseRepository.isSlugExists(
        createCourseDto.slug,
      );
      if (existingSlug) {
        throw new BadRequestException('Course slug already exists');
      }
    }

    // Add authorId to the DTO
    const courseData = {
      ...createCourseDto,
      authorId,
    };

    const course = await this.courseRepository.createCourse(courseData);

    // Send notification to all users if course is published (public)
    if (createCourseDto.status === CourseStatus.PUBLISHED) {
      // Get image URL from media relation
      const imageUrl = course.image
        ? `${course.image.cdnBaseUrl}/${course.image.storageKey}`
        : undefined;

      this.notificationService.notifyNewCourse({
        courseId: course.id,
        title: course.title || 'New Course',
        slug: course.slug || '',
        description: course.description || undefined,
        image: imageUrl,
        authorName: (author as any).username || 'Instructor',
        price: course.price ? Number(course.price) : 0,
        isFree: course.isFree || false,
      });
    }

    return course;
  }

  async updateCourse(id: string, updateCourseDto: UpdateCourseDto) {
    // Check if course exists
    const existingCourse = await this.courseRepository.findOneOrNull({ id });
    if (!existingCourse) {
      throw new NotFoundException('Course not found');
    }

    // Check if course is being published (status changed from DRAFT to PUBLISHED)
    const isBeingPublished =
      existingCourse.status !== CourseStatus.PUBLISHED &&
      updateCourseDto.status === CourseStatus.PUBLISHED;

    // Validate author if provided
    let author: any = null;
    if (updateCourseDto.authorId) {
      author = await this.userRepository.findOneOrNull({
        id: updateCourseDto.authorId,
      });
      if (!author) {
        throw new BadRequestException('Author not found');
      }
    }

    // Validate category if provided
    if (updateCourseDto.categoryId) {
      const category = await this.categoryRepository.findOneOrNull({
        id: updateCourseDto.categoryId,
      });
      if (!category) {
        throw new BadRequestException('Category not found');
      }
    }

    // Check if slug already exists (excluding current course)
    if (updateCourseDto.slug) {
      const existingSlug = await this.courseRepository.isSlugExists(
        updateCourseDto.slug,
        id,
      );
      if (existingSlug) {
        throw new BadRequestException('Course slug already exists');
      }
    }

    const updatedCourse = await this.courseRepository.updateCourse(
      id,
      updateCourseDto,
    );

    // Send notification to all users if course is being published
    if (isBeingPublished) {
      // Fetch author info if not already fetched
      if (!author && existingCourse.authorId) {
        author = await this.userRepository.findOneOrNull({
          id: existingCourse.authorId,
        });
      }

      // Get image URL from media relation
      const imageUrl = updatedCourse.image
        ? `${updatedCourse.image.cdnBaseUrl}/${updatedCourse.image.storageKey}`
        : (existingCourse as any).image
          ? `${(existingCourse as any).image.cdnBaseUrl}/${(existingCourse as any).image.storageKey}`
          : undefined;

      this.notificationService.notifyNewCourse({
        courseId: updatedCourse.id,
        title: updatedCourse.title || existingCourse.title || 'New Course',
        slug: updatedCourse.slug || existingCourse.slug || '',
        description:
          updatedCourse.description || existingCourse.description || undefined,
        image: imageUrl,
        authorName: author?.username || 'Instructor',
        price: updatedCourse.price ? Number(updatedCourse.price) : 0,
        isFree: updatedCourse.isFree || false,
      });
    }

    return updatedCourse;
  }

  async deleteCourse(id: string) {
    // Check if course exists
    const existingCourse = await this.courseRepository.findOneOrNull({ id });
    if (!existingCourse) {
      throw new NotFoundException('Course not found');
    }

    return this.courseRepository.delete({ id });
  }

  async incrementCourseViews(id: string) {
    const course = await this.courseRepository.findOneOrNull({ id });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return this.courseRepository.incrementViews(id);
  }

  async incrementCourseSold(id: string) {
    const course = await this.courseRepository.findOneOrNull({ id });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return this.courseRepository.incrementSold(id);
  }

  async bulkDeleteCourses(ids: string[]) {
    if (!ids || ids.length === 0) {
      throw new BadRequestException('No IDs provided for deletion');
    }

    const result = await this.courseRepository.bulkDelete(ids);

    if (result.count === 0) {
      throw new NotFoundException('No courses found with the provided IDs');
    }

    return {
      deletedCount: result.count,
      message: `Successfully deleted ${result.count} ${result.count === 1 ? 'course' : 'courses'}`,
    };
  }

  /**
   * Enroll a user in a free course
   */
  async enrollFreeCourse(courseId: string, userId: string) {
    // Check if course exists
    const course = await this.courseRepository.findOneOrNull({ id: courseId });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check if course is free
    if (!course.isFree) {
      throw new BadRequestException(
        'This course is not free. Please purchase it.',
      );
    }

    // Check if course is published
    if (course.status !== 'PUBLISHED') {
      throw new BadRequestException(
        'This course is not available for enrollment',
      );
    }

    // Check if user is already enrolled
    const existingEnrollment = await this.prismaService.orderItem.findFirst({
      where: {
        courseId,
        order: {
          userId,
          status: OrderStatus.COMPLETED,
        },
      },
    });

    if (existingEnrollment) {
      throw new BadRequestException('You are already enrolled in this course');
    }

    // Generate unique order code
    const orderCode = `FREE-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Create a completed order for the free course
    const order = await this.prismaService.order.create({
      data: {
        code: orderCode,
        orderType: 'COURSE',
        subTotal: 0,
        totalDiscount: 0,
        totalAmount: 0,
        paymentMethod: 'BANK_TRANSFER', // Default for free courses
        status: OrderStatus.COMPLETED,
        userId,
        items: {
          create: {
            title: course.title || 'Untitled Course',
            price: 0,
            oldPrice: course.oldPrice || 0,
            thumbnail: null,
            courseId,
          },
        },
      },
      include: {
        items: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
                image: true,
              },
            },
          },
        },
      },
    });

    // Increment course sold count
    await this.courseRepository.incrementSold(courseId);

    return {
      message: 'Successfully enrolled in free course',
      order: {
        id: order.id,
        code: order.code,
        status: order.status,
        course: order.items[0]?.course,
      },
    };
  }

  async getRelatedCourses(courseId: string) {
    const course = await this.prismaService.course.findUnique({
      where: { id: courseId },
      select: { categoryId: true },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const related = await this.prismaService.course.findMany({
      where: {
        categoryId: course.categoryId,
        status: 'PUBLISHED',
        id: { not: courseId },
      },
      take: 4,
      include: {
        image: true,
        previewImages: true,
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            chapters: true,
            lessons: true,
          },
        },
      },
    });

    return related.map((c: any) => ({
      ...c,
      chaptersCount: c._count?.chapters || 0,
      lessonsCount: c._count?.lessons || 0,
      totalLessons: c._count?.lessons || 0,
      _count: undefined,
    }));
  }
}
