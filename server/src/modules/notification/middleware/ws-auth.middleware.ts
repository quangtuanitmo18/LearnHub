import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Socket } from 'socket.io';

export interface AuthenticatedSocket extends Socket {
  userId: string;
  roles: string[];
}

@Injectable()
export class WsAuthMiddleware {
  private readonly logger = new Logger(WsAuthMiddleware.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Middleware function to authenticate WebSocket connections
   */
  use() {
    return async (socket: Socket, next: (err?: any) => void) => {
      try {
        const token = this.extractToken(socket);

        if (!token) {
          this.logger.warn(
            `Connection attempt without token from ${socket.id}`,
          );
          return next(new Error('Authentication token required'));
        }

        const payload = await this.verifyToken(token);

        if (!payload) {
          this.logger.warn(`Invalid token from ${socket.id}`);
          return next(new Error('Invalid authentication token'));
        }

        // Attach user info to socket
        const authenticatedSocket = socket as AuthenticatedSocket;
        authenticatedSocket.userId = payload.sub;
        authenticatedSocket.roles =
          payload.roles?.map((role: any) => role.name || role) || [];

        this.logger.log(
          `Authenticated socket ${socket.id} for user ${authenticatedSocket.userId} with roles: ${authenticatedSocket.roles.join(', ')}`,
        );

        next();
      } catch (error) {
        this.logger.error(`Authentication error: ${error.message}`);
        next(new Error('Authentication failed'));
      }
    };
  }

  /**
   * Extract JWT token from socket handshake
   */
  private extractToken(socket: Socket): string | null {
    // Try to get token from auth header
    const authHeader = socket.handshake.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Try to get token from query params
    const token = socket.handshake.query.token as string;
    if (token) {
      return token;
    }

    // Try to get token from auth object
    if (socket.handshake.auth?.token) {
      return socket.handshake.auth.token;
    }

    return null;
  }

  /**
   * Verify JWT token
   */
  private async verifyToken(token: string): Promise<any> {
    try {
      const secret =
        this.configService.get<string>('jwt.accessSecret') ||
        this.configService.get<string>('JWT_ACCESS_SECRET') ||
        'access-secret';
      return this.jwtService.verify(token, { secret });
    } catch (error) {
      this.logger.error(`Token verification failed: ${error.message}`);
      return null;
    }
  }
}
