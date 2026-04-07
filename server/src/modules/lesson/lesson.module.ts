import { Module, forwardRef } from '@nestjs/common';
import { SharedModule } from 'src/shared/shared.module';
import { AiWorkerModule } from '../ai-worker/ai-worker.module';
import { ChapterModule } from '../chapter/chapter.module';
import { CourseModule } from '../course/course.module';
import { UserLessonProgressModule } from '../user-lesson-progress/user-lesson-progress.module';
import { LessonController } from './lesson.controller';
import { LessonRepository } from './lesson.repository';
import { LessonService } from './lesson.service';

@Module({
  imports: [
    SharedModule,
    AiWorkerModule,
    forwardRef(() => CourseModule),
    ChapterModule,
    forwardRef(() => UserLessonProgressModule),
  ],
  controllers: [LessonController],
  providers: [LessonService, LessonRepository],
  exports: [LessonService, LessonRepository],
})
export class LessonModule {}
