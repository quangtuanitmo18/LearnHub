import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderRepository } from './order.repository';
import { OrderQueueService } from './services/order-queue.service';
import { CartModule } from '../cart/cart.module';
import { CouponModule } from '../coupon/coupon.module';
import { CourseModule } from '../course/course.module';
import { UserModule } from '../user/user.module';
import { EmailModule } from '../email/email.module';
import { ORDER_QUEUE } from './constants/order-queue.constant';

@Module({
  imports: [
    CartModule,
    CouponModule,
    CourseModule,
    UserModule,
    EmailModule,
    BullModule.registerQueue({
      name: ORDER_QUEUE,
    }),
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderRepository, OrderQueueService],
  exports: [OrderService, OrderRepository, OrderQueueService],
})
export class OrderModule {}
