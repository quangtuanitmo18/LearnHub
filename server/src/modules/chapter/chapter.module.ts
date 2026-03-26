import { Module, forwardRef } from '@nestjs/common';
import { ChapterService } from './chapter.service';
import { ChapterController } from './chapter.controller';
import { ChapterRepository } from './chapter.repository';
import { SharedModule } from 'src/shared/shared.module';
import { CourseModule } from '../course/course.module';

@Module({
  imports: [SharedModule, forwardRef(() => CourseModule)],
  controllers: [ChapterController],
  providers: [ChapterService, ChapterRepository],
  exports: [ChapterService, ChapterRepository],
})
export class ChapterModule { }
