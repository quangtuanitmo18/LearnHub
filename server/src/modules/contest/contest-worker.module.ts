import { Module } from '@nestjs/common';
import { SharedModule } from 'src/shared/shared.module';
import { QueuesModule } from 'src/shared/queues';
import { ContestProcessor } from './contest.processor';
import { QuizAttemptModule } from '../quiz-attempt/quiz-attempt.module';

@Module({
  imports: [SharedModule, QueuesModule, QuizAttemptModule],
  providers: [ContestProcessor],
})
export class ContestWorkerModule {}
