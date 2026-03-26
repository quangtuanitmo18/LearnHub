import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { AUTH_QUEUE, AUTH_JOBS } from '../constants';
import { PrismaService } from 'src/shared/services/prisma.service';

interface CleanupUnverifiedUserData {
  userId: string;
  email: string;
}

@Processor(AUTH_QUEUE)
export class AuthProcessor extends WorkerHost {
  private readonly logger = new Logger(AuthProcessor.name);

  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  async process(job: Job<CleanupUnverifiedUserData>): Promise<void> {
    this.logger.log(`Processing auth job ${job.name} with id ${job.id}`);

    switch (job.name) {
      case AUTH_JOBS.CLEANUP_UNVERIFIED_USERS:
        await this.handleCleanupUnverifiedUser(job.data);
        break;
      default:
        this.logger.warn(`Unknown auth job name: ${job.name}`);
    }
  }

  private async handleCleanupUnverifiedUser(
    data: CleanupUnverifiedUserData,
  ): Promise<void> {
    const { userId, email } = data;

    this.logger.log(`Checking if user ${email} (${userId}) needs cleanup...`);

    // Find the user and check if still unverified
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        isEmailVerified: true,
        status: true,
      },
    });

    // User not found (already deleted or verified and modified)
    if (!user) {
      this.logger.log(`User ${userId} not found, skipping cleanup`);
      return;
    }

    // User has verified their email, don't delete
    if (user.isEmailVerified || user.status === 'ACTIVE') {
      this.logger.log(`User ${email} is verified, skipping cleanup`);
      return;
    }

    // Delete the unverified user
    await this.prismaService.user.delete({
      where: { id: userId },
    });

    this.logger.log(`Deleted unverified user ${email} (${userId})`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Auth job ${job.name} (${job.id}) completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(
      `Auth job ${job.name} (${job.id}) failed: ${error.message}`,
    );
  }
}
