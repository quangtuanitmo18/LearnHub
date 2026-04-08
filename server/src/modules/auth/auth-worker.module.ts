import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { SharedModule } from 'src/shared/shared.module';
import { AUTH_QUEUE } from './constants';
import { AuthProcessor } from './processors';

@Module({
  imports: [
    SharedModule,
    BullModule.registerQueue({
      name: AUTH_QUEUE,
    }),
  ],
  providers: [AuthProcessor],
})
export class AuthWorkerModule {}
