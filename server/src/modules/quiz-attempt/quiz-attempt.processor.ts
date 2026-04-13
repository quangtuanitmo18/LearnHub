import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QuizAttemptService } from './quiz-attempt.service';

@Injectable()
@Processor('quiz-attempt')
export class QuizAttemptProcessor extends WorkerHost {
  private readonly logger = new Logger(QuizAttemptProcessor.name);

  constructor(private readonly quizAttemptService: QuizAttemptService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.debug(
      `Processing gamification job: ${job.name} (ID: ${job.id})`,
    );

    try {
      switch (job.name) {
        case 'auto-submit-attempt':
          await this.handleAutoSubmit(job.data);
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

  private async handleAutoSubmit(data: { attemptId: string; userId: string }) {
    this.logger.log(
      `Auto-submitting attempt ${data.attemptId} for user ${data.userId}`,
    );
    try {
      // Force submit logic via the service
      await this.quizAttemptService.forceSubmitAttempt(
        data.attemptId,
        data.userId,
      );
      this.logger.log(`Successfully auto-submitted attempt ${data.attemptId}`);
    } catch (err) {
      // If it's already submitted or expired, it might throw, we just log and ignore
      this.logger.warn(
        `Could not auto-submit attempt ${data.attemptId}: ${err.message}`,
      );
    }
  }
}
