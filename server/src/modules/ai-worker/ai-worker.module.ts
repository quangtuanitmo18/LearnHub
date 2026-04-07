import { BullModule } from '@nestjs/bullmq';
import { Module, forwardRef } from '@nestjs/common';
import { SharedModule } from 'src/shared/shared.module';
import { ChatModule } from '../chat/chat.module';
import { EmbedService } from './embed.service';
import { ConceptProcessor } from './processors/concept.processor';
import { EmbedProcessor } from './processors/embed.processor';

@Module({
  imports: [
    SharedModule,
    forwardRef(() => ChatModule),
    BullModule.registerQueue({ name: 'ai-embed' }, { name: 'ai-concept' }),
  ],
  providers: [EmbedProcessor, ConceptProcessor, EmbedService],
  exports: [BullModule, EmbedService],
})
export class AiWorkerModule {}
