import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QuizAttemptController } from './quiz-attempt.controller';
import { QuizAttemptService } from './quiz-attempt.service';
import { QuizAttemptRepository } from './quiz-attempt.repository';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [SharedModule, BullModule.registerQueue({ name: 'gamification' })],
  controllers: [QuizAttemptController],
  providers: [QuizAttemptService, QuizAttemptRepository],
  exports: [QuizAttemptService, QuizAttemptRepository],
})
export class QuizAttemptModule {}
