export const PaymentMethod = {
  STRIPE: 'STRIPE',
  BANK_TRANSFER: 'BANK_TRANSFER',
} as const;

export type PaymentMethodType = (typeof PaymentMethod)[keyof typeof PaymentMethod];
