import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, OrderType } from 'src/shared/constants/order.constant';
import { MembershipDuration } from 'src/shared/constants/user.constant';
import { PrismaService } from 'src/shared/services/prisma.service';
import Stripe from 'stripe';
import { EmailQueueService } from '../email/services';
import { NotificationService } from '../notification/notification.service';
import { OrderQueueService } from '../order/services/order-queue.service';
import { TransferType, WebhookPaymentBodyDto } from './dto/payment.dto';
import { StripeService } from './services/stripe.service';

@Injectable()
export class PaymentRepository {
  private readonly logger = new Logger(PaymentRepository.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly orderQueueService: OrderQueueService,
    private readonly emailQueueService: EmailQueueService,
    private readonly stripeService: StripeService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Process incoming webhook payment data (e.g., Sepay)
   */
  async handleSepayWebhook(webhookData: WebhookPaymentBodyDto) {
    console.log('Received Sepay webhook:', webhookData);
    // Only process order completion for incoming payments
    if (webhookData.transferType !== TransferType.IN || !webhookData.content) {
      return { success: true, message: 'Non-incoming payment, skipped' };
    }

    try {
      // Extract and find order from transaction content
      const order = await this.findOrderByContent(webhookData.content);

      if (!order) {
        throw new NotFoundException(
          'No matching order found in transaction content',
        );
      }

      // Verify payment amount matches order total
      const isAmountValid = await this.verifyPaymentAmount(
        order.id,
        webhookData.transferAmount,
      );

      if (!isAmountValid) {
        throw new BadRequestException(
          `Payment amount ${webhookData.transferAmount} does not match order total`,
        );
      }

      // Check if order is already completed
      if (order.status === OrderStatus.COMPLETED) {
        this.logger.warn(
          `Order ${order.code} already processed via SePay webhook`,
        );
        return {
          order: {
            id: order.id,
            code: order.code,
            status: OrderStatus.COMPLETED,
          },
          message: 'Order already completed',
        };
      }

      // Complete the order
      const completedOrder = await this.completeOrder(order.id);

      // Cancel the scheduled auto-cancellation job
      await this.orderQueueService.cancelScheduledCancellation(order.id);

      // Queue email notification based on order type
      await this.queuePaymentSuccessEmail(completedOrder);

      // Send real-time notification to admins
      this.notifyAdminsOfPayment(completedOrder);

      return {
        order: {
          id: order.id,
          code: order.code,
          status: OrderStatus.COMPLETED,
        },
      };
    } catch (error) {
      // Re-throw known exceptions
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      // Log and throw internal error for unexpected issues
      console.error('Error processing order:', error);
      throw new InternalServerErrorException('Failed to process payment order');
    }
  }

  /**
   * Find order by payment code in transaction content
   * Extracts order code from content string (e.g., "ORD17669947012388783")
   */
  async findOrderByContent(content: string) {
    if (!content) return null;

    // Extract order code matching pattern: ORD{timestamp}
    const orderCodeMatch = content.match(/ORD\d+/i);

    if (!orderCodeMatch) return null;

    const orderCode = orderCodeMatch[0];

    return this.prismaService.order.findFirst({
      where: { code: orderCode },
      include: {
        items: true,
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
      },
    });
  }

  /**
   * Process payment and complete order
   * This will be called after verifying the payment amount matches the order
   */
  async completeOrder(orderId: string) {
    return this.prismaService.$transaction(async (tx) => {
      // Update order status to COMPLETED
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.COMPLETED,
          updatedAt: new Date(),
        },
        include: {
          items: true,
          user: true,
        },
      });

      // If this is a membership order, activate the membership
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

          // Activate membership
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

      // If this is a course order, increment sold count
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
      }

