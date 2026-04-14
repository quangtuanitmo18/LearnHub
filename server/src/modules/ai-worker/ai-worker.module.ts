import { Module } from '@nestjs/common';
import { SharedModule } from 'src/shared/shared.module';
import { QueuesModule } from 'src/shared/queues';
import { EmbedService } from './embed.service';

@Module({
  imports: [SharedModule, QueuesModule],
  providers: [EmbedService],
  exports: [EmbedService],
})
export class AiWorkerModule {}
