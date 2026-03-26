import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { AUTH_QUEUE, AUTH_JOBS } from '../constants';

@Injectable()
export class AuthQueueService {
  private readonly logger = new Logger(AuthQueueService.name);

  // OTP expiration time in milliseconds (10 minutes)
  private readonly OTP_EXPIRATION_MS = 10 * 60 * 1000;

  constructor(@InjectQueue(AUTH_QUEUE) private authQueue: Queue) {}

  /**
   * Queue a delayed job to delete unverified user after OTP expires
   * @param userId - The user ID to cleanup if not verified
   * @param email - The user email (for logging purposes)
   */
  async queueUnverifiedUserCleanup(
    userId: string,
    email: string,
  ): Promise<string> {
    const job = await this.authQueue.add(
      AUTH_JOBS.CLEANUP_UNVERIFIED_USERS,
      { userId, email },
      {
        delay: this.OTP_EXPIRATION_MS,
        removeOnComplete: true,
        removeOnFail: false,
        jobId: `cleanup-${userId}`, // Use unique jobId to prevent duplicates
      },
    );

    this.logger.log(
      `Queued cleanup job for user ${email} (${userId}), will run in ${this.OTP_EXPIRATION_MS / 1000 / 60} minutes`,
    );

    return job.id!;
  }

  /**
   * Cancel the cleanup job for a user (call this when user verifies email)
   * @param userId - The user ID whose cleanup job should be cancelled
   */
  async cancelUnverifiedUserCleanup(userId: string): Promise<boolean> {
    const jobId = `cleanup-${userId}`;
    const job = await this.authQueue.getJob(jobId);

    if (job) {
      await job.remove();
      this.logger.log(`Cancelled cleanup job for user ${userId}`);
      return true;
    }

    return false;
  }
}
