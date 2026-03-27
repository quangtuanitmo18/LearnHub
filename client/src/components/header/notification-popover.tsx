'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useInfiniteNotifications,
  useNotificationCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
} from '@/hooks/use-notifications';
import { useSocketNotifications } from '@/hooks/use-socket-notifications';
import { useIsAuthenticated } from '@/stores/auth-store';
import { cn } from '@/lib/utils';
import type { NotificationRecipient, NotificationType } from '@/types/notification';
import {
  Bell,
  Check,
  CheckCheck,
  Gift,
  Mail,
  MessageSquare,
  MoreVertical,
  Package,
  ShoppingBag,
  Sparkles,
  Trash2,
  Trophy,
  X,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import useSound from 'use-sound';

// Icon mapping for notification types
const notificationIcons: Record<NotificationType, React.ReactNode> = {
  SYSTEM: <Bell className="h-4 w-4 text-blue-500" />,
  COURSE: <Package className="h-4 w-4 text-purple-500" />,
  ORDER: <ShoppingBag className="h-4 w-4 text-green-500" />,
  COMMENT: <MessageSquare className="h-4 w-4 text-orange-500" />,
  BADGE: <Trophy className="h-4 w-4 text-yellow-500" />,
  PROMOTION: <Gift className="h-4 w-4 text-pink-500" />,
  REMINDER: <Sparkles className="h-4 w-4 text-cyan-500" />,
  NEW_COURSE: <Package className="h-4 w-4 text-purple-500" />,
};

// Background color mapping for notification types
const notificationBgColors: Record<NotificationType, string> = {
  SYSTEM: 'bg-blue-50',
  COURSE: 'bg-purple-50',
  ORDER: 'bg-green-50',
  COMMENT: 'bg-orange-50',
  BADGE: 'bg-yellow-50',
  PROMOTION: 'bg-pink-50',
  REMINDER: 'bg-cyan-50',
  NEW_COURSE: 'bg-purple-50',
};

interface NotificationItemProps {
  notification: NotificationRecipient;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  isMarkingAsRead: boolean;
  isDeleting: boolean;
}

function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  isMarkingAsRead,
  isDeleting,
}: NotificationItemProps) {
  const { id, isRead, title, message, type, createdAt, data } = notification;
  const timeAgo = formatDistanceToNow(new Date(createdAt), {
    addSuffix: false,
  });

  // Generate action URL for NEW_COURSE type
  const actionUrl =
    type === 'NEW_COURSE' && data && 'slug' in data ? `/courses/${data.slug}` : undefined;

  return (
    <div
      className={cn(
        'flex items-start gap-3 border-b border-gray-100 p-3 transition-colors last:border-b-0 hover:bg-gray-50',
        !isRead && 'bg-blue-50/30',
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
          notificationBgColors[type] || 'bg-gray-50',
        )}
      >
        {notificationIcons[type] || <Bell className="h-4 w-4 text-gray-500" />}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        {actionUrl ? (
          <Link href={actionUrl} className="group block">
            <p className="line-clamp-1 text-sm font-medium text-gray-900 transition-colors group-hover:text-blue-600">
              {title}
            </p>
            <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">{message}</p>
          </Link>
        ) : (
          <>
            <p className="line-clamp-1 text-sm font-medium text-gray-900">{title}</p>
            <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">{message}</p>
          </>
        )}
        <p className="mt-1 text-xs text-gray-400">{timeAgo}</p>
      </div>

      {/* Status & Actions */}
      <div className="flex shrink-0 items-center gap-2">
        {/* Unread indicator */}
        {!isRead && (
          <Badge
            variant="outline"
            className="h-5 border-red-200 bg-red-50 px-1.5 py-0 text-[10px] text-red-500"
          >
            <span className="mr-1 h-1.5 w-1.5 rounded-full bg-red-500" />
            Unread
          </Badge>
        )}

        {/* Actions dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-gray-400 hover:text-gray-600"
              disabled={isMarkingAsRead || isDeleting}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            {!isRead && (
              <DropdownMenuItem
                onClick={() => onMarkAsRead(id)}
                disabled={isMarkingAsRead}
                className="cursor-pointer"
              >
                <Check className="mr-2 h-4 w-4" />
                Mark read
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => onDelete(id)}
              disabled={isDeleting}
              className="cursor-pointer text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function NotificationSkeleton() {
  return (
    <div className="flex items-start gap-3 p-3">
      <Skeleton className="h-9 w-9 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
  );
}

function EmptyNotifications() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-12">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
        <Mail className="h-8 w-8 text-gray-400" />
      </div>
      <p className="mb-1 text-sm font-medium text-gray-900">No notifications</p>
      <p className="text-center text-xs text-gray-500">
        You&apos;re all caught up! Check back later for updates.
      </p>
    </div>
  );
}

function UnauthenticatedState() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-12">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
        <Bell className="h-8 w-8 text-gray-400" />
      </div>
      <p className="mb-1 text-sm font-medium text-gray-900">Sign in to view notifications</p>
      <p className="text-center text-xs text-gray-500">
        Stay updated with your courses and activities
      </p>
    </div>
  );
}

export default function NotificationPopover() {
  const [open, setOpen] = useState(false);
  const [isRinging, setIsRinging] = useState(false);
  const isAuthenticated = useIsAuthenticated();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const previousUnreadCountRef = useRef<number | null>(null);
  const isInitialLoadRef = useRef<boolean>(true);

  // Setup audio for new notifications
  const [playNotificationSound] = useSound('/audios/new-notification.mp3', {
    volume: 0.5,
  });

  // Setup real-time socket notifications
  useSocketNotifications();

  // Queries
  const { data: countData, isLoading: countLoading } = useNotificationCount({
    enabled: isAuthenticated,
  });
  const {
    data: notificationsData,
    isLoading: notificationsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteNotifications({ limit: 10 }, { enabled: isAuthenticated && open });

  // Mutations
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const deleteNotification = useDeleteNotification();

  const unreadCount = countData?.unread || 0;
  // Flatten all pages into a single array
  const notifications = notificationsData?.pages.flatMap((page) => page.result) || [];
  const totalNotifications = notificationsData?.pages[0]?.meta.totalItems || 0;

  // Play sound when a new notification arrives
  useEffect(() => {
    // Skip on initial load or if not authenticated
    if (!isAuthenticated || countLoading) {
      return;
    }

    // On initial load, just store the count and mark as initialized
    if (isInitialLoadRef.current) {
      previousUnreadCountRef.current = unreadCount;
      isInitialLoadRef.current = false;
      return;
    }

    // Play sound and trigger animation if unread count increased
    if (previousUnreadCountRef.current !== null && unreadCount > previousUnreadCountRef.current) {
      playNotificationSound();
      setIsRinging(true);
      // Stop animation after 3 seconds
      setTimeout(() => {
        setIsRinging(false);
      }, 3000);
    }

    // Update the previous count
    previousUnreadCountRef.current = unreadCount;
  }, [unreadCount, isAuthenticated, countLoading, playNotificationSound]);

  // Handle scroll to load more
  useEffect(() => {
    if (!open || !scrollAreaRef.current) return;

    let scrollElement: HTMLElement | null = null;
    let handleScroll: (() => void) | null = null;

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      scrollElement = scrollAreaRef.current?.querySelector(
        '[data-slot="scroll-area-viewport"]',
      ) as HTMLElement;
      if (!scrollElement) return;

      handleScroll = () => {
        if (!scrollElement) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollElement;
        const scrollBottom = scrollHeight - scrollTop - clientHeight;

        // Load more when within 100px of bottom
        if (scrollBottom < 100 && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      };

      scrollElement.addEventListener('scroll', handleScroll);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (scrollElement && handleScroll) {
        scrollElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, [open, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleMarkAsRead = (id: string) => {
    markAsRead.mutate(id);
  };

  const handleDelete = (id: string) => {
    deleteNotification.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="group relative h-8 w-8 rounded-full border border-transparent p-0 text-gray-500 transition-all duration-300 hover:border-blue-100 hover:bg-linear-to-br hover:from-blue-50 hover:via-blue-100/50 hover:to-purple-50 hover:text-blue-600 hover:shadow-lg hover:shadow-blue-200/20 focus:outline-none sm:h-10 sm:w-10"
          aria-label={`Notifications ${unreadCount > 0 ? `- ${unreadCount} unread` : ''}`}
        >
          <div className="absolute inset-0 rounded-full bg-linear-to-br from-blue-500/0 to-purple-500/0 transition-all duration-300 group-hover:from-blue-500/8 group-hover:to-purple-500/8" />
          <Bell
            size={16}
            className={cn(
              'relative z-10 transition-transform duration-300 group-hover:scale-110 sm:h-[18px] sm:w-[18px]',
              isRinging && 'animate-bell-ring',
            )}
          />
          {isAuthenticated && unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 z-20 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-[10px] font-semibold text-white shadow-lg sm:top-0 sm:right-0 sm:h-4 sm:w-4">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-80 rounded-xl border-gray-200 p-0 shadow-xl sm:w-96"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 px-2 py-0.5 text-xs text-white">
                {unreadCount} New
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {isAuthenticated && notifications.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-500 hover:text-blue-600"
                onClick={handleMarkAllAsRead}
                disabled={markAllAsRead.isPending || unreadCount === 0}
                title="Mark all as read"
              >
                <CheckCheck className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-500 hover:text-gray-700"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        {!isAuthenticated ? (
          <UnauthenticatedState />
        ) : notificationsLoading || countLoading ? (
          <div className="divide-y divide-gray-100">
            {[...Array(3)].map((_, i) => (
              <NotificationSkeleton key={i} />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <EmptyNotifications />
        ) : (
          <div className="flex flex-col" style={{ maxHeight: '500px' }}>
            <ScrollArea className="h-[400px]" ref={scrollAreaRef} style={{ height: '400px' }}>
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={handleDelete}
                    isMarkingAsRead={markAsRead.isPending}
                    isDeleting={deleteNotification.isPending}
                  />
                ))}
                {isFetchingNextPage && (
                  <div className="divide-y divide-gray-100">
                    {[...Array(2)].map((_, i) => (
                      <NotificationSkeleton key={`loading-${i}`} />
                    ))}
                  </div>
                )}
                {!hasNextPage && notifications.length > 0 && (
                  <div className="py-4 text-center">
                    <p className="text-xs text-gray-500">
                      {notifications.length === totalNotifications
                        ? 'All notifications loaded'
                        : `Showing ${notifications.length} of ${totalNotifications} notifications`}
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="shrink-0 border-t border-gray-100 p-3">
              <Button
                variant="outline"
                className="w-full border-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:text-white"
                onClick={handleMarkAllAsRead}
                disabled={markAllAsRead.isPending || unreadCount === 0}
              >
                <CheckCheck className="mr-2 h-4 w-4" />
                Mark read all notifications
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
