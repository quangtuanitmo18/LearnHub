import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EmailService, EmailQueueService, PdfService } from './services';
import { EmailProcessor } from './processors';
import { EMAIL_QUEUE } from './constants';

@Module({
  imports: [
    BullModule.registerQueue({
      name: EMAIL_QUEUE,
    }),
  ],
  providers: [EmailService, EmailQueueService, PdfService, EmailProcessor],
  exports: [EmailService, EmailQueueService, PdfService],
})
export class EmailModule {}
