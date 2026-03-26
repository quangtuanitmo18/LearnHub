import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  ORDER_QUEUE,
  ORDER_JOBS,
  ORDER_CANCEL_DELAY,
} from '../constants/order-queue.constant';
import { CancelOrderJobData } from '../processors/order.processor';

@Injectable()
export class OrderQueueService {
  private readonly logger = new Logger(OrderQueueService.name);

  constructor(@InjectQueue(ORDER_QUEUE) private orderQueue: Queue) {}

  /**
   * Schedule order cancellation after 24 hours
   */
  async scheduleCancelOrder(orderId: string, orderCode: string): Promise<string> {
    const jobData: CancelOrderJobData = { orderId, orderCode };

    const job = await this.orderQueue.add(
      ORDER_JOBS.CANCEL_UNPAID_ORDER,
      jobData,
      {
        delay: ORDER_CANCEL_DELAY,
        jobId: `cancel-order-${orderId}`, // Unique job ID for easy removal
        removeOnComplete: true,
        removeOnFail: false,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      },
    );

    this.logger.log(
      `Scheduled cancellation job ${job.id} for order ${orderCode} in 24 hours`,
    );

    return job.id!;
  }

  /**
   * Cancel the scheduled order cancellation (when payment is received)
   */
  async cancelScheduledCancellation(orderId: string): Promise<boolean> {
    const jobId = `cancel-order-${orderId}`;

    try {
      const job = await this.orderQueue.getJob(jobId);

      if (job) {
        await job.remove();
        this.logger.log(`Removed cancellation job for order ${orderId}`);
        return true;
      }

      this.logger.log(`No cancellation job found for order ${orderId}`);
      return false;
    } catch (error) {
      this.logger.error(`Failed to cancel job for order ${orderId}:`, error);
      return false;
    }
  }

  /**
   * Get job status for an order
   */
  async getJobStatus(orderId: string) {
    const jobId = `cancel-order-${orderId}`;
    const job = await this.orderQueue.getJob(jobId);

    if (!job) {
      return null;
    }

    const state = await job.getState();
    return {
      jobId: job.id,
      state,
      data: job.data,
      delay: job.opts.delay,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
    };
  }
}
