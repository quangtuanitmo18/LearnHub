import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatStore } from './chat.store';
import { IntentService } from './intent.service';
import { CourseModule } from '../course/course.module';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [CourseModule, OrderModule],
  controllers: [ChatController],
  providers: [ChatService, ChatStore, IntentService],
  exports: [ChatService],
})
export class ChatModule {}
