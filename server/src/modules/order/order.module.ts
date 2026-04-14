import { Module } from '@nestjs/common';
import { QueuesModule } from 'src/shared/queues';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderRepository } from './order.repository';
import { OrderQueueService } from './services/order-queue.service';
import { CartModule } from '../cart/cart.module';
import { CouponModule } from '../coupon/coupon.module';
import { CourseModule } from '../course/course.module';
import { UserModule } from '../user/user.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [CartModule, CouponModule, CourseModule, UserModule, EmailModule, QueuesModule],
  controllers: [OrderController],
  providers: [OrderService, OrderRepository, OrderQueueService],
  exports: [OrderService, OrderRepository, OrderQueueService],
})
export class OrderModule {}
