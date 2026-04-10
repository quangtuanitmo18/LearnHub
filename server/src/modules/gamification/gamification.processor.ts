import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { GamificationService } from './gamification.service';

@Processor('gamification')
export class GamificationProcessor extends WorkerHost {
  private readonly logger = new Logger(GamificationProcessor.name);

  constructor(private readonly gamificationService: GamificationService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.debug(`Processing gamification job: ${job.name} - ${job.id}`);
    try {
      if (job.name === 'add-points') {
        const { userId, points, reason, metadata } = job.data;
        await this.gamificationService.handleAddPoints(
          userId,
          points,
          reason,
          metadata,
        );
      }
    } catch (error) {
      this.logger.error(`Failed to process gamification job: ${error.message}`);
      throw error;
    }
  }
}
