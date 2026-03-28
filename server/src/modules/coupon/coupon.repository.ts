import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { CouponStatus } from 'src/shared/constants/coupon.constant';
import { PaginatedResponseDto } from 'src/shared/dto/pagination.dto';
import { BaseService } from 'src/shared/services/base.service';
import { PrismaService } from 'src/shared/services/prisma.service';
import {
  CouponQueryDto,
  CreateCouponDto,
  UpdateCouponDto,
} from './dto/coupon.dto';

@Injectable()
export class CouponRepository extends BaseService<
  Prisma.CouponGetPayload<object>,
  CreateCouponDto,
  UpdateCouponDto,
  Prisma.CouponWhereUniqueInput
> {
  protected modelName = Prisma.ModelName.Coupon;

  constructor(prismaService: PrismaService) {
    super(prismaService, {
      defaultSortBy: 'createdAt',
      defaultSortOrder: 'desc',
      searchFields: ['title', 'code'],
      selectFields: {
        id: true,
        title: true,
        code: true,
        discountType: true,
        discountValue: true,
        minPurchaseAmount: true,
        maxUses: true,
        usedCount: true,
        startDate: true,
        endDate: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        courses: {
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
   * Find all coupons with filtering by discountType and status
   */
  async findAllCoupons(
    couponQuery?: CouponQueryDto,
  ): Promise<PaginatedResponseDto<any>> {
    // Build additional where conditions for discountType and status filters
    const additionalWhere: any = {};

    if (couponQuery?.discountType) {
      if (Array.isArray(couponQuery.discountType)) {
        additionalWhere.discountType = { in: couponQuery.discountType };
      } else {
        additionalWhere.discountType = couponQuery.discountType;
      }
    }

    if (couponQuery?.status) {
      const statusFilters = Array.isArray(couponQuery.status)
        ? couponQuery.status
        : [couponQuery.status];

      const now = new Date();
      const statusConditions: any[] = [];

      for (const status of statusFilters) {
        switch (status) {
          case CouponStatus.ACTIVE:
            statusConditions.push({
              AND: [
                { isActive: true },
                {
                  OR: [{ startDate: null }, { startDate: { lte: now } }],
                },
                {
                  OR: [{ endDate: null }, { endDate: { gte: now } }],
                },
              ],
            });
            break;

          case CouponStatus.INACTIVE:
            statusConditions.push({ isActive: false });
            break;

          case CouponStatus.EXPIRED:
            statusConditions.push({
              AND: [
                { isActive: true },
                { endDate: { not: null } },
                { endDate: { lt: now } },
              ],
            });
            break;
        }
      }

      if (statusConditions.length > 0) {
        additionalWhere.OR = statusConditions;
      }
    }

    // Use the base findAll method with additional filters
    return this.findAll(couponQuery, additionalWhere);
  }

  /**
   * Find valid coupons (active, within date range, not expired)
   */
  findValid() {
    const now = new Date();
    return this.model.findMany({
      where: {
        isActive: true,
        AND: [
          {
            OR: [{ startDate: null }, { startDate: { lte: now } }],
          },
          {
            OR: [{ endDate: null }, { endDate: { gte: now } }],
          },
        ],
      },
      select: this.options.selectFields,
    });
  }

  /**
   * Check if coupon code exists
   */
  async isCodeExists(code: string, excludeId?: string): Promise<boolean> {
    const coupon = await this.model.findFirst({
      where: {
        code,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });

    return !!coupon;
  }

  /**
   * Increment coupon usage count
   */
  async incrementUsage(id: string): Promise<void> {
    await this.model.update({
      where: { id },
      data: {
        usedCount: {
          increment: 1,
        },
      },
    });
  }

  /**
   * Check if coupon can be used
   */
  async canBeUsed(id: string, purchaseAmount?: number): Promise<boolean> {
    const coupon = await this.model.findUnique({
      where: { id },
    });

    if (!coupon) return false;
    if (!coupon.isActive) return false;

    // Check date range
    const now = new Date();

    if (coupon.startDate && coupon.startDate > now) return false;
    if (coupon.endDate && coupon.endDate < now) return false;

    // Check max uses
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return false;

    // Check minimum purchase amount
    if (
      coupon.minPurchaseAmount &&
      purchaseAmount &&
      purchaseAmount < Number(coupon.minPurchaseAmount)
    ) {
      return false;
    }

    return true;
  }

  /**
   * Bulk delete coupons by IDs
   */
  async bulkDelete(ids: string[]) {
    return this.prismaService.coupon.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }

  /**
   * Find coupon by code
   */
  async findByCode(code: string) {
    return this.findOneOrNull({ code });
  }
}
