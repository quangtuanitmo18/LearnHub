import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CouponDiscountType } from 'src/shared/constants/coupon.constant';
import { PrismaService } from 'src/shared/services/prisma.service';
import { CourseRepository } from '../course/course.repository';
import { CouponRepository } from './coupon.repository';
import {
  CouponQueryDto,
  CreateCouponDto,
  UpdateCouponDto,
  ValidateCouponDto,
} from './dto/coupon.dto';

@Injectable()
export class CouponService {
  constructor(
    private readonly couponRepository: CouponRepository,
    private readonly courseRepository: CourseRepository,
    private readonly prismaService: PrismaService,
  ) {}

  async getAllCoupons(couponQuery?: CouponQueryDto) {
    return await this.couponRepository.findAllCoupons(couponQuery);
  }

  getValidCoupons() {
    return this.couponRepository.findValid();
  }

  async getCouponById(id: string) {
    const coupon = await this.couponRepository.findOneOrNull({ id });
    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }
    return coupon;
  }

  async createCoupon(createCouponDto: CreateCouponDto) {
    // Check if code already exists
    const codeExists = await this.couponRepository.isCodeExists(
      createCouponDto.code,
    );
    if (codeExists) {
      throw new BadRequestException('Coupon code already exists');
    }

    // Validate date range

    if (createCouponDto.startDate && createCouponDto.endDate) {
      const startDate = new Date(createCouponDto.startDate);
      const endDate = new Date(createCouponDto.endDate);
      if (startDate >= endDate) {
        throw new BadRequestException('Start date must be before end date');
      }
    }

    // Validate discount value based on type
    if (createCouponDto.discountType === CouponDiscountType.PERCENT) {
      if (createCouponDto.discountValue > 100) {
        throw new BadRequestException('Percentage discount cannot exceed 100%');
      }
    }

    // Create coupon with course relationships in transaction
    const prisma = this.prismaService;

    return prisma.$transaction(async (tx) => {
      // Create coupon
      const coupon = await tx.coupon.create({
        data: {
          title: createCouponDto.title,
          code: createCouponDto.code,
          discountType: createCouponDto.discountType,
          discountValue: createCouponDto.discountValue,
          minPurchaseAmount: createCouponDto.minPurchaseAmount,
          maxUses: createCouponDto.maxUses,
          startDate: createCouponDto.startDate
            ? new Date(createCouponDto.startDate)
            : null,
          endDate: createCouponDto.endDate
            ? new Date(createCouponDto.endDate)
            : null,
          isActive: createCouponDto.isActive ?? true,
        },
      });

      // Link courses if provided (using implicit many-to-many)
      if (createCouponDto.courseIds && createCouponDto.courseIds.length > 0) {
        // Validate all courses exist
        for (const courseId of createCouponDto.courseIds) {
          const course = await tx.course.findUnique({
            where: { id: courseId },
          });
          if (!course) {
            throw new BadRequestException(
              `Course with ID ${courseId} not found`,
            );
          }
        }

        // Connect courses using Prisma's implicit many-to-many
        await tx.coupon.update({
          where: { id: coupon.id },
          data: {
            courses: {
              connect: createCouponDto.courseIds.map((courseId) => ({
                id: courseId,
              })),
            },
          },
        });
      }

      // Return coupon with courses
      return tx.coupon.findUnique({
        where: { id: coupon.id },
        include: {
          courses: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
      });
    });
  }

  async updateCoupon(id: string, updateCouponDto: UpdateCouponDto) {
    // Check if coupon exists
    const existingCoupon = await this.couponRepository.findOneOrNull({ id });
    if (!existingCoupon) {
      throw new NotFoundException('Coupon not found');
    }

    // Check if code already exists (excluding current coupon)
    if (updateCouponDto.code) {
      const codeExists = await this.couponRepository.isCodeExists(
        updateCouponDto.code,
        id,
      );
      if (codeExists) {
        throw new BadRequestException('Coupon code already exists');
      }
    }

    // Validate date range
    const startDate = updateCouponDto.startDate
      ? new Date(updateCouponDto.startDate)
      : existingCoupon.startDate
        ? new Date(existingCoupon.startDate)
        : null;
    const endDate = updateCouponDto.endDate
      ? new Date(updateCouponDto.endDate)
      : existingCoupon.endDate
        ? new Date(existingCoupon.endDate)
        : null;

    if (startDate && endDate && startDate >= endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    // Validate discount value based on type
    const discountType =
      updateCouponDto.discountType || existingCoupon.discountType;
    const discountValue =
      updateCouponDto.discountValue !== undefined
        ? updateCouponDto.discountValue
        : Number(existingCoupon.discountValue);

    if (discountType === CouponDiscountType.PERCENT && discountValue > 100) {
      throw new BadRequestException('Percentage discount cannot exceed 100%');
    }

    // Update coupon and course relationships in transaction
    const prisma = this.prismaService;

    return prisma.$transaction(async (tx) => {
      // Update coupon fields (excluding courseIds)
      const { courseIds, ...couponData } = updateCouponDto;
      const updateData: any = { ...couponData };

      if (updateData.startDate) {
        updateData.startDate = new Date(updateData.startDate);
      }
      if (updateData.endDate) {
        updateData.endDate = new Date(updateData.endDate);
      }

      await tx.coupon.update({
        where: { id },
        data: updateData,
      });

      // Update course relationships if provided (using implicit many-to-many)
      if (courseIds !== undefined) {
        // Get current coupon to check existing courses
        const currentCoupon = await tx.coupon.findUnique({
          where: { id },
          select: { courses: { select: { id: true } } },
        });

        // Disconnect all existing courses
        if (currentCoupon && currentCoupon.courses.length > 0) {
          await tx.coupon.update({
            where: { id },
            data: {
              courses: {
                disconnect: currentCoupon.courses.map((course) => ({
                  id: course.id,
                })),
              },
            },
          });
        }

        // Connect new courses
        if (courseIds.length > 0) {
          // Validate all courses exist
          for (const courseId of courseIds) {
            const course = await tx.course.findUnique({
              where: { id: courseId },
            });
            if (!course) {
              throw new BadRequestException(
                `Course with ID ${courseId} not found`,
              );
            }
          }

          await tx.coupon.update({
            where: { id },
            data: {
              courses: {
                connect: courseIds.map((courseId) => ({ id: courseId })),
              },
            },
          });
        }
      }

      // Return updated coupon with courses
      return tx.coupon.findUnique({
        where: { id },
        include: {
          courses: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
      });
    });
  }

  async deleteCoupon(id: string) {
    // Check if coupon exists
    const existingCoupon = await this.couponRepository.findOneOrNull({ id });
    if (!existingCoupon) {
      throw new NotFoundException('Coupon not found');
    }

    return this.couponRepository.delete({ id });
  }

  async bulkDeleteCoupons(ids: string[]) {
    if (!ids || ids.length === 0) {
      throw new BadRequestException('No IDs provided for deletion');
    }

    const result = await this.couponRepository.bulkDelete(ids);

    if (result.count === 0) {
      throw new NotFoundException('No coupons found with the provided IDs');
    }

    return {
      deletedCount: result.count,
      message: `Successfully deleted ${result.count} ${result.count === 1 ? 'coupon' : 'coupons'}`,
    };
  }

  async validateCoupon(validateCouponDto: ValidateCouponDto) {
    console.log('Validating coupon:', validateCouponDto);
    // Find coupon with associated courses
    const coupon = await this.prismaService.coupon.findFirst({
      where: { code: validateCouponDto.code },
      include: {
        courses: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    // Fetch the courses from the database to get their prices
    const courses = await this.prismaService.course.findMany({
      where: {
        id: { in: validateCouponDto.courseIds },
      },
      select: {
        id: true,
        title: true,
        price: true,
        isFree: true,
      },
    });

    // Validate all courses exist
    if (courses.length !== validateCouponDto.courseIds.length) {
      const foundIds = courses.map((c) => c.id);
      const missingIds = validateCouponDto.courseIds.filter(
        (id) => !foundIds.includes(id),
      );
      throw new BadRequestException(
        `Courses not found: ${missingIds.join(', ')}`,
      );
    }

    // Calculate total purchase amount from course prices
    const purchaseAmount = courses.reduce(
      (sum, course) => sum + (course.isFree ? 0 : Number(course.price || 0)),
      0,
    );

    // Validate if coupon is linked to specific courses
    if (coupon.courses && coupon.courses.length > 0) {
      // Get the course IDs that this coupon is valid for
      const validCourseIds = coupon.courses.map((course) => course.id);

      // Check if all provided courseIds are valid for this coupon
      const invalidCourseIds = validateCouponDto.courseIds.filter(
        (courseId) => !validCourseIds.includes(courseId),
      );

      if (invalidCourseIds.length > 0) {
        // Get valid course titles for better error message
        const validCourseTitles = coupon.courses.map((c) => c.title).join(', ');
        throw new BadRequestException(
          `This coupon is only valid for the following courses: ${validCourseTitles}`,
        );
      }
    }

    // Check if coupon can be used with the calculated purchase amount
    const canBeUsed = await this.couponRepository.canBeUsed(
      coupon.id,
      purchaseAmount,
    );

    if (!canBeUsed) {
      throw new BadRequestException('Coupon is not valid or cannot be used');
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.discountType === CouponDiscountType.PERCENT) {
      discountAmount = (purchaseAmount * Number(coupon.discountValue)) / 100;
    } else {
      discountAmount = Math.min(Number(coupon.discountValue), purchaseAmount);
    }

    return {
      valid: true,
      coupon,
      purchaseAmount,
      discountAmount,
      finalAmount: purchaseAmount - discountAmount,
    };
  }

  async applyCoupon(code: string, courseIds: string[]) {
    const validation = await this.validateCoupon({
      code,
      courseIds,
    });

    return validation;
  }
}
