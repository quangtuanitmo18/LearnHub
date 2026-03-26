import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SocketIOAdapter } from './modules/notification/adapters/socket-io.adapter';

// Enable BigInt serialization to JSON
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true, // Enable raw body for Stripe webhook signature verification
  });
  const configService = app.get(ConfigService);

  // Setup WebSocket adapter
  app.useWebSocketAdapter(new SocketIOAdapter(app, configService));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
    }),
  );

  // Set a global prefix for all routes.
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Enable API versioning with URI-based versioning and set default version to "1".
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: ['1'],
    // Uncomment the following line to set multiple default versions.
    // defaultVersion: ["1", "2"],
  });

  const port = configService.get<number>('PORT') || 3000;

  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`🔌 WebSocket server is running on: ws://localhost:${port}`);
}

bootstrap().catch((error) => {
  console.error('❌ Error starting the application:', error);
  process.exit(1);
});
