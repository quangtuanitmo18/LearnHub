import { Module } from '@nestjs/common';
import { SharedModule } from 'src/shared/shared.module';
import { QueuesModule } from 'src/shared/queues';
import { GamificationProcessor } from './gamification.processor';
import { GamificationService } from './gamification.service';

@Module({
  imports: [SharedModule, QueuesModule],
  providers: [GamificationProcessor, GamificationService],
})
export class GamificationWorkerModule {}
