import { Module } from '@nestjs/common';
import { QueuesModule } from 'src/shared/queues';
import { QuizAttemptController } from './quiz-attempt.controller';
import { QuizAttemptService } from './quiz-attempt.service';
import { QuizAttemptRepository } from './quiz-attempt.repository';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [SharedModule, QueuesModule],
  controllers: [QuizAttemptController],
  providers: [QuizAttemptService, QuizAttemptRepository],
  exports: [QuizAttemptService, QuizAttemptRepository],
})
export class QuizAttemptModule {}
