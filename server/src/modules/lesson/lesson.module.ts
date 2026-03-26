import { Module, forwardRef } from '@nestjs/common';
import { LessonService } from './lesson.service';
import { LessonController } from './lesson.controller';
import { LessonRepository } from './lesson.repository';
import { SharedModule } from 'src/shared/shared.module';
import { CourseModule } from '../course/course.module';
import { ChapterModule } from '../chapter/chapter.module';
import { UserLessonProgressModule } from '../user-lesson-progress/user-lesson-progress.module';

@Module({
  imports: [
    SharedModule,
    forwardRef(() => CourseModule),
    ChapterModule,
    forwardRef(() => UserLessonProgressModule),
  ],
  controllers: [LessonController],
  providers: [LessonService, LessonRepository],
  exports: [LessonService, LessonRepository],
})
export class LessonModule {}
