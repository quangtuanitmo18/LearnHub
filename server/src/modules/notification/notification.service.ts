import { Injectable, Logger } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';
import { NotificationRepository } from './notification.repository';
import { NotificationType, NotificationQueryDto } from './dto/notification.dto';

export interface NewCourseNotification {
  courseId: string;
  title: string;
  slug: string;
  description?: string;
  image?: string;
  authorName?: string;
  price?: number;
  isFree?: boolean;
}

export interface PaymentSuccessNotification {
  orderId: string;
  orderCode: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  totalAmount: number;
  orderType: 'COURSE' | 'MEMBERSHIP';
  items?: Array<{ title: string; price: number }>;
}

export interface GenericNotification {
  title: string;
  message: string;
  type?: NotificationType;
  data?: any;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly notificationGateway: NotificationGateway,
    private readonly notificationRepository: NotificationRepository,
  ) {}

  // ==================== NOTIFICATION QUERIES ====================

  /**
   * Get user notifications with pagination
   */
  async getUserNotifications(userId: string, query: NotificationQueryDto) {
    return this.notificationRepository.getUserNotifications(userId, query);
  }

  /**
   * Get notification count for user
   */
  async getNotificationCount(userId: string) {
    return this.notificationRepository.getNotificationCount(userId);
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(recipientId: string, userId: string) {
    const result = await this.notificationRepository.markAsRead(
      recipientId,
      userId,
    );

    // Send real-time update to user
    this.notificationGateway.sendToUser(userId, 'notification-read', {
      recipientId,
      isRead: true,
      readAt: result.readAt,
    });

    return result;
  }

  /**
   * Mark multiple notifications as read
   */
  async markMultipleAsRead(recipientIds: string[], userId: string) {
    const result = await this.notificationRepository.markMultipleAsRead(
      recipientIds,
      userId,
    );

    // Send real-time update to user
    this.notificationGateway.sendToUser(userId, 'notifications-read', {
      recipientIds,
      count: result.count,
    });

    return result;
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string) {
    const result = await this.notificationRepository.markAllAsRead(userId);

    // Send real-time update to user
    this.notificationGateway.sendToUser(userId, 'all-notifications-read', {
      count: result.count,
    });

    return result;
  }

  /**
   * Delete a notification for a user
   */
  async deleteNotification(recipientId: string, userId: string) {
    const result = await this.notificationRepository.deleteNotification(
      recipientId,
      userId,
    );

    // Send real-time update to user
    this.notificationGateway.sendToUser(userId, 'notification-deleted', {
      recipientId,
    });

    return result;
  }

  /**
   * Delete multiple notifications for a user
   */
  async deleteMultipleNotifications(recipientIds: string[], userId: string) {
    const result =
      await this.notificationRepository.deleteMultipleNotifications(
        recipientIds,
        userId,
      );

    // Send real-time update to user
    this.notificationGateway.sendToUser(userId, 'notifications-deleted', {
      recipientIds,
      count: result.count,
    });

    return result;
  }

  // ==================== NOTIFICATION TRIGGERS ====================

  /**
   * Notify all users about a new public course
   * This is triggered when an admin creates a course with PUBLISHED status
   */
  async notifyNewCourse(course: NewCourseNotification) {
    const notificationData = {
      type: NotificationType.COURSE,
      title: 'New Course Available! 🎉',
      message: `A new course "${course.title}" is now available!`,
      data: {
        courseId: course.courseId,
        title: course.title,
        slug: course.slug,
        description: course.description,
        image: course.image,
        authorName: course.authorName,
        price: course.price,
        isFree: course.isFree,
      },
    };

    // Save to database for all users
    const notification =
      await this.notificationRepository.createNotificationForAllUsers(
        notificationData,
      );

    if (notification) {
      // Send real-time notification to all connected users
      const payload = {
        id: notification.id,
        ...notificationData,
        isRead: false,
        createdAt: notification.createdAt.toISOString(),
      };

      this.notificationGateway.sendToAll('notification', payload);
      this.notificationGateway.sendToAll('new-course', notificationData.data);

      // Send updated unread count to each recipient
      for (const recipient of notification.recipients) {
        const count = await this.notificationRepository.getNotificationCount(
          recipient.userId,
        );
        this.notificationGateway.sendToUser(
          recipient.userId,
          'notification-count',
          count,
        );
      }
    }

    this.logger.log(`New course notification sent: ${course.title}`);
  }

  /**
   * Notify admins about a successful payment
   * This is triggered when a user completes a payment
   */
  async notifyPaymentSuccess(payment: PaymentSuccessNotification) {
    const notificationData = {
      type: NotificationType.PAYMENT,
      title: 'Payment Received! 💰',
      message: `User ${payment.userName || payment.userEmail} completed a ${payment.orderType.toLowerCase()} purchase`,
      data: {
        orderId: payment.orderId,
        orderCode: payment.orderCode,
        userId: payment.userId,
        userName: payment.userName,
        userEmail: payment.userEmail,
        totalAmount: payment.totalAmount,
        orderType: payment.orderType,
        items: payment.items,
      },
    };

    // Save to database for admin users
    const notification =
      await this.notificationRepository.createNotificationForAdmins(
        notificationData,
      );

    if (notification) {
      // Send real-time notification to admin users
      const payload = {
        id: notification.id,
        ...notificationData,
        isRead: false,
        createdAt: notification.createdAt.toISOString(),
      };

      this.notificationGateway.sendToAdmins('notification', payload);
      this.notificationGateway.sendToAdmins(
        'payment-success',
        notificationData.data,
      );

      // Send updated unread count to each admin
      for (const recipient of notification.recipients) {
        const count = await this.notificationRepository.getNotificationCount(
          recipient.userId,
        );
        this.notificationGateway.sendToUser(
          recipient.userId,
          'notification-count',
          count,
        );
      }
    }

    this.logger.log(
      `Payment success notification sent to admins: Order ${payment.orderCode}`,
    );
  }

  /**
   * Send a notification to a specific user
   */
  async notifyUser(userId: string, notification: GenericNotification) {
    const notificationData = {
      type: notification.type || NotificationType.SYSTEM,
      title: notification.title,
      message: notification.message,
      data: notification.data,
    };

    // Save to database
    const savedNotification =
      await this.notificationRepository.createNotification({
        ...notificationData,
        recipientIds: [userId],
      });

    // Send real-time notification
    const payload = {
      id: savedNotification.id,
      recipientId: savedNotification.recipients[0]?.id,
      ...notificationData,
      isRead: false,
      createdAt: savedNotification.createdAt.toISOString(),
    };

    this.notificationGateway.sendToUser(userId, 'notification', payload);

    // Send updated unread count
    const count =
      await this.notificationRepository.getNotificationCount(userId);
    this.notificationGateway.sendToUser(userId, 'notification-count', count);

    this.logger.log(
      `Notification sent to user ${userId}: ${notification.title}`,
    );
  }

  /**
   * Send a notification to multiple users
   */
  async notifyUsers(userIds: string[], notification: GenericNotification) {
    const notificationData = {
      type: notification.type || NotificationType.SYSTEM,
      title: notification.title,
      message: notification.message,
      data: notification.data,
    };

    // Save to database
    const savedNotification =
      await this.notificationRepository.createNotification({
        ...notificationData,
        recipientIds: userIds,
      });

    // Send real-time notification to each user
    for (const recipient of savedNotification.recipients) {
      const payload = {
        id: savedNotification.id,
        recipientId: recipient.id,
        ...notificationData,
        isRead: false,
        createdAt: savedNotification.createdAt.toISOString(),
      };

      this.notificationGateway.sendToUser(
        recipient.userId,
        'notification',
        payload,
      );

      // Send updated unread count
      const count = await this.notificationRepository.getNotificationCount(
        recipient.userId,
      );
      this.notificationGateway.sendToUser(
        recipient.userId,
        'notification-count',
        count,
      );
    }

    this.logger.log(
      `Notification sent to ${userIds.length} users: ${notification.title}`,
    );
  }

  /**
   * Send a notification to all admins
   */
  async notifyAdmins(notification: GenericNotification) {
    const notificationData = {
      type: notification.type || NotificationType.SYSTEM,
      title: notification.title,
      message: notification.message,
      data: notification.data,
    };

    // Save to database for admin users
    const savedNotification =
      await this.notificationRepository.createNotificationForAdmins(
        notificationData,
      );

    if (savedNotification) {
      const payload = {
        id: savedNotification.id,
        ...notificationData,
        isRead: false,
        createdAt: savedNotification.createdAt.toISOString(),
      };

      this.notificationGateway.sendToAdmins('notification', payload);

      // Send updated unread count to each admin
      for (const recipient of savedNotification.recipients) {
        const count = await this.notificationRepository.getNotificationCount(
          recipient.userId,
        );
        this.notificationGateway.sendToUser(
          recipient.userId,
          'notification-count',
          count,
        );
      }
    }

    this.logger.log(`Notification sent to admins: ${notification.title}`);
  }

  /**
   * Broadcast a notification to all authenticated users
   */
  async broadcast(notification: GenericNotification) {
    const notificationData = {
      type: notification.type || NotificationType.SYSTEM,
      title: notification.title,
      message: notification.message,
      data: notification.data,
    };

    // Save to database for all users
    const savedNotification =
      await this.notificationRepository.createNotificationForAllUsers(
        notificationData,
      );

    if (savedNotification) {
      const payload = {
        id: savedNotification.id,
        ...notificationData,
        isRead: false,
        createdAt: savedNotification.createdAt.toISOString(),
      };

      this.notificationGateway.sendToAll('notification', payload);

      // Note: For performance, we don't send individual counts for broadcasts
      // The frontend should fetch the count when needed
    }

    this.logger.log(`Broadcast notification: ${notification.title}`);
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get the number of connected clients
   */
  getConnectedClientsCount(): number {
    return this.notificationGateway.getConnectedClientsCount();
  }

  /**
   * Get information about connected clients
   */
  getConnectedClients() {
    return this.notificationGateway.getConnectedClients();
  }
}
