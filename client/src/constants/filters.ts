import React from 'react';
import { CategoryStatus } from '@/types/category';
import { CourseLevel, CourseStatus, CourseType } from '@/types/course';
import { DiscountType, CouponStatus } from '@/types/coupon';
import { BlogStatus } from '@/types/blog';
import { PostStatus } from '@/types/post';
import { CommentStatus } from '@/types/comment';
import { UserStatus, UserType } from '@/types/user';

// Filter options for data tables
export const FILTER_OPTIONS = {
  // Category filters
  CATEGORY_STATUS: [
    {
      label: 'Active',
      value: CategoryStatus.ACTIVE,
    },
    {
      label: 'Inactive',
      value: CategoryStatus.INACTIVE,
    },
  ],

  // Blog filters
  BLOG_STATUS: [
    {
      label: 'Draft',
      value: BlogStatus.DRAFT,
    },
    {
      label: 'Published',
      value: BlogStatus.PUBLISHED,
    },
  ],

  // Post filters
  POST_STATUS: [
    {
      label: 'Draft',
      value: PostStatus.DRAFT,
    },
    {
      label: 'Published',
      value: PostStatus.PUBLISHED,
    },
    {
      label: 'Archived',
      value: PostStatus.ARCHIVED,
    },
  ],

  // Course filters - updated to match new boolean-based structure
  COURSE_STATUS: [
    {
      label: 'Draft',
      value: CourseStatus.DRAFT,
    },
    {
      label: 'Published',
      value: CourseStatus.PUBLISHED,
    },
  ],

  COURSE_TYPE: [
    {
      label: 'Free',
      value: CourseType.FREE,
    },
    {
      label: 'Paid',
      value: CourseType.PAID,
    },
  ],

  COURSE_LEVEL: [
    {
      label: 'Beginner',
      value: CourseLevel.BEGINNER,
    },
    {
      label: 'Intermediate',
      value: CourseLevel.INTERMEDIATE,
    },
    {
      label: 'Advanced',
      value: CourseLevel.ADVANCED,
    },
  ],

  // Coupon filters
  COUPON_STATUS: [
    {
      label: 'Active',
      value: CouponStatus.ACTIVE,
    },
    {
      label: 'Expired',
      value: CouponStatus.EXPIRED,
    },
    {
      label: 'Inactive',
      value: CouponStatus.INACTIVE,
    },
  ],

  COUPON_DISCOUNT_TYPE: [
    {
      label: 'Percentage',
      value: DiscountType.PERCENT,
    },
    {
      label: 'Fixed Amount',
      value: DiscountType.FIXED,
    },
  ],

  // User filters
  USER_STATUS: [
    {
      label: 'Active',
      value: UserStatus.ACTIVE,
    },
    {
      label: 'Inactive',
      value: UserStatus.INACTIVE,
    },
    {
      label: 'Banned',
      value: UserStatus.BANNED,
    },
  ],

  USER_TYPE: [
    {
      label: 'Default',
      value: UserType.DEFAULT,
    },
    {
      label: 'Facebook',
      value: UserType.FACEBOOK,
    },
    {
      label: 'Google',
      value: UserType.GOOGLE,
    },
  ],

  // Comment filters
  COMMENT_STATUS: [
    {
      label: 'Pending',
      value: CommentStatus.PENDING,
    },
    {
      label: 'Approved',
      value: CommentStatus.APPROVED,
    },
    {
      label: 'Rejected',
      value: CommentStatus.REJECTED,
    },
  ],
} as const;

// Filter configuration interface
export interface FilterOption {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}

// Type for category status filter values
export type CategoryStatusFilter = 'active' | 'inactive';
