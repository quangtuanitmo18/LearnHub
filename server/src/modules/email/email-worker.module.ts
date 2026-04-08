import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { SharedModule } from 'src/shared/shared.module';
import { EMAIL_QUEUE } from './constants';
import { EmailProcessor } from './processors';
import { EmailService, PdfService } from './services';

@Module({
  imports: [
    SharedModule,
    BullModule.registerQueue({
      name: EMAIL_QUEUE,
    }),
  ],
  providers: [EmailService, PdfService, EmailProcessor],
})
export class EmailWorkerModule {}
