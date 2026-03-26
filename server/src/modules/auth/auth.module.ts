import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import AuthController from './auth.controller';
import { AuthService } from './auth.service';
import { EmailModule } from '../email/email.module';
import { AUTH_QUEUE } from './constants';
import { AuthQueueService } from './services';
import { AuthProcessor } from './processors';

@Module({
  imports: [
    EmailModule,
    BullModule.registerQueue({
      name: AUTH_QUEUE,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthQueueService, AuthProcessor],
  exports: [AuthQueueService],
})
export class AuthModule {}
