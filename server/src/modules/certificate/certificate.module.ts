import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { QueuesModule } from 'src/shared/queues';
import { CertificateService } from './certificate.service';
import { CertificateController } from './certificate.controller';
import { CertificatePdfService } from './certificate-pdf.service';

@Module({
  imports: [ConfigModule, QueuesModule],
  controllers: [CertificateController],
  providers: [CertificateService, CertificatePdfService],
})
export class CertificateModule {}
