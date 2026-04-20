import { Processor, WorkerHost, InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { QUEUE_NAMES } from 'src/shared/queues/queue.constants';
import { QuizAttemptService } from '../quiz-attempt/quiz-attempt.service';
import { PrismaService } from 'src/shared/services/prisma.service';
import { AttemptStatus } from 'src/generated/prisma/enums';

@Injectable()
@Processor(QUEUE_NAMES.CONTEST)
export class ContestProcessor extends WorkerHost {
  private readonly logger = new Logger(ContestProcessor.name);

  constructor(
    private readonly quizAttemptService: QuizAttemptService,
    private readonly prismaService: PrismaService,
    @InjectQueue(QUEUE_NAMES.EMAIL) private readonly emailQueue: Queue,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.debug(`Processing contest job: ${job.name} (ID: ${job.id})`);

    try {
      switch (job.name) {
        case 'force-submit-contest':
          await this.handleForceSubmitContest(job.data);
          break;
        case 'notify-contest-result':
          await this.handleNotifyContestResult(job.data);
          break;
        default:
          this.logger.warn(`Unknown job name: ${job.name}`);
      }
    } catch (error) {
      this.logger.error(
        `Error processing job ${job.name}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private async handleForceSubmitContest(data: { contestId: string }) {
    this.logger.log(
      `Force-submitting all IN_PROGRESS attempts for contest ${data.contestId}`,
    );
    try {
      const attempts = await this.prismaService.quizAttempt.findMany({
        where: {
          contestId: data.contestId,
          status: AttemptStatus.IN_PROGRESS,
        },
        select: { id: true, userId: true },
      });

      let successCount = 0;
      let failCount = 0;

      for (const attempt of attempts) {
        try {
          await this.quizAttemptService.forceSubmitAttempt(
            attempt.id,
            attempt.userId,
          );
          successCount++;
        } catch (err) {
          this.logger.warn(
            `Could not force-submit attempt ${attempt.id}: ${err.message}`,
          );
          failCount++;
        }
      }

      this.logger.log(
        `Force-submit contest ${data.contestId} finished: ${successCount} succeeded, ${failCount} failed.`,
      );
    } catch (err) {
      this.logger.error(
        `Failed to handle force-submit contest ${data.contestId}: ${err.message}`,
      );
      throw err;
    }
  }

  private async handleNotifyContestResult(data: {
    contestId: string;
    title: string;
    slug: string;
  }) {
    this.logger.log(
      `Notifying users about contest result for ${data.contestId}`,
    );
    try {
      // Find all distinct users who have submitted attempts for this contest
      const users = await this.prismaService.user.findMany({
        where: {
          quizAttempts: {
            some: {
              contestId: data.contestId,
              status: { in: [AttemptStatus.SUBMITTED, AttemptStatus.EXPIRED] },
            },
          },
        },
        select: { email: true, username: true },
      });

      this.logger.log(
        `Found ${users.length} users to notify for contest ${data.contestId}`,
      );

      for (const user of users) {
        // Enqueue email job
        await this.emailQueue.add(
          'SEND_CONTEST_RESULT_READY',
          {
            to: user.email,
            username: user.username,
            contestTitle: data.title,
            contestSlug: data.slug,
          },
          { attempts: 3, backoff: { type: 'exponential', delay: 2000 } },
        );
      }
    } catch (err) {
      this.logger.error(
        `Failed to handle notify-contest-result ${data.contestId}: ${err.message}`,
      );
      throw err;
    }
  }
}
