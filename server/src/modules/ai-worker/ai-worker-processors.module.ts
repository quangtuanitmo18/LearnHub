import { Module } from '@nestjs/common';
import { SharedModule } from 'src/shared/shared.module';
import { QueuesModule } from 'src/shared/queues';
import { KnowledgeGraphService } from '../chat/knowledge-graph.service';
import { ConceptProcessor } from './processors/concept.processor';
import { EmbedProcessor } from './processors/embed.processor';

@Module({
  imports: [SharedModule, QueuesModule],
  providers: [EmbedProcessor, ConceptProcessor, KnowledgeGraphService],
})
export class AiWorkerProcessorsModule {}
