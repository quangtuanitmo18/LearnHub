import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { CertificateService } from './certificate.service';
import { CertificateController } from './certificate.controller';
import { CertificatePdfService } from './certificate-pdf.service';

@Module({
  imports: [ConfigModule, BullModule.registerQueue({ name: 'gamification' })],
  controllers: [CertificateController],
  providers: [CertificateService, CertificatePdfService],
})
export class CertificateModule {}
