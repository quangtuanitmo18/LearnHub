import * as ejs from 'ejs';
import * as path from 'path';
import {
  OrderConfirmationEmailData,
  PaymentSuccessEmailData,
  MembershipActivatedEmailData,
  PasswordResetEmailData,
  OtpVerificationEmailData,
  ContestResultReadyEmailData,
} from '../interfaces';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

const TEMPLATE_DIR = path.join(__dirname);
console.log('TEMPLATE_DIR:', TEMPLATE_DIR);
const COMPANY_NAME = 'NestJS Tutorial';

// Common helpers passed to all templates
const templateHelpers = {
  formatCurrency,
  formatDate,
  companyName: COMPANY_NAME,
};

export async function renderOrderConfirmationTemplate(
  data: OrderConfirmationEmailData,
): Promise<string> {
  const templatePath = path.join(TEMPLATE_DIR, 'order-confirmation.ejs');

  return ejs.renderFile(templatePath, {
    ...data,
    ...templateHelpers,
  });
}

export async function renderPaymentSuccessTemplate(
  data: PaymentSuccessEmailData,
): Promise<string> {
  const templatePath = path.join(TEMPLATE_DIR, 'payment-success.ejs');

  return ejs.renderFile(templatePath, {
    ...data,
    ...templateHelpers,
  });
}

export async function renderMembershipActivatedTemplate(
  data: MembershipActivatedEmailData,
): Promise<string> {
  const templatePath = path.join(TEMPLATE_DIR, 'membership-activated.ejs');

  return ejs.renderFile(templatePath, {
    ...data,
    ...templateHelpers,
  });
}

export async function renderPasswordResetTemplate(
  data: PasswordResetEmailData,
): Promise<string> {
  const templatePath = path.join(TEMPLATE_DIR, 'password-reset.ejs');

  return ejs.renderFile(templatePath, {
    ...data,
    ...templateHelpers,
  });
}

export async function renderOtpVerificationTemplate(
  data: OtpVerificationEmailData,
): Promise<string> {
  const templatePath = path.join(TEMPLATE_DIR, 'otp-verification.ejs');

  return ejs.renderFile(templatePath, {
    ...data,
    ...templateHelpers,
  });
}

export async function renderContestResultReadyTemplate(
  data: ContestResultReadyEmailData,
): Promise<string> {
  const templatePath = path.join(TEMPLATE_DIR, 'contest-result-ready.ejs');

  return ejs.renderFile(templatePath, {
    ...data,
    ...templateHelpers,
  });
}
