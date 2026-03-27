'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  connectNotificationSocket,
  disconnectNotificationSocket,
  SOCKET_EVENTS,
} from '@/lib/socket';
import { useIsAuthenticated } from '@/stores/auth-store';
import { notificationKeys } from '@/hooks/use-notifications';
import type { NotificationCount } from '@/types/notification';

// Types for socket events based on BE response
export interface NewCourseEvent {
  courseId: string;
  title: string;
  slug: string;
  description: string;
  image: string;
  authorName: string;
  price: number;
  isFree: boolean;
}

export interface NotificationCountEvent {
  total: number;
  unread: number;
}

interface UseSocketNotificationsOptions {
  onNewCourse?: (data: NewCourseEvent) => void;
  onNotificationCount?: (data: NotificationCountEvent) => void;
  showToasts?: boolean;
}

/**
 * Hook to manage real-time notifications via Socket.IO
 */
export function useSocketNotifications(options: UseSocketNotificationsOptions = {}) {
  const { onNewCourse, onNotificationCount, showToasts = true } = options;

  const queryClient = useQueryClient();
  const isAuthenticated = useIsAuthenticated();
  const socketConnectedRef = useRef(false);

  // Get access token from localStorage
  const getAccessToken = useCallback(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  }, []);

  // Handle notification count update
  const handleNotificationCount = useCallback(
    (data: NotificationCountEvent) => {
      // Update the cache directly for instant UI update
      queryClient.setQueryData<NotificationCount>(notificationKeys.count, (old) => ({
        total: data.total ?? old?.total ?? 0,
        unread: data.unread ?? old?.unread ?? 0,
      }));

      // Call custom handler if provided
      onNotificationCount?.(data);
    },
    [queryClient, onNotificationCount],
  );

  // Handle new course notification
  const handleNewCourse = useCallback(
    (data: NewCourseEvent) => {
      // Invalidate notifications to fetch the new one
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });

      // Show toast notification
      // if (showToasts) {
      //   toast.info(`New course: ${data.title}`, {
      //     description: `By ${data.authorName}`,
      //     action: data.slug
      //       ? {
      //           label: "View",
      //           onClick: () => {
      //             window.location.href = `/courses/${data.slug}`;
      //           },
      //         }
      //       : undefined,
      //   });
      // }

      // Call custom handler if provided
      onNewCourse?.(data);
    },
    [queryClient, showToasts, onNewCourse],
  );

  // Handle new generic notification
  const handleNewNotification = useCallback(() => {
    // Invalidate all notification queries to refetch
    queryClient.invalidateQueries({ queryKey: notificationKeys.all });
  }, [queryClient]);

  // Connect and setup socket listeners
  useEffect(() => {
    if (!isAuthenticated) {
      // Disconnect if not authenticated
      if (socketConnectedRef.current) {
        disconnectNotificationSocket();
        socketConnectedRef.current = false;
      }
      return;
    }

    const accessToken = getAccessToken();
    const socket = connectNotificationSocket(accessToken || undefined);

    // Connection event handlers
    socket.on(SOCKET_EVENTS.CONNECT, () => {
      console.log('[Socket] Connected to notification server');
      socketConnectedRef.current = true;
    });

    socket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
      console.log('[Socket] Disconnected:', reason);
      socketConnectedRef.current = false;
    });

    socket.on(SOCKET_EVENTS.CONNECT_ERROR, (error) => {
      console.error('[Socket] Connection error:', error.message);
    });

    // Notification event handlers
    socket.on(SOCKET_EVENTS.NOTIFICATION_COUNT, handleNotificationCount);
    socket.on(SOCKET_EVENTS.NEW_COURSE, handleNewCourse);
    socket.on(SOCKET_EVENTS.NEW_NOTIFICATION, handleNewNotification);

    // Cleanup on unmount
    return () => {
      socket.off(SOCKET_EVENTS.CONNECT);
      socket.off(SOCKET_EVENTS.DISCONNECT);
      socket.off(SOCKET_EVENTS.CONNECT_ERROR);
      socket.off(SOCKET_EVENTS.NOTIFICATION_COUNT);
      socket.off(SOCKET_EVENTS.NEW_COURSE);
      socket.off(SOCKET_EVENTS.NEW_NOTIFICATION);
    };
  }, [
    isAuthenticated,
    getAccessToken,
    handleNotificationCount,
    handleNewCourse,
    handleNewNotification,
  ]);

  // Disconnect on unmount
  useEffect(() => {
    return () => {
      disconnectNotificationSocket();
      socketConnectedRef.current = false;
    };
  }, []);

  return {
    isConnected: socketConnectedRef.current,
  };
}
