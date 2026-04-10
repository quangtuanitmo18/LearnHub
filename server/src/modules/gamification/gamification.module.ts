import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { AdminGamificationController } from './admin-gamification.controller';
import { GamificationController } from './gamification.controller';
import { GamificationProcessor } from './gamification.processor';
import { GamificationService } from './gamification.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'gamification',
    }),
  ],
  controllers: [GamificationController, AdminGamificationController],
  providers: [GamificationService, GamificationProcessor],
  exports: [GamificationService],
})
export class GamificationModule {}
