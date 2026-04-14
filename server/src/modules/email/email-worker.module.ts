import { Module } from '@nestjs/common';
import { SharedModule } from 'src/shared/shared.module';
import { QueuesModule } from 'src/shared/queues';
import { EmailProcessor } from './processors';
import { EmailService, PdfService } from './services';

@Module({
  imports: [SharedModule, QueuesModule],
  providers: [EmailService, PdfService, EmailProcessor],
})
export class EmailWorkerModule {}
