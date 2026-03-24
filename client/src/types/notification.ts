// Notification types and interfaces

import { ListResponse } from "./common";

export type NotificationType =
  | "SYSTEM"
  | "COURSE"
  | "ORDER"
  | "COMMENT"
  | "BADGE"
  | "PROMOTION"
  | "REMINDER"
  | "NEW_COURSE";

// Course data structure in notification
export interface NotificationCourseData {
  authorName: string;
  courseId: string;
  description: string;
  image: string;
  isFree: boolean;
  price: number;
  slug: string;
  title: string;
}

// Notification structure from BE (flattened)
export interface NotificationRecipient {
  id: string;
  notificationId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  data?: NotificationCourseData | Record<string, unknown>;
}

export interface NotificationQueryParams {
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: NotificationType;
}

export type NotificationListResponse = ListResponse<NotificationRecipient>;

export interface NotificationCount {
  total: number;
  unread: number;
}

export interface MarkMultipleReadRequest {
  recipientIds: string[];
}

export interface DeleteMultipleNotificationsRequest {
  recipientIds: string[];
}
