import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { ORDER_QUEUE, ORDER_JOBS } from '../constants/order-queue.constant';
import { OrderRepository } from '../order.repository';
import { OrderStatus } from 'src/shared/constants/order.constant';

export interface CancelOrderJobData {
  orderId: string;
  orderCode: string;
}

@Processor(ORDER_QUEUE)
export class OrderProcessor extends WorkerHost {
  private readonly logger = new Logger(OrderProcessor.name);

  constructor(private readonly orderRepository: OrderRepository) {
    super();
  }

  async process(job: Job<CancelOrderJobData>): Promise<void> {
    this.logger.log(`Processing job ${job.name} with id ${job.id}`);

    switch (job.name) {
      case ORDER_JOBS.CANCEL_UNPAID_ORDER:
        await this.handleCancelUnpaidOrder(job.data);
        break;
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
  }

  private async handleCancelUnpaidOrder(data: CancelOrderJobData): Promise<void> {
    const { orderId, orderCode } = data;

    this.logger.log(`Checking order ${orderCode} for cancellation...`);

    try {
      // Get current order status
      const order = await this.orderRepository.findOneOrNull({ id: orderId });

      if (!order) {
        this.logger.warn(`Order ${orderCode} not found`);
        return;
      }

      // Only cancel if still PENDING
      if (order.status === OrderStatus.PENDING) {
        await this.orderRepository.updateStatus(orderId, OrderStatus.CANCELLED);
        this.logger.log(`Order ${orderCode} cancelled due to non-payment after 24 hours`);
      } else {
        this.logger.log(`Order ${orderCode} is already ${order.status}, skipping cancellation`);
      }
    } catch (error) {
      this.logger.error(`Failed to cancel order ${orderCode}:`, error);
      throw error; // Re-throw to let BullMQ handle retry
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<CancelOrderJobData>) {
    this.logger.log(`Job ${job.name} (${job.id}) completed for order ${job.data.orderCode}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<CancelOrderJobData>, error: Error) {
    this.logger.error(
      `Job ${job.name} (${job.id}) failed for order ${job.data.orderCode}: ${error.message}`,
    );
  }
}
