import { INestApplicationContext, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';

export class SocketIOAdapter extends IoAdapter {
  private readonly logger = new Logger(SocketIOAdapter.name);

  constructor(
    private app: INestApplicationContext,
    private configService: ConfigService,
  ) {
    super(app);
  }

  createIOServer(port: number, options?: Partial<ServerOptions>): any {
    // Get CORS configuration from env (same as main.ts)
    const corsOrigin =
      this.configService.get<string>('CORS_ORIGIN') || 'http://localhost:4000';
    const origins = corsOrigin.split(',').map((o) => o.trim());

    const serverOptions: Partial<ServerOptions> = {
      ...options,
      cors: {
        origin: origins,
        credentials: true,
        methods: ['GET', 'POST'],
      },
      // Connection timeout
      connectTimeout: 10000,
      // Ping timeout
      pingTimeout: 5000,
      pingInterval: 10000,
      // Transports
      transports: ['websocket', 'polling'],
      // Allow upgrades
      allowUpgrades: true,
    };

    const server = super.createIOServer(port, serverOptions);

    this.logger.log('Socket.IO server created with custom adapter');
    this.logger.log(`CORS origin: ${corsOrigin}`);

    // Global connection handler
    server.on('connection', (socket) => {
      this.logger.log(`Client connected: ${socket.id}`);

      socket.on('disconnect', (reason) => {
        this.logger.log(
          `Client disconnected: ${socket.id} - Reason: ${reason}`,
        );
      });

      socket.on('error', (error) => {
        this.logger.error(`Socket error on ${socket.id}: ${error.message}`);
      });
    });

    return server;
  }
}
