import { Module } from '@nestjs/common';
import { SharedModule } from 'src/shared/shared.module';
import { QueuesModule } from 'src/shared/queues';
import { QuizAttemptProcessor } from './quiz-attempt.processor';
import { QuizAttemptService } from './quiz-attempt.service';
import { QuizAttemptRepository } from './quiz-attempt.repository';

@Module({
  imports: [SharedModule, QueuesModule],
  providers: [QuizAttemptProcessor, QuizAttemptService, QuizAttemptRepository],
})
export class QuizAttemptWorkerModule {}
