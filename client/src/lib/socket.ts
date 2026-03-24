"use client";

import { io, Socket } from "socket.io-client";

// Socket event types
export const SOCKET_EVENTS = {
  // Notification events
  NOTIFICATION_COUNT: "notification-count",
  NEW_COURSE: "new-course",
  NEW_NOTIFICATION: "new-notification",

  // Video processing events
  VIDEO_PROCESSING_STARTED: "video:processing:started",
  VIDEO_PROCESSING_PROGRESS: "video:processing:progress",
  VIDEO_PROCESSING_COMPLETED: "video:processing:completed",
  VIDEO_PROCESSING_FAILED: "video:processing:failed",

  // Connection events
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  CONNECT_ERROR: "connect_error",
} as const;

// Socket configuration
const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") ||
  "http://localhost:3000";

// Notification namespace
const NOTIFICATION_NAMESPACE = "/notifications";

// Singleton socket instance for notifications
let notificationSocket: Socket | null = null;

/**
 * Get or create the notification socket instance
 */
export function getNotificationSocket(accessToken?: string): Socket {
  if (!notificationSocket) {
    notificationSocket = io(`${SOCKET_URL}${NOTIFICATION_NAMESPACE}`, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      transports: ["websocket", "polling"],
      auth: accessToken ? { token: accessToken } : undefined,
    });
  }

  return notificationSocket;
}

/**
 * Connect to notification socket
 */
export function connectNotificationSocket(accessToken?: string): Socket {
  const socket = getNotificationSocket(accessToken);

  // Update auth token if provided
  if (accessToken) {
    socket.auth = { token: accessToken };
  }

  if (!socket.connected) {
    socket.connect();
  }

  return socket;
}

/**
 * Disconnect notification socket
 */
export function disconnectNotificationSocket(): void {
  if (notificationSocket) {
    notificationSocket.disconnect();
    notificationSocket = null;
  }
}

/**
 * Check if notification socket is connected
 */
export function isNotificationSocketConnected(): boolean {
  return notificationSocket?.connected ?? false;
}

// Export socket instance getter
export { notificationSocket };

// ===========================================
// VIDEO SOCKET (for video processing progress)
// ===========================================

// Video namespace
const VIDEO_NAMESPACE = "/video";

// Singleton socket instance for video processing
let videoSocket: Socket | null = null;

// Track subscribed video IDs
const subscribedVideoIds = new Set<string>();

/**
 * Get or create the video socket instance
 */
export function getVideoSocket(accessToken?: string): Socket {
  if (!videoSocket) {
    videoSocket = io(`${SOCKET_URL}${VIDEO_NAMESPACE}`, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      transports: ["websocket", "polling"],
      auth: accessToken ? { token: accessToken } : undefined,
    });

    // Auto-resubscribe on reconnect
    videoSocket.on("connect", () => {
      console.log("✅ [VideoSocket] Connected");
      subscribedVideoIds.forEach((videoId) => {
        videoSocket?.emit("subscribe:video", { videoId });
        console.log("🔄 [VideoSocket] Resubscribed to:", videoId);
      });
    });

    videoSocket.on("connected", (data) => {
      console.log("✅ [VideoSocket] Server confirmed:", data);
    });

    videoSocket.on("disconnect", (reason) => {
      console.log("❌ [VideoSocket] Disconnected:", reason);
    });

    videoSocket.on("error", (error) => {
      console.error("❌ [VideoSocket] Error:", error);
    });

    videoSocket.on(
      "subscribed",
      (data: { videoId: string; message: string }) => {
        console.log("✅ [VideoSocket] Subscribed:", data.videoId);
      }
    );
  }

  return videoSocket;
}

/**
 * Connect to video socket
 */
export function connectVideoSocket(accessToken?: string): Socket {
  const socket = getVideoSocket(accessToken);

  // Update auth token if provided
  if (accessToken) {
    socket.auth = { token: accessToken };
  }

  if (!socket.connected) {
    socket.connect();
  }

  return socket;
}

/**
 * Subscribe to video processing updates
 */
export function subscribeToVideo(videoId: string): void {
  subscribedVideoIds.add(videoId);
  if (videoSocket?.connected) {
    videoSocket.emit("subscribe:video", { videoId });
    console.log("📡 [VideoSocket] Subscribing to:", videoId);
  }
}

/**
 * Unsubscribe from video processing updates
 */
export function unsubscribeFromVideo(videoId: string): void {
  subscribedVideoIds.delete(videoId);
  if (videoSocket?.connected) {
    videoSocket.emit("unsubscribe:video", { videoId });
    console.log("📡 [VideoSocket] Unsubscribing from:", videoId);
  }
}

/**
 * Disconnect video socket
 */
export function disconnectVideoSocket(): void {
  if (videoSocket) {
    videoSocket.disconnect();
    videoSocket = null;
  }
  subscribedVideoIds.clear();
}

/**
 * Check if video socket is connected
 */
export function isVideoSocketConnected(): boolean {
  return videoSocket?.connected ?? false;
}

/**
 * Get subscribed video IDs
 */
export function getSubscribedVideoIds(): Set<string> {
  return subscribedVideoIds;
}

// Export video socket instance getter
export { videoSocket };
