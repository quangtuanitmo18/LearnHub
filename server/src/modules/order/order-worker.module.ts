import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { SharedModule } from 'src/shared/shared.module';
import { ORDER_QUEUE } from './constants/order-queue.constant';
import { OrderProcessor } from './processors/order.processor';
import { OrderRepository } from './order.repository';

@Module({
  imports: [
    SharedModule,
    BullModule.registerQueue({
      name: ORDER_QUEUE,
    }),
  ],
  providers: [OrderRepository, OrderProcessor],
})
export class OrderWorkerModule {}
