export const EMAIL_QUEUE = 'email-queue';

export const EMAIL_JOBS = {
  SEND_ORDER_CONFIRMATION: 'send-order-confirmation',
  SEND_PAYMENT_SUCCESS: 'send-payment-success',
  SEND_MEMBERSHIP_ACTIVATED: 'send-membership-activated',
  SEND_PASSWORD_RESET: 'send-password-reset',
  SEND_OTP_VERIFICATION: 'send-otp-verification',
} as const;

export type EmailJobType = (typeof EMAIL_JOBS)[keyof typeof EMAIL_JOBS];
