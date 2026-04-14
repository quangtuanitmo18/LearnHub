import { Module } from '@nestjs/common';
import { SharedModule } from 'src/shared/shared.module';
import { QueuesModule } from 'src/shared/queues';
import { OrderProcessor } from './processors/order.processor';
import { OrderRepository } from './order.repository';

@Module({
  imports: [SharedModule, QueuesModule],
  providers: [OrderRepository, OrderProcessor],
})
export class OrderWorkerModule {}
