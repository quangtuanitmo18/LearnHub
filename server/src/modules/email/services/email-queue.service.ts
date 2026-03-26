import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { EMAIL_QUEUE, EMAIL_JOBS } from '../constants';
import {
  OrderConfirmationEmailData,
  PaymentSuccessEmailData,
  MembershipActivatedEmailData,
  PasswordResetEmailData,
  OtpVerificationEmailData,
} from '../interfaces';

@Injectable()
export class EmailQueueService {
  private readonly logger = new Logger(EmailQueueService.name);

  constructor(@InjectQueue(EMAIL_QUEUE) private emailQueue: Queue) {}

  /**
   * Queue order confirmation email
   */
  async queueOrderConfirmationEmail(
    data: OrderConfirmationEmailData,
  ): Promise<string> {
    const job = await this.emailQueue.add(
      EMAIL_JOBS.SEND_ORDER_CONFIRMATION,
      data,
      {
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
      `Queued order confirmation email job ${job.id} for order ${data.orderCode}`,
    );

    return job.id!;
  }

  /**
   * Queue payment success email
   */
  async queuePaymentSuccessEmail(
    data: PaymentSuccessEmailData,
  ): Promise<string> {
    const job = await this.emailQueue.add(
      EMAIL_JOBS.SEND_PAYMENT_SUCCESS,
      data,
      {
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
      `Queued payment success email job ${job.id} for order ${data.orderCode}`,
    );

    return job.id!;
  }

  /**
   * Queue membership activated email
   */
  async queueMembershipActivatedEmail(
    data: MembershipActivatedEmailData,
  ): Promise<string> {
    const job = await this.emailQueue.add(
      EMAIL_JOBS.SEND_MEMBERSHIP_ACTIVATED,
      data,
      {
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
      `Queued membership activated email job ${job.id} for order ${data.orderCode}`,
    );

    return job.id!;
  }

  /**
   * Queue password reset email
   */
  async queuePasswordResetEmail(data: PasswordResetEmailData): Promise<string> {
    const job = await this.emailQueue.add(
      EMAIL_JOBS.SEND_PASSWORD_RESET,
      data,
      {
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
      `Queued password reset email job ${job.id} for user ${data.to}`,
    );

    return job.id!;
  }

  /**
   * Queue OTP verification email
   */
  async queueOtpVerificationEmail(
    data: OtpVerificationEmailData,
  ): Promise<string> {
    const job = await this.emailQueue.add(
      EMAIL_JOBS.SEND_OTP_VERIFICATION,
      data,
      {
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
      `Queued OTP verification email job ${job.id} for user ${data.to}`,
    );

    return job.id!;
  }
}
