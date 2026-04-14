import { Module } from '@nestjs/common';
import { SharedModule } from 'src/shared/shared.module';
import { QueuesModule } from 'src/shared/queues';
import { AuthProcessor } from './processors';

@Module({
  imports: [SharedModule, QueuesModule],
  providers: [AuthProcessor],
})
export class AuthWorkerModule {}
