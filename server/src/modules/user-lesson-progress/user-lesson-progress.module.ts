import { Module, forwardRef } from '@nestjs/common';
import { UserLessonProgressService } from './user-lesson-progress.service';
import { UserLessonProgressRepository } from './user-lesson-progress.repository';
import { BullModule } from '@nestjs/bullmq';
import { LessonModule } from '../lesson/lesson.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    forwardRef(() => LessonModule),
    UserModule,
    BullModule.registerQueue({ name: 'gamification' }),
  ],
  controllers: [],
  providers: [UserLessonProgressService, UserLessonProgressRepository],
  exports: [UserLessonProgressService, UserLessonProgressRepository],
})
export class UserLessonProgressModule {}
