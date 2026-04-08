import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AiWorkerProcessorsModule } from '../modules/ai-worker/ai-worker-processors.module';
import { AuthWorkerModule } from '../modules/auth/auth-worker.module';
import { EmailWorkerModule } from '../modules/email/email-worker.module';
import { OrderWorkerModule } from '../modules/order/order-worker.module';
import { configuration } from '../shared/configs/configuration';
import { validate } from '../shared/configs/validation';

@Module({
  imports: [
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
          ...(configService.get('redis.tls') ? { tls: {} } : {}),
        },
      }),
      inject: [ConfigService],
    }),
    AuthWorkerModule,
    EmailWorkerModule,
    OrderWorkerModule,
    AiWorkerProcessorsModule,
  ],
})
export class WorkerAppModule {}
