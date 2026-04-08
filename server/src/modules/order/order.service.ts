import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaginationQueryDto } from 'src/shared/dto/pagination.dto';
import { CartRepository } from '../cart/cart.repository';
import { CouponRepository } from '../coupon/coupon.repository';
import { CouponService } from '../coupon/coupon.service';
import { CourseRepository } from '../course/course.repository';
import { EmailQueueService } from '../email/services';
import { UserRepository } from '../user/user.repository';
import {
  CheckoutDto,
  MembershipCheckoutDto,
  OrderQueryDto,
  UpdateOrderStatusDto,
} from './dto/order.dto';
import { OrderRepository } from './order.repository';
import { OrderQueueService } from './services/order-queue.service';

import { CourseStatus } from 'src/generated/prisma/enums';
import {
  OrderStatus,
  OrderStatusType,
  OrderType,
} from 'src/shared/constants/order.constant';
import {
  MembershipDuration,
  MembershipPlan,
  MembershipPrice,
} from 'src/shared/constants/user.constant';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly cartRepository: CartRepository,
    private readonly couponRepository: CouponRepository,
    private readonly couponService: CouponService,
    private readonly courseRepository: CourseRepository,
    private readonly userRepository: UserRepository,
    private readonly orderQueueService: OrderQueueService,
    private readonly emailQueueService: EmailQueueService,
  ) {}

  /**
   * Checkout - Create order from cart
   */
  async checkout(userId: string, checkoutDto: CheckoutDto) {
    const { paymentMethod, couponCode } = checkoutDto;

    // Remove duplicates to prevent double-charging for the same course
    const courseIds = [...new Set(checkoutDto.courseIds)];

    let subTotal = 0;
    const orderItems: Array<{
      courseId: string;
      title: string;
      price: number;
      oldPrice?: number;
      thumbnail?: string;
    }> = [];
    let cartItemIdsToRemove: string[] = [];

    // Validate and fetch courses
    for (const courseId of courseIds) {
      // Check if user already purchased the course
      const hasPurchased = await this.orderRepository.hasUserPurchasedCourse(
        userId,
        courseId,
      );

      if (hasPurchased) {
        throw new BadRequestException(
          `You have already purchased the course with ID ${courseId}`,
        );
      }

      const course = await this.courseRepository.findOneOrNull({
        id: courseId,
      });

      if (!course) {
        throw new NotFoundException(`Course with ID ${courseId} not found`);
      }

      if (course.status !== CourseStatus.PUBLISHED) {
        throw new BadRequestException(
          `Course "${course.title}" is not available for purchase`,
        );
      }

      const price = Number(course.price);
      subTotal += price;

      // Get image URL from media relation
      const thumbnail = (course as any).image
        ? `${(course as any).image.cdnBaseUrl}/${(course as any).image.storageKey}`
        : undefined;

      orderItems.push({
        courseId: course.id,
        title: course.title || 'Untitled Course',
        price,
        oldPrice: course.oldPrice ? Number(course.oldPrice) : undefined,
        thumbnail,
      });
    }

    // Get cart to find items to remove
    const cart = await this.cartRepository.getOrCreateCart(userId);
    const cartWithItems = await this.cartRepository.getCartWithItems(cart.id);

    if (cartWithItems) {
      // Find cart items that match the courseIds
      cartItemIdsToRemove = cartWithItems.items
        .filter((item) => courseIds.includes(item.courseId))
        .map((item) => item.id);
    }

    // Apply coupon if provided
    let totalDiscount = 0;
    if (couponCode) {
      const validation = await this.couponService.validateCoupon({
        code: couponCode,
        courseIds, // Pass courseIds for coupon validation
      });

      totalDiscount = validation.discountAmount;
    }

    // Calculate total
    const totalAmount = Math.max(0, subTotal - totalDiscount);

    // Generate order code
    const code = await this.orderRepository.generateOrderCode();

    // Create order
    const order = await this.orderRepository.createOrderWithItems({
      userId,
      code,
      couponCode,
      subTotal,
      totalDiscount,
      totalAmount,
      paymentMethod,
      items: orderItems,
    });

    // Schedule auto-cancellation after 24 hours if unpaid
    await this.orderQueueService.scheduleCancelOrder(order.id, order.code);

    // Increment coupon usage if used
    if (couponCode) {
      const coupon = await this.couponRepository.findByCode(couponCode);
      if (coupon) {
        await this.couponRepository.incrementUsage(coupon.id);
      }
    }

    // Remove checked out items from cart
    if (cartItemIdsToRemove.length > 0) {
      for (const itemId of cartItemIdsToRemove) {
        await this.cartRepository.removeItem(itemId);
      }
    }

    // Queue order confirmation email
    await this.queueOrderConfirmationEmail(order, orderItems, paymentMethod);

    return order;
  }

  /**
   * Get all orders (admin)
   */
  async getAllOrders(queryDto: OrderQueryDto) {
    const additionalWhere: any = {};

    if (queryDto.status) {
      if (Array.isArray(queryDto.status)) {
        additionalWhere.status = { in: queryDto.status };
      } else {
        additionalWhere.status = queryDto.status;
      }
    }

    if (queryDto.paymentMethod) {
      if (Array.isArray(queryDto.paymentMethod)) {
        additionalWhere.paymentMethod = { in: queryDto.paymentMethod };
      } else {
        additionalWhere.paymentMethod = queryDto.paymentMethod;
      }
    }

    return this.orderRepository.findAll(queryDto, additionalWhere);
  }

  /**
   * Get user's orders
   */
  async getUserOrders(
    userId: string,
    paginationQuery?: PaginationQueryDto,
    status?: OrderStatusType,
  ) {
    if (status) {
      return this.orderRepository.findUserOrdersByStatus(
        userId,
        status,
        paginationQuery,
      );
    }
    return this.orderRepository.findByUser(userId, paginationQuery);
  }

  /**
   * Get order by ID
   */
  async getOrderById(orderId: string, userId?: string) {
    const order = await this.orderRepository.getOrderWithDetails(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // If userId provided, verify ownership
    if (userId && order.userId !== userId) {
      throw new ForbiddenException('You do not have access to this order');
    }

    return order;
  }

  /**
   * Get order by code
   */
  async getOrderByCode(code: string, userId?: string) {
    const order = await this.orderRepository.findByCode(code);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // If userId provided, verify ownership
    if (userId && order.userId !== userId) {
      throw new ForbiddenException('You do not have access to this order');
    }

    return this.orderRepository.getOrderWithDetails(order.id);
  }

  /**
   * Update order status
   */
  async updateOrderStatus(
    orderId: string,
    updateStatusDto: UpdateOrderStatusDto,
  ) {
    const order = await this.orderRepository.findOneOrNull({ id: orderId });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Business logic for status transitions
    // if (order.status === OrderStatus.COMPLETED) {
    //   throw new BadRequestException('Cannot modify a completed order');
    // }

    // if (order.status === OrderStatus.CANCELLED) {
    //   throw new BadRequestException('Cannot modify a cancelled order');
    // }

    // If completing order
    if (
      updateStatusDto.status === OrderStatus.COMPLETED &&
      order.status === OrderStatus.PENDING
    ) {
      const orderWithItems =
        await this.orderRepository.getOrderWithDetails(orderId);

      if (orderWithItems) {
        // Check if this is a membership order
        if ((orderWithItems as any).orderType === OrderType.MEMBERSHIP) {
          // Activate membership
          const membershipPlan = (orderWithItems as any).membershipPlan as
            | keyof typeof MembershipDuration
            | undefined;
          if (membershipPlan && membershipPlan !== MembershipPlan.NONE) {
            const planDuration = MembershipDuration[membershipPlan];
            const planStartDate = new Date();
            const planEndDate = new Date();
            planEndDate.setMonth(planEndDate.getMonth() + planDuration);

            await this.userRepository.updateMembership(orderWithItems.userId, {
              plan: membershipPlan,
              planStartDate,
              planEndDate,
              isMembership: true,
            });
          }
        } else {
          // For course orders, increment sold count
          for (const item of orderWithItems.items) {
            await this.courseRepository.incrementSold(item.courseId);
          }
        }
      }
    }

    if (
      updateStatusDto.status === OrderStatus.COMPLETED ||
      updateStatusDto.status === OrderStatus.CANCELLED
    ) {
      await this.orderQueueService.cancelScheduledCancellation(orderId);
    }

    return this.orderRepository.updateStatus(orderId, updateStatusDto.status);
  }

  /**
   * Delete order
   */
  async deleteOrder(orderId: string, userId: string) {
    const order = await this.orderRepository.findOneOrNull({ id: orderId });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Get user with roles to check if admin or superadmin
    const user = await this.userRepository.findByIdWithRoles(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user is admin or super admin
    const isAdmin = user.roles.some(
      (role) => role.name === 'Admin' || role.name === 'Super Admin',
    );

    // Only allow order owner, admin, or superadmin to delete
    if (order.userId !== userId && !isAdmin) {
      throw new ForbiddenException(
        'You do not have access to delete this order',
      );
    }

    if (order.status === 'COMPLETED') {
      throw new BadRequestException('Cannot delete a completed order');
    }

    return this.orderRepository.delete({ id: orderId });
  }

  // ==================== MEMBERSHIP CHECKOUT ====================

  /**
   * Checkout membership subscription - creates an order for payment
   */
  async checkoutMembership(
    userId: string,
    membershipCheckoutDto: MembershipCheckoutDto,
  ) {
    const { plan, paymentMethod } = membershipCheckoutDto;

    // Validate plan
    if (plan === MembershipPlan.NONE) {
      throw new BadRequestException('Cannot checkout with NONE plan');
    }

    // Check if user already has an active membership
    const user = await this.userRepository.getMembershipInfo(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (
      user.isMembership &&
      user.planEndDate &&
      new Date(user.planEndDate) > new Date()
    ) {
      throw new BadRequestException(
        'You already have an active membership. Please wait until it expires or contact support to upgrade.',
      );
    }

    // Check if an order exists for membership and is still pending
    const existingPendingOrder =
      await this.orderRepository.findPendingMembershipOrder(userId);

    if (existingPendingOrder) {
      throw new BadRequestException(
        `You already have a pending membership order (${existingPendingOrder.code}) for the ${(existingPendingOrder as any).membershipPlan} plan. Please complete the payment or cancel the existing order first.`,
      );
    }

    // Get plan price and duration
    const planPrice = MembershipPrice[plan];

    // Generate order code
    const code = await this.orderRepository.generateOrderCode();

    // Create membership order
    const order = await this.orderRepository.createMembershipOrder({
      userId,
      code,
      subTotal: planPrice,
      totalDiscount: 0,
      totalAmount: planPrice,
      paymentMethod,
      membershipPlan: plan,
    });

    // Schedule auto-cancellation after 24 hours if unpaid
    await this.orderQueueService.scheduleCancelOrder(order.id, order.code);

    // Queue membership order confirmation email
    await this.queueMembershipOrderConfirmationEmail(
      order,
      plan,
      paymentMethod,
    );

    return order;
  }

  // ==================== PRIVATE HELPER METHODS ====================

  /**
   * Queue order confirmation email for course orders
   */
  private async queueOrderConfirmationEmail(
    order: any,
    items: Array<{
      courseId: string;
      title: string;
      price: number;
      thumbnail?: string;
    }>,
    paymentMethod: string,
  ): Promise<void> {
    try {
      // Get user info
      const user = await this.userRepository.findOneOrNull({
        id: order.userId,
      });

      if (!user?.email) {
        console.warn(
          'Cannot send order confirmation email: user email not found',
        );
        return;
      }

      await this.emailQueueService.queueOrderConfirmationEmail({
        to: user.email,
        username: user.username || 'Customer',
        orderCode: order.code,
        items: items.map((item) => ({
          title: item.title,
          price: item.price,
          thumbnail: item.thumbnail,
        })),
        subTotal: Number(order.subTotal),
        totalDiscount: Number(order.totalDiscount),
        totalAmount: Number(order.totalAmount),
        paymentMethod,
        createdAt: order.createdAt,
      });
    } catch (error) {
      // Log error but don't throw - email is non-critical
      console.error('Failed to queue order confirmation email:', error);
    }
  }

  /**
   * Queue membership order confirmation email
   */
  private async queueMembershipOrderConfirmationEmail(
    order: any,
    plan: string,
    paymentMethod: string,
  ): Promise<void> {
    try {
      // Get user info
      const user = await this.userRepository.findOneOrNull({
        id: order.userId,
      });

      if (!user?.email) {
        console.warn(
          'Cannot send membership order confirmation email: user email not found',
        );
        return;
      }

      await this.emailQueueService.queueOrderConfirmationEmail({
        to: user.email,
        username: user.username || 'Customer',
        orderCode: order.code,
        items: [
          {
            title: `${plan} Membership Plan`,
            price: Number(order.totalAmount),
          },
        ],
        subTotal: Number(order.subTotal),
        totalDiscount: Number(order.totalDiscount),
        totalAmount: Number(order.totalAmount),
        paymentMethod,
        createdAt: order.createdAt,
      });
    } catch (error) {
      // Log error but don't throw - email is non-critical
      console.error(
        'Failed to queue membership order confirmation email:',
        error,
      );
    }
  }
}
