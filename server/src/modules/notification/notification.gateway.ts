import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import {
  AuthenticatedSocket,
  WsAuthMiddleware,
} from './middleware/ws-auth.middleware';

interface ConnectedClient {
  socket: AuthenticatedSocket;
  userId: string;
  roles: string[];
}

@WebSocketGateway({
  namespace: '/notifications',
})
export class NotificationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationGateway.name);
  private connectedClients: Map<string, ConnectedClient> = new Map();

  constructor(private readonly wsAuthMiddleware: WsAuthMiddleware) {}

  afterInit(server: Server) {
    // Apply authentication middleware
    const authMiddleware = this.wsAuthMiddleware.use();
    server.use((socket, next) => {
      void authMiddleware(socket, next);
    });
  }

  handleConnection(client: AuthenticatedSocket) {
    try {
      const userId = client.userId;
      const roles = client.roles;

      // Store client connection info
      this.connectedClients.set(client.id, {
        socket: client,
        userId,
        roles,
      });

      // Join user-specific room
      client.join(`user:${userId}`);

      // Join role-based rooms
      roles.forEach((role: string) => {
        client.join(`role:${role}`);
      });

      // Join general room for all authenticated users
      client.join('authenticated');

      // Send connection confirmation
      client.emit('connected', {
        message: 'Successfully connected to notification service',
        userId,
        roles,
      });
    } catch (error) {
      this.logger.error(`Error during connection: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    const clientInfo = this.connectedClients.get(client.id);

    if (clientInfo) {
      this.connectedClients.delete(client.id);
    }
  }

  /**
   * Send notification to a specific user
   */
  sendToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  /**
   * Send notification to users with specific role
   */
  sendToRole(role: string, event: string, data: any) {
    this.server.to(`role:${role}`).emit(event, data);
  }

  /**
   * Send notification to all authenticated users
   */
  sendToAll(event: string, data: any) {
    this.server.to('authenticated').emit(event, data);
  }

  /**
   * Send notification to all admin users (Admin and Super Admin)
   */
  sendToAdmins(event: string, data: any) {
    this.server.to('role:Admin').to('role:Super Admin').emit(event, data);
  }

  /**
   * Get count of connected clients
   */
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  /**
   * Get connected clients info
   */
  getConnectedClients(): { userId: string; roles: string[] }[] {
    return Array.from(this.connectedClients.values()).map((client) => ({
      userId: client.userId,
      roles: client.roles,
    }));
  }

  /**
   * Handle ping from clients to keep connection alive
   */
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: AuthenticatedSocket) {
    client.emit('pong', { timestamp: new Date().toISOString() });
  }

  /**
   * Handle subscription to specific notification types
   */
  @SubscribeMessage('subscribe')
  handleSubscribe(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { channel: string },
  ) {
    if (data.channel) {
      client.join(data.channel);
      return { success: true, channel: data.channel };
    }
    return { success: false, message: 'Channel name required' };
  }

  /**
   * Handle unsubscription from notification types
   */
  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { channel: string },
  ) {
    if (data.channel) {
      client.leave(data.channel);
      return { success: true, channel: data.channel };
    }
    return { success: false, message: 'Channel name required' };
  }
}
