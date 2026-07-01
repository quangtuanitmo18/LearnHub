import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/shared/services/base.service';
import { PrismaService } from 'src/shared/services/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { PaginationQueryDto } from 'src/shared/dto/pagination.dto';
import {
  OrderStatus,
  OrderType,
  type OrderStatusType,
  type OrderTypeValue,
} from 'src/shared/constants/order.constant';
import {
  MembershipDuration,
  type MembershipPlanType,
} from 'src/shared/constants/user.constant';

@Injectable()
export class OrderRepository extends BaseService<
  Prisma.OrderGetPayload<{ include: { items: true; user: true } }>,
  any,
  any,
  Prisma.OrderWhereUniqueInput
> {
  protected modelName = Prisma.ModelName.Order;

  constructor(prismaService: PrismaService) {
    super(prismaService, {
      defaultSortBy: 'createdAt',
      defaultSortOrder: 'desc',
      searchFields: ['code', 'couponCode'],
      selectFields: {
        id: true,
        code: true,
        orderType: true,
        couponCode: true,
        subTotal: true,
        totalDiscount: true,
        totalAmount: true,
        paymentMethod: true,
        status: true,
        membershipPlan: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
        items: {
          select: {
            id: true,
            title: true,
            price: true,
            oldPrice: true,
            thumbnail: true,
            courseId: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Find order by code
   */
  async findByCode(code: string) {
    return this.findFirst({ code });
  }

  /**
   * Find orders by user
   */
  async findByUser(userId: string, paginationQuery?: PaginationQueryDto) {
    return this.findAll(paginationQuery, { userId });
  }

  /**
   * Find orders by status
   */
  async findByStatus(
    status: OrderStatusType,
    paginationQuery?: PaginationQueryDto,
  ) {
    return this.findAll(paginationQuery, { status });
  }

  /**
   * Find user orders by status
   */
  async findUserOrdersByStatus(
    userId: string,
    status: OrderStatusType,
    paginationQuery?: PaginationQueryDto,
  ) {
    return this.findAll(paginationQuery, { userId, status });
  }

  /**
   * Generate unique order code
   */
  async generateOrderCode(): Promise<string> {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    const code = `ORD${timestamp}${random}`;

    // Check if code exists (very unlikely)
    const existing = await this.findByCode(code);
    if (existing) {
      return this.generateOrderCode(); // Recursive call if collision
    }

    return code;
  }

  /**
   * Create order with items
   */
  async createOrderWithItems(orderData: {
    userId: string;
    code: string;
    couponCode?: string;
    subTotal: number;
    totalDiscount: number;
    totalAmount: number;
    paymentMethod: string;
    items: Array<{
      courseId: string;
      title: string;
      price: number;
      oldPrice?: number;
      thumbnail?: string;
    }>;
  }) {
    return await this.prismaService.order.create({
      data: {
        userId: orderData.userId,
        code: orderData.code,
        couponCode: orderData.couponCode,
        subTotal: orderData.subTotal,
        totalDiscount: orderData.totalDiscount,
        totalAmount: orderData.totalAmount,
        paymentMethod: orderData.paymentMethod as any,
        status: 'PENDING',
        items: {
          create: orderData.items.map((item) => ({
            courseId: item.courseId,
            title: item.title,
            price: item.price,
            oldPrice: item.oldPrice,
            thumbnail: item.thumbnail,
          })),
        },
      },
      include: {
        items: {
          include: {
            course: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Update order status
   */
  async updateStatus(
    orderId: string,
    status: OrderStatusType,
    expectedStatus?: OrderStatusType,
  ) {
    if (expectedStatus) {
      const result = await this.prismaService.order.updateMany({
        where: { id: orderId, status: expectedStatus },
        data: { status },
      });
      if (result.count === 0) {
        return null;
      }
    }
    return await this.prismaService.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        items: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Get order with full details
   */
  async getOrderWithDetails(orderId: string) {
    return await this.prismaService.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
                image: true,
                price: true,
                oldPrice: true,
                status: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Check if user has purchased a specific course
   */
  async hasUserPurchasedCourse(
    userId: string,
    courseId: string,
  ): Promise<boolean> {
    const order = await this.prismaService.order.findFirst({
      where: {
        userId,
        status: OrderStatus.COMPLETED,
        orderType: OrderType.COURSE,
        items: {
          some: {
            courseId,
          },
        },
      },
    });

    return !!order;
  }

  /**
   * Check if user has access to a course (purchased OR active membership)
   */
  async hasUserCourseAccess(
    userId: string,
    courseId: string,
  ): Promise<{
    hasAccess: boolean;
    accessType: 'purchased' | 'membership' | 'none';
  }> {
    // Check if user has purchased the course
    const hasPurchased = await this.hasUserPurchasedCourse(userId, courseId);
    if (hasPurchased) {
      return { hasAccess: true, accessType: 'purchased' };
    }

    // Check if user has active membership
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        isMembership: true,
        planEndDate: true,
      },
    });

    if (
      user?.isMembership &&
      user?.planEndDate &&
      new Date(user.planEndDate) > new Date()
    ) {
      return { hasAccess: true, accessType: 'membership' };
    }

    return { hasAccess: false, accessType: 'none' };
  }

  /**
   * Complete an order atomically (PENDING -> COMPLETED).
   *
   * Single source of truth for order completion — used by both webhook
   * handlers (Stripe / SePay) and admin manual status updates.
   *
   * Inside a single Prisma transaction it:
   *  1. Idempotent state transition (PENDING -> COMPLETED, returns null if already done)
   *  2. Activates membership if orderType === MEMBERSHIP
   *  3. Increments `sold` on every course if orderType === COURSE
   *  4. Increments `usedCount` on the coupon if one was applied
   *
   * @returns The completed order (with items + user), or `null` if the order
   *          was already completed by another process (idempotent).
   */
  async completeOrder(orderId: string) {
    return this.prismaService.$transaction(async (tx) => {
      // 1. Idempotent state transition: only transition PENDING -> COMPLETED once.
      const transition = await tx.order.updateMany({
        where: {
          id: orderId,
          status: OrderStatus.PENDING,
        },
        data: {
          status: OrderStatus.COMPLETED,
          updatedAt: new Date(),
        },
      });

      if (transition.count === 0) {
        return null;
      }

      const updatedOrder = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          items: true,
          user: true,
        },
      });

      if (!updatedOrder) {
        throw new Error('Order not found during completion');
      }

      // 2. If this is a membership order, activate the membership
      if ((updatedOrder as any).orderType === OrderType.MEMBERSHIP) {
        const membershipPlan = (updatedOrder as any).membershipPlan;

        if (membershipPlan && membershipPlan !== 'NONE') {
          const planDuration =
            MembershipDuration[
              membershipPlan as keyof typeof MembershipDuration
            ];
          const planStartDate = new Date();
          const planEndDate = new Date();
          planEndDate.setMonth(planEndDate.getMonth() + planDuration);

          await tx.user.update({
            where: { id: updatedOrder.userId },
            data: {
              plan: membershipPlan,
              planStartDate,
              planEndDate,
              isMembership: true,
            },
          });
        }
      }

      // 3. If this is a course order, increment sold count for each course
      if (
        (updatedOrder as any).orderType === OrderType.COURSE ||
        !(updatedOrder as any).orderType
      ) {
        for (const item of updatedOrder.items) {
          await tx.course.update({
            where: { id: item.courseId },
            data: {
              sold: {
                increment: 1,
              },
            },
          });
        }

        // 4. Increment coupon usage if one was applied
        if (updatedOrder.couponCode) {
          await tx.coupon.updateMany({
            where: { code: updatedOrder.couponCode },
            data: {
              usedCount: {
                increment: 1,
              },
            },
          });
        }
      }

      return updatedOrder;
    });
  }

  /**
   * Create membership order
   */
  async createMembershipOrder(orderData: {
    userId: string;
    code: string;
    subTotal: number;
    totalDiscount: number;
    totalAmount: number;
    paymentMethod: string;
    membershipPlan: MembershipPlanType;
  }) {
    return await this.prismaService.order.create({
      data: {
        userId: orderData.userId,
        code: orderData.code,
        orderType: OrderType.MEMBERSHIP as any,
        subTotal: orderData.subTotal,
        totalDiscount: orderData.totalDiscount,
        totalAmount: orderData.totalAmount,
        paymentMethod: orderData.paymentMethod as any,
        membershipPlan: orderData.membershipPlan as any,
        status: 'PENDING',
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Find pending membership order by user
   */
  async findPendingMembershipOrder(
    userId: string,
    membershipPlan?: MembershipPlanType,
  ) {
    return this.prismaService.order.findFirst({
      where: {
        userId,
        orderType: OrderType.MEMBERSHIP as any,
        ...(membershipPlan ? { membershipPlan: membershipPlan as any } : {}),
        status: OrderStatus.PENDING,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });
  }
}
