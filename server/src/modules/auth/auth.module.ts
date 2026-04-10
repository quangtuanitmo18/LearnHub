import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import AuthController from './auth.controller';
import { AuthService } from './auth.service';
import { EmailModule } from '../email/email.module';
import { AUTH_QUEUE } from './constants';
import { AuthQueueService } from './services';

@Module({
  imports: [
    EmailModule,
    BullModule.registerQueue({ name: AUTH_QUEUE }, { name: 'gamification' }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthQueueService],
  exports: [AuthQueueService],
})
export class AuthModule {}
