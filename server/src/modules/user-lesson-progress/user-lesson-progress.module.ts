import { Module, forwardRef } from '@nestjs/common';
import { UserLessonProgressService } from './user-lesson-progress.service';
import { UserLessonProgressRepository } from './user-lesson-progress.repository';
import { LessonModule } from '../lesson/lesson.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [forwardRef(() => LessonModule), UserModule],
  controllers: [],
  providers: [UserLessonProgressService, UserLessonProgressRepository],
  exports: [UserLessonProgressService, UserLessonProgressRepository],
})
export class UserLessonProgressModule {}
