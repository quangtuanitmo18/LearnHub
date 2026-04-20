import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { QUEUE_NAMES } from './queue.constants';

/**
 * Centralized queue registration module.
 *
 * Import this module instead of calling BullModule.registerQueue()
 * in each feature module. This ensures each queue is registered
 * only once, preventing duplicate Redis connections.
 *
 * Each registerQueue() call creates 2-3 Redis connections.
 * Before this module, 'gamification' was registered 6 times = ~18 wasted connections.
 */
@Module({
  imports: [
    BullModule.registerQueue(
      { name: QUEUE_NAMES.GAMIFICATION },
      { name: QUEUE_NAMES.QUIZ_ATTEMPT },
      { name: QUEUE_NAMES.AUTH },
      { name: QUEUE_NAMES.EMAIL },
      { name: QUEUE_NAMES.ORDER },
      { name: QUEUE_NAMES.AI_EMBED },
      { name: QUEUE_NAMES.AI_CONCEPT },
      { name: QUEUE_NAMES.CONTEST },
    ),
  ],
  exports: [BullModule],
})
export class QueuesModule {}
