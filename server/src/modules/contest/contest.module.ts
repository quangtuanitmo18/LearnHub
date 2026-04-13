import { Module } from '@nestjs/common';
import { ContestService } from './contest.service';
import { ContestController } from './contest.controller';
import { PrismaService } from 'src/shared/services/prisma.service';
import { QuizAttemptModule } from '../quiz-attempt/quiz-attempt.module';

@Module({
  imports: [QuizAttemptModule],
  controllers: [ContestController],
  providers: [ContestService, PrismaService],
  exports: [ContestService],
})
export class ContestModule {}
