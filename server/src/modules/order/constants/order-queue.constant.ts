export const ORDER_QUEUE = 'order-queue';

export const ORDER_JOBS = {
  CANCEL_UNPAID_ORDER: 'cancel-unpaid-order',
} as const;

// 24 hours in milliseconds
export const ORDER_CANCEL_DELAY = 24 * 60 * 60 * 1000;

// For testing: 1 minute delay
// export const ORDER_CANCEL_DELAY = 60 * 1000;
