/**
 * Simplified RBAC Permission Constants
 * Uses standard CRUD operations for easier UI management
 */

// Resource-based CRUD permissions
export const PERMISSIONS = {
  // User Management
  USER_CREATE: 'user:create',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',

  // Role Management
  ROLE_CREATE: 'role:create',
  ROLE_READ: 'role:read',
  ROLE_UPDATE: 'role:update',
  ROLE_DELETE: 'role:delete',

  // Blog Management
  BLOG_CREATE: 'blog:create',
  BLOG_READ: 'blog:read',
  BLOG_UPDATE: 'blog:update',
  BLOG_DELETE: 'blog:delete',

  // Category Management
  CATEGORY_CREATE: 'category:create',
  CATEGORY_READ: 'category:read',
  CATEGORY_UPDATE: 'category:update',
  CATEGORY_DELETE: 'category:delete',

  // Video Management
  VIDEO_CREATE: 'video:create',
  VIDEO_READ: 'video:read',
  VIDEO_UPDATE: 'video:update',
  VIDEO_DELETE: 'video:delete',

  // Image Management
  IMAGE_CREATE: 'image:create',
  IMAGE_READ: 'image:read',
  IMAGE_UPDATE: 'image:update',
  IMAGE_DELETE: 'image:delete',

  // Course Management
  COURSE_CREATE: 'course:create',
  COURSE_READ: 'course:read',
  COURSE_UPDATE: 'course:update',
  COURSE_DELETE: 'course:delete',

  // Coupon Management
  COUPON_CREATE: 'coupon:create',
  COUPON_READ: 'coupon:read',
  COUPON_UPDATE: 'coupon:update',
  COUPON_DELETE: 'coupon:delete',

  // Cart Management
  CART_CREATE: 'cart:create',
  CART_READ: 'cart:read',
  CART_UPDATE: 'cart:update',
  CART_DELETE: 'cart:delete',

  // Order Management
  ORDER_CREATE: 'order:create',
  ORDER_READ: 'order:read',
  ORDER_UPDATE: 'order:update',
  ORDER_DELETE: 'order:delete',

  // Review Management
  REVIEW_CREATE: 'review:create',
  REVIEW_READ: 'review:read',
  REVIEW_UPDATE: 'review:update',
  REVIEW_DELETE: 'review:delete',

  // Payment Transaction Management
  PAYMENT_TRANSACTION_CREATE: 'payment-transaction:create',
  PAYMENT_TRANSACTION_READ: 'payment-transaction:read',
  PAYMENT_TRANSACTION_UPDATE: 'payment-transaction:update',
  PAYMENT_TRANSACTION_DELETE: 'payment-transaction:delete',

  // Notification Management
  NOTIFICATION_CREATE: 'notification:create',
  NOTIFICATION_READ: 'notification:read',
  NOTIFICATION_UPDATE: 'notification:update',
  NOTIFICATION_DELETE: 'notification:delete',

  // Quiz Attempt Management
  QUIZ_ATTEMPT_CREATE: 'quiz-attempt:create',
  QUIZ_ATTEMPT_READ: 'quiz-attempt:read',
  QUIZ_ATTEMPT_UPDATE: 'quiz-attempt:update',
  QUIZ_ATTEMPT_DELETE: 'quiz-attempt:delete',

  // Comment Management
  COMMENT_CREATE: 'comment:create',
  COMMENT_READ: 'comment:read',
  COMMENT_UPDATE: 'comment:update',
  COMMENT_DELETE: 'comment:delete',

  // User Lesson Progress Management
  USER_LESSON_PROGRESS_CREATE: 'user-lesson-progress:create',
  USER_LESSON_PROGRESS_READ: 'user-lesson-progress:read',
  USER_LESSON_PROGRESS_UPDATE: 'user-lesson-progress:update',
  USER_LESSON_PROGRESS_DELETE: 'user-lesson-progress:delete',

  // Contest Management
  CONTEST_CREATE: 'contest:create',
  CONTEST_READ: 'contest:read',
  CONTEST_UPDATE: 'contest:update',
  CONTEST_DELETE: 'contest:delete',
} as const;

// Resource definitions for UI generation
export const RESOURCES = {
  USER: 'user',
  ROLE: 'role',
  BLOG: 'blog',
  CATEGORY: 'category',
  COURSE: 'course',
  CART: 'cart',
  ORDER: 'order',
  REVIEW: 'review',
  PAYMENT_TRANSACTION: 'payment-transaction',
  NOTIFICATION: 'notification',
  MEDIA: 'media',
  QUIZ_ATTEMPT: 'quiz-attempt',
  COMMENT: 'comment',
  USER_LESSON_PROGRESS: 'user-lesson-progress',
  CONTEST: 'contest',
} as const;

// CRUD operations
export const OPERATIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
} as const;

// Common system role names (for reference)
export const SYSTEM_ROLE_NAMES = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  STUDENT: 'Student',
  INSTRUCTOR: 'Instructor',
  GUEST: 'Guest',
} as const;

// Helper function to generate permission strings
export const generatePermission = (
  resource: string,
  operation: string,
): string => {
  return `${resource}:${operation}`;
};

// Helper function to get all permissions for a resource
export const getResourcePermissions = (
  resource: keyof typeof RESOURCES,
): string[] => {
  const resourceName = RESOURCES[resource];
  return Object.values(OPERATIONS).map((op) =>
    generatePermission(resourceName, op),
  );
};

// All permissions as an array
export const ALL_PERMISSIONS = Object.values(PERMISSIONS);

// Type definitions
export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
