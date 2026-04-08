import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { SharedModule } from 'src/shared/shared.module';
import { EmbedService } from './embed.service';

@Module({
  imports: [SharedModule, BullModule.registerQueue({ name: 'ai-embed' })],
  providers: [EmbedService],
  exports: [BullModule, EmbedService],
})
export class AiWorkerModule {}
