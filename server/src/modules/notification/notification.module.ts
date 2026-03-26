import { Module, Global } from '@nestjs/common';

import { NotificationService } from './notification.service';
import { WsAuthMiddleware } from './middleware/ws-auth.middleware';
import { NotificationGateway } from './notification.gateway';
import { NotificationRepository } from './notification.repository';
import { NotificationController } from './notification.controller';

@Global()
@Module({
  controllers: [NotificationController],
  providers: [
    NotificationGateway,
    NotificationService,
    NotificationRepository,
    WsAuthMiddleware,
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
