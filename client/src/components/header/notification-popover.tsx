"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useInfiniteNotifications,
  useNotificationCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
} from "@/hooks/use-notifications";
import { useSocketNotifications } from "@/hooks/use-socket-notifications";
import { useIsAuthenticated } from "@/stores/auth-store";
import { cn } from "@/lib/utils";
import type {
  NotificationRecipient,
  NotificationType,
} from "@/types/notification";
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
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import useSound from "use-sound";

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
  SYSTEM: "bg-blue-50",
  COURSE: "bg-purple-50",
  ORDER: "bg-green-50",
  COMMENT: "bg-orange-50",
  BADGE: "bg-yellow-50",
  PROMOTION: "bg-pink-50",
  REMINDER: "bg-cyan-50",
  NEW_COURSE: "bg-purple-50",
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
    type === "NEW_COURSE" && data && "slug" in data
      ? `/courses/${data.slug}`
      : undefined;

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 border-b border-gray-100 last:border-b-0 transition-colors hover:bg-gray-50",
        !isRead && "bg-blue-50/30"
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "shrink-0 w-9 h-9 rounded-full flex items-center justify-center",
          notificationBgColors[type] || "bg-gray-50"
        )}
      >
        {notificationIcons[type] || <Bell className="h-4 w-4 text-gray-500" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {actionUrl ? (
          <Link href={actionUrl} className="block group">
            <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
              {title}
            </p>
            <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
              {message}
            </p>
          </Link>
        ) : (
          <>
            <p className="text-sm font-medium text-gray-900 line-clamp-1">
              {title}
            </p>
            <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
              {message}
            </p>
          </>
        )}
        <p className="text-xs text-gray-400 mt-1">{timeAgo}</p>
      </div>

      {/* Status & Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Unread indicator */}
        {!isRead && (
          <Badge
            variant="outline"
            className="text-[10px] px-1.5 py-0 h-5 border-red-200 text-red-500 bg-red-50"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1" />
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
                <Check className="h-4 w-4 mr-2" />
                Mark read
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => onDelete(id)}
              disabled={isDeleting}
              className="cursor-pointer text-red-600 focus:text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
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
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Mail className="h-8 w-8 text-gray-400" />
      </div>
      <p className="text-sm font-medium text-gray-900 mb-1">No notifications</p>
      <p className="text-xs text-gray-500 text-center">
        You&apos;re all caught up! Check back later for updates.
      </p>
    </div>
  );
}

function UnauthenticatedState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Bell className="h-8 w-8 text-gray-400" />
      </div>
      <p className="text-sm font-medium text-gray-900 mb-1">
        Sign in to view notifications
      </p>
      <p className="text-xs text-gray-500 text-center">
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
  const [playNotificationSound] = useSound("/audios/new-notification.mp3", {
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
  } = useInfiniteNotifications(
    { limit: 10 },
    { enabled: isAuthenticated && open }
  );

  // Mutations
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const deleteNotification = useDeleteNotification();

  const unreadCount = countData?.unread || 0;
  // Flatten all pages into a single array
  const notifications =
    notificationsData?.pages.flatMap((page) => page.result) || [];
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
    if (
      previousUnreadCountRef.current !== null &&
      unreadCount > previousUnreadCountRef.current
    ) {
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
        '[data-slot="scroll-area-viewport"]'
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

      scrollElement.addEventListener("scroll", handleScroll);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (scrollElement && handleScroll) {
        scrollElement.removeEventListener("scroll", handleScroll);
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
            className="relative h-8 w-8 sm:h-10 sm:w-10 p-0 text-gray-500 hover:text-blue-600 transition-all duration-300 group hover:bg-linear-to-br hover:from-blue-50 hover:via-blue-100/50 hover:to-purple-50 hover:shadow-lg hover:shadow-blue-200/20 rounded-full border border-transparent hover:border-blue-100 focus:outline-none"
            aria-label={`Notifications ${
              unreadCount > 0 ? `- ${unreadCount} unread` : ""
            }`}
          >
            <div className="absolute inset-0 bg-linear-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/8 group-hover:to-purple-500/8 rounded-full transition-all duration-300" />
            <Bell
              size={16}
              className={cn(
                "sm:w-[18px] sm:h-[18px] relative z-10 group-hover:scale-110 transition-transform duration-300",
                isRinging && "animate-bell-ring"
              )}
            />
          {isAuthenticated && unreadCount > 0 && (
            <span className="absolute z-20 -top-1 -right-1 sm:top-0 sm:right-0 w-4 h-4 sm:w-4 sm:h-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-[10px] rounded-full flex items-center justify-center font-semibold shadow-lg">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-80 sm:w-96 p-0 rounded-xl shadow-xl border-gray-200"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs px-2 py-0.5">
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
          <div className="flex flex-col" style={{ maxHeight: "500px" }}>
            <ScrollArea
              className="h-[400px]"
              ref={scrollAreaRef}
              style={{ height: "400px" }}
            >
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
                        ? "All notifications loaded"
                        : `Showing ${notifications.length} of ${totalNotifications} notifications`}
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="p-3 border-t border-gray-100 shrink-0">
              <Button
                variant="outline"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 hover:from-blue-700 hover:to-purple-700 hover:text-white"
                onClick={handleMarkAllAsRead}
                disabled={markAllAsRead.isPending || unreadCount === 0}
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark read all notifications
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
