import { Module, forwardRef } from '@nestjs/common';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { CourseRepository } from './course.repository';
import { UserModule } from '../user/user.module';
import { CategoryModule } from '../category/category.module';
import { UserLessonProgressModule } from '../user-lesson-progress/user-lesson-progress.module';

@Module({
  imports: [
    UserModule,
    CategoryModule,
    forwardRef(() => UserLessonProgressModule),
  ],
  controllers: [CourseController],
  providers: [CourseService, CourseRepository],
  exports: [CourseService, CourseRepository],
})
export class CourseModule {}
