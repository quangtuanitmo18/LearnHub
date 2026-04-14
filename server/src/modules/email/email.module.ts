import { Module } from '@nestjs/common';
import { QueuesModule } from 'src/shared/queues';
import { EmailService, EmailQueueService, PdfService } from './services';

@Module({
  imports: [QueuesModule],
  providers: [EmailService, EmailQueueService, PdfService],
  exports: [EmailService, EmailQueueService, PdfService],
})
export class EmailModule {}
