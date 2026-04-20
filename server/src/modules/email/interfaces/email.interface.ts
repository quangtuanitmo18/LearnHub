export interface OrderItem {
  title: string;
  price: number;
  thumbnail?: string;
}

export interface OrderConfirmationEmailData {
  to: string;
  username: string;
  orderCode: string;
  items: OrderItem[];
  subTotal: number;
  totalDiscount: number;
  totalAmount: number;
  paymentMethod: string;
  createdAt: Date;
}

export interface PaymentSuccessEmailData {
  to: string;
  username: string;
  orderCode: string;
  orderType: 'COURSE' | 'MEMBERSHIP';
  membershipPlan?: string;
  items: OrderItem[];
  subTotal: number;
  totalDiscount: number;
  totalAmount: number;
  paymentMethod: string;
  paidAt: Date;
}

export interface MembershipActivatedEmailData {
  to: string;
  username: string;
  orderCode: string;
  plan: string;
  totalAmount: number;
  planStartDate: Date;
  planEndDate: Date;
}

export interface PasswordResetEmailData {
  to: string;
  username: string;
  resetToken: string;
  expiresIn: string;
  frontendUrl: string;
}

export interface OtpVerificationEmailData {
  to: string;
  username: string;
  otpCode: string;
  expiresIn: string;
}

export interface ContestResultReadyEmailData {
  to: string;
  username: string;
  contestTitle: string;
  contestSlug: string;
}
