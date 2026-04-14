import { Module } from '@nestjs/common';
import { QueuesModule } from 'src/shared/queues';
import { AdminGamificationController } from './admin-gamification.controller';
import { GamificationController } from './gamification.controller';
import { GamificationService } from './gamification.service';

@Module({
  imports: [QueuesModule],
  controllers: [GamificationController, AdminGamificationController],
  providers: [GamificationService],
  exports: [GamificationService],
})
export class GamificationModule {}
