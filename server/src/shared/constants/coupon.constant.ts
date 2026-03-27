export const CouponDiscountType = {
  PERCENT: 'PERCENT',
  FIXED: 'FIXED',
} as const;

export type CouponDiscountTypeValue =
  (typeof CouponDiscountType)[keyof typeof CouponDiscountType];

export const CouponStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  EXPIRED: 'EXPIRED',
} as const;

export type CouponStatusType = (typeof CouponStatus)[keyof typeof CouponStatus];
