import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import { PaginatedResponseDto } from 'src/shared/dto/pagination.dto';
import {
  NotificationType,
  NotificationQueryDto,
  NotificationResponseDto,
  NotificationCountDto,
} from './dto/notification.dto';

export interface CreateNotificationData {
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  recipientIds: string[];
}

@Injectable()
export class NotificationRepository {
  private readonly logger = new Logger(NotificationRepository.name);

  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Create a notification and send to multiple recipients
   */
  async createNotification(data: CreateNotificationData) {
    const notification = await this.prismaService.notification.create({
      data: {
        type: data.type as any,
        title: data.title,
        message: data.message,
        data: data.data || undefined,
        recipients: {
          create: data.recipientIds.map((userId) => ({
            userId,
          })),
        },
      },
      include: {
        recipients: {
          select: {
            id: true,
            userId: true,
            isRead: true,
          },
        },
      },
    });

    this.logger.log(
      `Created notification ${notification.id} for ${data.recipientIds.length} recipients`,
    );

    return notification;
  }

  /**
   * Create notification for all users
   */
  async createNotificationForAllUsers(
    data: Omit<CreateNotificationData, 'recipientIds'>,
  ) {
    // Get all active user IDs
    const users = await this.prismaService.user.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true },
    });

    const recipientIds = users.map((user) => user.id);

    if (recipientIds.length === 0) {
      this.logger.warn('No active users found for notification');
      return null;
    }

    return this.createNotification({
      ...data,
      recipientIds,
    });
  }

  /**
   * Create notification for admin users
   */
  async createNotificationForAdmins(
    data: Omit<CreateNotificationData, 'recipientIds'>,
  ) {
    // Get admin user IDs
    const adminUsers = await this.prismaService.user.findMany({
      where: {
        roles: {
          some: {
            name: { in: ['Admin', 'Super Admin'] },
          },
        },
      },
      select: { id: true },
    });

    const recipientIds = adminUsers.map((user) => user.id);

    if (recipientIds.length === 0) {
      this.logger.warn('No admin users found for notification');
      return null;
    }

    return this.createNotification({
      ...data,
      recipientIds,
    });
  }

  /**
   * Get user notifications with pagination
   */
  async getUserNotifications(
    userId: string,
    query: NotificationQueryDto,
  ): Promise<PaginatedResponseDto<NotificationResponseDto>> {
    const { page = 1, limit = 10, type, isRead } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      userId,
    };

    if (type) {
      where.notification = { type };
    }

    if (typeof isRead === 'boolean') {
      where.isRead = isRead;
    }

    const [recipients, total] = await Promise.all([
      this.prismaService.notificationRecipient.findMany({
        where,
        include: {
          notification: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prismaService.notificationRecipient.count({ where }),
    ]);

    const result: NotificationResponseDto[] = recipients.map((recipient) => ({
      id: recipient.id,
      notificationId: recipient.notificationId,
      type: recipient.notification.type as unknown as NotificationType,
      title: recipient.notification.title,
      message: recipient.notification.message,
      data: recipient.notification.data as Record<string, any> | undefined,
      isRead: recipient.isRead,
      readAt: recipient.readAt || undefined,
      createdAt: recipient.notification.createdAt,
    }));

    return new PaginatedResponseDto(result, total, page, limit);
  }

  /**
   * Get notification count for user
   */
  async getNotificationCount(userId: string): Promise<NotificationCountDto> {
    const [total, unread] = await Promise.all([
      this.prismaService.notificationRecipient.count({
        where: { userId },
      }),
      this.prismaService.notificationRecipient.count({
        where: { userId, isRead: false },
      }),
    ]);

    return { total, unread };
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(recipientId: string, userId: string) {
    const recipient = await this.prismaService.notificationRecipient.findFirst({
      where: { id: recipientId, userId },
    });

    if (!recipient) {
      throw new NotFoundException('Notification not found');
    }

    return this.prismaService.notificationRecipient.update({
      where: { id: recipientId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
      include: {
        notification: true,
      },
    });
  }

  /**
   * Mark multiple notifications as read
   */
  async markMultipleAsRead(recipientIds: string[], userId: string) {
    const result = await this.prismaService.notificationRecipient.updateMany({
      where: {
        id: { in: recipientIds },
        userId,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return { count: result.count };
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string) {
    const result = await this.prismaService.notificationRecipient.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    this.logger.log(
      `Marked ${result.count} notifications as read for user ${userId}`,
    );
    return { count: result.count };
  }

  /**
   * Delete a notification for a user (removes recipient entry)
   */
  async deleteNotification(recipientId: string, userId: string) {
    const recipient = await this.prismaService.notificationRecipient.findFirst({
      where: { id: recipientId, userId },
    });

    if (!recipient) {
      throw new NotFoundException('Notification not found');
    }

    await this.prismaService.notificationRecipient.delete({
      where: { id: recipientId },
    });

    return { success: true };
  }

  /**
   * Delete multiple notifications for a user
   */
  async deleteMultipleNotifications(recipientIds: string[], userId: string) {
    const result = await this.prismaService.notificationRecipient.deleteMany({
      where: {
        id: { in: recipientIds },
        userId,
      },
    });

    return { count: result.count };
  }

  /**
   * Get admin user IDs (for sending notifications)
   */
  async getAdminUserIds(): Promise<string[]> {
    const adminUsers = await this.prismaService.user.findMany({
      where: {
        roles: {
          some: {
            name: { in: ['Admin', 'Super Admin'] },
          },
        },
      },
      select: { id: true },
    });

    return adminUsers.map((user) => user.id);
  }

  /**
   * Get all active user IDs (for sending notifications)
   */
  async getAllActiveUserIds(): Promise<string[]> {
    const users = await this.prismaService.user.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true },
    });

    return users.map((user) => user.id);
  }
}
