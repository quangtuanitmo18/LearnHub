import { Module } from '@nestjs/common';
import { QueuesModule } from 'src/shared/queues';
import AuthController from './auth.controller';
import { AuthService } from './auth.service';
import { EmailModule } from '../email/email.module';
import { AuthQueueService } from './services';

@Module({
  imports: [EmailModule, QueuesModule],
  controllers: [AuthController],
  providers: [AuthService, AuthQueueService],
  exports: [AuthQueueService],
})
export class AuthModule {}
