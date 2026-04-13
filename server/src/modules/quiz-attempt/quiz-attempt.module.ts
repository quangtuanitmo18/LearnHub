import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QuizAttemptController } from './quiz-attempt.controller';
import { QuizAttemptService } from './quiz-attempt.service';
import { QuizAttemptRepository } from './quiz-attempt.repository';
import { QuizAttemptProcessor } from './quiz-attempt.processor';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [
    SharedModule,
    BullModule.registerQueue({ name: 'gamification' }),
    BullModule.registerQueue({ name: 'quiz-attempt' }),
  ],
  controllers: [QuizAttemptController],
  providers: [QuizAttemptService, QuizAttemptRepository, QuizAttemptProcessor],
  exports: [QuizAttemptService, QuizAttemptRepository],
})
export class QuizAttemptModule {}
