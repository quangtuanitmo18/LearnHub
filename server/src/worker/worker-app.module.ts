import { BullModule } from '@nestjs/bullmq';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-ioredis-yet';
import { AiWorkerProcessorsModule } from '../modules/ai-worker/ai-worker-processors.module';
import { AuthWorkerModule } from '../modules/auth/auth-worker.module';
import { EmailWorkerModule } from '../modules/email/email-worker.module';
import { GamificationWorkerModule } from '../modules/gamification/gamification-worker.module';
import { NotificationModule } from '../modules/notification/notification.module';
import { OrderWorkerModule } from '../modules/order/order-worker.module';
import { QuizAttemptWorkerModule } from '../modules/quiz-attempt/quiz-attempt-worker.module';
import { ContestWorkerModule } from '../modules/contest/contest-worker.module';
import { configuration } from '../shared/configs/configuration';
import { validate } from '../shared/configs/validation';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    SharedModule,
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      load: [configuration],
      validate,
      isGlobal: true,
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('redis.host'),
          port: configService.get('redis.port'),
          password: configService.get('redis.password'),
          maxRetriesPerRequest: 3,
          enableReadyCheck: false,
          ...(configService.get('redis.tls') ? { tls: {} } : {}),
        },
      }),
      inject: [ConfigService],
    }),
    // Global CacheModule for worker (used by GamificationService, QuizAttemptService)
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          host: configService.get('redis.host'),
          port: configService.get('redis.port'),
          password: configService.get('redis.password'),
          ...(configService.get('redis.tls') ? { tls: {} } : {}),
          ttl: 300000,
        }),
      }),
      inject: [ConfigService],
    }),
    // NotificationModule is @Global in main app but needs explicit import in worker
    NotificationModule,
    // Worker processor modules
    AuthWorkerModule,
    EmailWorkerModule,
    OrderWorkerModule,
    GamificationWorkerModule,
    QuizAttemptWorkerModule,
    AiWorkerProcessorsModule,
    ContestWorkerModule,
  ],
})
export class WorkerAppModule {}
