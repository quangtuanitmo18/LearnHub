import { ApiService } from "@/lib/api-service";
import type {
  NotificationListResponse,
  NotificationCount,
  NotificationQueryParams,
  NotificationRecipient,
  MarkMultipleReadRequest,
  DeleteMultipleNotificationsRequest,
} from "@/types/notification";

const ENDPOINTS = {
  NOTIFICATIONS: "/notifications",
  COUNT: "/notifications/count",
  MARK_READ: (id: string) => `/notifications/${id}/read`,
  MARK_MULTIPLE_READ: "/notifications/mark-read",
  MARK_ALL_READ: "/notifications/mark-all-read",
  DELETE_ONE: (id: string) => `/notifications/${id}`,
  DELETE_MULTIPLE: "/notifications",
} as const;

export class NotificationService {
  /**
   * Get all notifications for the current user with pagination
   */
  static async getNotifications(
    params?: NotificationQueryParams
  ): Promise<NotificationListResponse> {
    return ApiService.get<NotificationListResponse>(ENDPOINTS.NOTIFICATIONS, {
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
      ...(params?.isRead !== undefined && { isRead: params.isRead }),
      ...(params?.type && { type: params.type }),
    });
  }

  /**
   * Get notification count (total and unread)
   */
  static async getNotificationCount(): Promise<NotificationCount> {
    return ApiService.get<NotificationCount>(ENDPOINTS.COUNT);
  }

  /**
   * Mark a single notification as read
   */
  static async markAsRead(recipientId: string): Promise<NotificationRecipient> {
    return ApiService.post<NotificationRecipient>(
      ENDPOINTS.MARK_READ(recipientId)
    );
  }

  /**
   * Mark multiple notifications as read
   */
  static async markMultipleAsRead(
    recipientIds: string[]
  ): Promise<{ count: number }> {
    return ApiService.post<{ count: number }, MarkMultipleReadRequest>(
      ENDPOINTS.MARK_MULTIPLE_READ,
      { recipientIds }
    );
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(): Promise<{ count: number }> {
    return ApiService.post<{ count: number }>(ENDPOINTS.MARK_ALL_READ);
  }

  /**
   * Delete a single notification
   */
  static async deleteNotification(
    recipientId: string
  ): Promise<NotificationRecipient> {
    return ApiService.delete<NotificationRecipient>(
      ENDPOINTS.DELETE_ONE(recipientId)
    );
  }

  /**
   * Delete multiple notifications
   */
  static async deleteMultipleNotifications(
    recipientIds: string[]
  ): Promise<{ count: number }> {
    return ApiService.delete<
      { count: number },
      DeleteMultipleNotificationsRequest
    >(ENDPOINTS.DELETE_MULTIPLE, { recipientIds });
  }
}

export default NotificationService;
