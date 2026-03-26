export const OrderStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type OrderStatusType = (typeof OrderStatus)[keyof typeof OrderStatus];

export const OrderType = {
  COURSE: 'COURSE',
  MEMBERSHIP: 'MEMBERSHIP',
} as const;

export type OrderTypeValue = (typeof OrderType)[keyof typeof OrderType];
