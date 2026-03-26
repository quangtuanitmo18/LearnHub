import { Module } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { CommentRepository } from './comment.repository';
import { LessonModule } from '../lesson/lesson.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [LessonModule, UserModule],
  controllers: [CommentController],
  providers: [CommentService, CommentRepository],
  exports: [CommentService, CommentRepository],
})
export class CommentModule {}
