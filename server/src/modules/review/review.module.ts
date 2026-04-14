import { Module } from '@nestjs/common';
import { QueuesModule } from 'src/shared/queues';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { ReviewRepository } from './review.repository';
import { CourseModule } from '../course/course.module';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [CourseModule, OrderModule, QueuesModule],
  controllers: [ReviewController],
  providers: [ReviewService, ReviewRepository],
  exports: [ReviewService, ReviewRepository],
})
export class ReviewModule {}
