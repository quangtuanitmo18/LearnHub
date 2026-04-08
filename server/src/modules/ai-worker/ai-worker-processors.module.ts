import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { SharedModule } from 'src/shared/shared.module';
import { KnowledgeGraphService } from '../chat/knowledge-graph.service';
import { ConceptProcessor } from './processors/concept.processor';
import { EmbedProcessor } from './processors/embed.processor';

@Module({
  imports: [
    SharedModule,
    BullModule.registerQueue({ name: 'ai-embed' }, { name: 'ai-concept' }),
  ],
  providers: [EmbedProcessor, ConceptProcessor, KnowledgeGraphService],
})
export class AiWorkerProcessorsModule {}