      return updatedOrder;
    });
  }

  /**
   * Verify payment amount matches order total
   */
  async verifyPaymentAmount(
    orderId: string,
    paidAmount: number,
  ): Promise<boolean> {
    const order = await this.prismaService.order.findUnique({
      where: { id: orderId },
      select: { totalAmount: true },
    });

    if (!order) return false;

    // Convert Decimal to number for comparison
    const orderTotal = Number(order.totalAmount);

    // Allow small differences due to floating point precision
    return Math.abs(orderTotal - paidAmount) < 0.01;
  }

  /**
   * Queue payment success email based on order type
   */
  private async queuePaymentSuccessEmail(order: any): Promise<void> {
    try {
      const orderType = order.orderType;
      const user = order.user;

      if (!user?.email) {
        console.warn('Cannot send email: user email not found');
        return;
      }

      if (orderType === OrderType.MEMBERSHIP) {
        // Send membership activated email with invoice
        await this.emailQueueService.queueMembershipActivatedEmail({
          to: user.email,
          username: user.username || 'Member',
          orderCode: order.code,
          plan: order.membershipPlan,
          totalAmount: Number(order.totalAmount),
          planStartDate: user.planStartDate || new Date(),
          planEndDate: user.planEndDate || new Date(),
        });
      } else {
        // Send course payment success email with invoice data
        const items =
          order.items?.map((item: any) => ({
            title: item.title,
            price: Number(item.price),
            thumbnail: item.thumbnail,
          })) || [];

        // Calculate subtotal (sum of all item prices)
        const subTotal = items.reduce(
          (sum: number, item: any) => sum + item.price,
          0,
        );

        // Calculate discount (subtotal - totalAmount)
        const totalDiscount = Math.max(0, subTotal - Number(order.totalAmount));

        await this.emailQueueService.queuePaymentSuccessEmail({
          to: user.email,
          username: user.username || 'Customer',
          orderCode: order.code,
          orderType: 'COURSE',
          items,
          subTotal,
          totalDiscount,
          totalAmount: Number(order.totalAmount),
          paymentMethod: order.paymentMethod || 'Bank Transfer',
          paidAt: new Date(),
        });
      }
    } catch (error) {
      // Log error but don't throw - email is non-critical
      console.error('Failed to queue payment success email:', error);
    }
  }

  // ==================== STRIPE METHODS ====================

  /**
   * Create Stripe checkout session for an order
   */
  async createStripeCheckout(orderCode: string, userId: string) {
    // Verify Stripe is configured
    if (!this.stripeService.isConfigured()) {
      throw new BadRequestException('Stripe payment is not configured');
    }

    // Find the order
    const order = await this.prismaService.order.findFirst({
      where: { code: orderCode, userId },
      include: {
        items: true,
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Order is not in pending status');
    }

    // Build line items for Stripe
    const lineItems: Array<{
      name: string;
      description?: string;
      amount: number;
      quantity: number;
      imageUrl?: string;
    }> = [];

    // Determine currency (default to USD for international payments)
    const currency = 'usd'; 

    if ((order as any).orderType === OrderType.MEMBERSHIP) {
      // Membership order
      lineItems.push({
        name: `${(order as any).membershipPlan} Membership`,
        description: `Premium membership plan`,
          amount: Number(order.totalAmount), // in USD, decimal
          quantity: 1,
        });
      } else {
        // Course order
        for (const item of order.items) {
          lineItems.push({
            name: item.title || 'Course',
            description: `Course purchase`,
            amount: Number(item.price), // in USD, decimal
            quantity: 1,
            imageUrl: item.thumbnail || undefined,
        });
      }

      // If there's a discount, adjust the total
      const totalDiscount = Number(order.totalDiscount);
      if (totalDiscount > 0) {
        // Calculate total and expected amount
        const totalItemsPrice = order.items.reduce(
          (sum, item) => sum + Number(item.price),
          0,
        );
        const expectedTotal = Number(order.totalAmount);

        if (Math.abs(totalItemsPrice - expectedTotal) > 0.01 && lineItems.length > 0) {
          // Apply discount by reducing total
          const discountAmount = totalItemsPrice - expectedTotal;
          // Adjust last item to reflect discount
          lineItems[lineItems.length - 1].amount -= discountAmount;
        }
      }
    }

    // Create checkout session
    const session = await this.stripeService.createCheckoutSession({
      orderId: order.id,
      orderCode: order.code,
      userId: order.userId,
      userEmail: order.user?.email || '',
      currency, // Pass currency
      lineItems,
      metadata: {
        orderType: (order as any).orderType || OrderType.COURSE,
        membershipPlan: (order as any).membershipPlan || '',
      },
    });

    this.logger.log(
      `Stripe checkout created for order ${orderCode}: ${session.id}`,
    );

    return {
      sessionId: session.id,
      sessionUrl: session.url,
      orderCode: order.code,
    };
  }

  /**
   * Handle Stripe webhook events
   */
  async handleStripeWebhook(payload: Buffer, signature: string) {
    // Construct and verify the webhook event
    const event = this.stripeService.constructWebhookEvent(payload, signature);

    this.logger.log(`Received Stripe webhook: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutSessionCompleted(event.data.object);
        break;

      case 'checkout.session.expired':
        this.handleCheckoutSessionExpired(event.data.object);
        break;

      case 'payment_intent.succeeded':
        this.logger.log(`Payment intent succeeded: ${event.data.object.id}`);
        break;

      case 'payment_intent.payment_failed':
        this.handlePaymentFailed(event.data.object);
        break;

      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }

  /**
   * Handle successful checkout session
   */
  private async handleCheckoutSessionCompleted(
    session: Stripe.Checkout.Session,
  ) {
    const { orderId, orderCode } = session.metadata || {};

    if (!orderId || !orderCode) {
      this.logger.error('Missing order metadata in checkout session');
      return;
    }

    this.logger.log(`Processing completed checkout for order ${orderCode}`);

    try {
      // Find the order
      const order = await this.prismaService.order.findUnique({
        where: { id: orderId },
        include: { items: true, user: true },
      });

      if (!order) {
        this.logger.error(`Order not found: ${orderId}`);
        return;
      }

      if (order.status !== OrderStatus.PENDING) {
        this.logger.warn(`Order ${orderCode} already processed`);
        return;
      }

      // Complete the order
      const completedOrder = await this.completeOrder(order.id);

      // Cancel scheduled auto-cancellation
      await this.orderQueueService.cancelScheduledCancellation(order.id);

      // Queue email notification
      await this.queuePaymentSuccessEmail(completedOrder);

      // Send real-time notification to admins
      this.notifyAdminsOfPayment(completedOrder);

      this.logger.log(`Order ${orderCode} completed via Stripe`);
    } catch (error) {
      this.logger.error(
        `Error processing Stripe checkout completion: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Handle expired checkout session
   */
  private handleCheckoutSessionExpired(session: Stripe.Checkout.Session) {
    const { orderId, orderCode } = session.metadata || {};

    if (!orderId || !orderCode) {
      return;
    }

    this.logger.log(`Checkout session expired for order ${orderCode}`);
    // The order will be auto-cancelled by the scheduled job if not completed
  }

  /**
   * Handle failed payment
   */
  private handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    this.logger.error(
      `Payment failed: ${paymentIntent.id} - ${paymentIntent.last_payment_error?.message}`,
    );

    // You could update order status or notify user here
  }

  /**
   * Verify Stripe checkout session status
   */
  async verifyStripeCheckout(sessionId: string) {
    const session = await this.stripeService.retrieveCheckoutSession(sessionId);

    return {
      sessionId: session.id,
      status: session.status,
      paymentStatus: session.payment_status,
      orderCode: session.metadata?.orderCode,
      amountTotal: session.amount_total ? session.amount_total / 100 : 0,
      currency: session.currency,
    };
  }

  /**
   * Send real-time notification to admins about successful payment
   */
  private notifyAdminsOfPayment(order: any): void {
    try {
      const orderType = order.orderType || OrderType.COURSE;
      const user = order.user;

      const items =
        order.items?.map((item: any) => ({
          title: item.title,
          price: Number(item.price),
        })) || [];

      void this.notificationService.notifyPaymentSuccess({
        orderId: order.id,
        orderCode: order.code,
        userId: user?.id || order.userId,
        userName: user?.username,
        userEmail: user?.email,
        totalAmount: Number(order.totalAmount),
        orderType: orderType as 'COURSE' | 'MEMBERSHIP',
        items,
      });
    } catch (error) {
      // Log error but don't throw - notification is non-critical
      this.logger.error(
        'Failed to send payment notification to admins:',
        error,
      );
    }
  }
}
