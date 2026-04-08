import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { WorkerAppModule } from './worker/worker-app.module';

async function bootstrap() {
  const logger = new Logger('WorkerBootstrap');
  const app = await NestFactory.createApplicationContext(WorkerAppModule);

  const shutdown = async (signal: string) => {
    logger.log(`Received ${signal}, shutting down worker...`);
    await app.close();
    process.exit(0);
  };

  process.on('SIGINT', () => {
    void shutdown('SIGINT');
  });
  process.on('SIGTERM', () => {
    void shutdown('SIGTERM');
  });

  logger.log('BullMQ worker process is running');
}

bootstrap().catch((error) => {
  console.error('Failed to start worker process:', error);
  process.exit(1);
});
