"use client";

import NotificationService from "@/services/notifications";
import type { NotificationQueryParams } from "@/types/notification";
import {
  useMutation,
  useQuery,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

// Query keys for notifications
export const notificationKeys = {
  all: ["notifications"] as const,
  list: (params?: NotificationQueryParams) =>
    ["notifications", "list", params] as const,
  count: ["notifications", "count"] as const,
} as const;

// Hook to get notifications list
export function useNotifications(
  params?: NotificationQueryParams,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => NotificationService.getNotifications(params),
    enabled: options?.enabled ?? true,
  });
}

// Hook to get notifications list with infinite scroll
export function useInfiniteNotifications(
  params?: Omit<NotificationQueryParams, "page">,
  options?: { enabled?: boolean }
) {
  return useInfiniteQuery({
    queryKey: notificationKeys.list(params),
    queryFn: ({ pageParam = 1 }) =>
      NotificationService.getNotifications({
        ...params,
        page: pageParam,
        limit: params?.limit ?? 10,
      }),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.meta;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: options?.enabled ?? true,
  });
}

// Hook to get notification count
export function useNotificationCount(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: notificationKeys.count,
    queryFn: NotificationService.getNotificationCount,
    enabled: options?.enabled ?? true,
  });
}

// Hook to mark single notification as read
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recipientId: string) =>
      NotificationService.markAsRead(recipientId),
    onSuccess: () => {
      // Invalidate notifications cache to refetch fresh data
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to mark notification as read");
    },
  });
}

// Hook to mark multiple notifications as read
export function useMarkMultipleNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recipientIds: string[]) =>
      NotificationService.markMultipleAsRead(recipientIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to mark notifications as read");
    },
  });
}

// Hook to mark all notifications as read
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: NotificationService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      toast.success("All notifications marked as read");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to mark all notifications as read");
    },
  });
}

// Hook to delete single notification
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recipientId: string) =>
      NotificationService.deleteNotification(recipientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      toast.success("Notification deleted");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to delete notification");
    },
  });
}

// Hook to delete multiple notifications
export function useDeleteMultipleNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recipientIds: string[]) =>
      NotificationService.deleteMultipleNotifications(recipientIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      toast.success("Notifications deleted");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to delete notifications");
    },
  });
}
