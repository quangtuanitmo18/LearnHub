import { Module } from '@nestjs/common';
import { SharedModule } from 'src/shared/shared.module';
import { CourseModule } from '../course/course.module';
import { OrderModule } from '../order/order.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatStore } from './chat.store';
import { IntentService } from './intent.service';
import { KnowledgeGraphService } from './knowledge-graph.service';
import { MemoryService } from './memory.service';
import { RetrievalService } from './retrieval.service';
import { ToolsService } from './tools.service';

@Module({
  imports: [SharedModule, CourseModule, OrderModule],
  controllers: [ChatController],
  providers: [
    ChatService,
    ChatStore,
    IntentService,
    RetrievalService,
    ToolsService,
    MemoryService,
    KnowledgeGraphService,
  ],
  exports: [ChatService, KnowledgeGraphService],
})
export class ChatModule {}
