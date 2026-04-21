import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { EMAIL_QUEUE, EMAIL_JOBS } from '../constants';
import { EmailService } from '../services/email.service';
import { PdfService } from '../services/pdf.service';
import {
  OrderConfirmationEmailData,
  PaymentSuccessEmailData,
  MembershipActivatedEmailData,
  PasswordResetEmailData,
  OtpVerificationEmailData,
  ContestResultReadyEmailData,
} from '../interfaces';
import {
  renderOrderConfirmationTemplate,
  renderPaymentSuccessTemplate,
  renderMembershipActivatedTemplate,
  renderPasswordResetTemplate,
  renderOtpVerificationTemplate,
  renderContestResultReadyTemplate,
} from '../templates';

type EmailJobData =
  | OrderConfirmationEmailData
  | PaymentSuccessEmailData
  | MembershipActivatedEmailData
  | PasswordResetEmailData
  | OtpVerificationEmailData
  | ContestResultReadyEmailData;

@Processor(EMAIL_QUEUE)
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly pdfService: PdfService,
  ) {
    super();
  }

  async process(job: Job<EmailJobData>): Promise<void> {
    this.logger.log(`Processing email job ${job.name} with id ${job.id}`);

    // Check if email service is configured
    if (!this.emailService.isConfigured()) {
      this.logger.warn('Email service not configured, skipping job');
      return;
    }

    switch (job.name) {
      case EMAIL_JOBS.SEND_ORDER_CONFIRMATION:
        await this.handleOrderConfirmationEmail(
          job.data as OrderConfirmationEmailData,
        );
        break;
      case EMAIL_JOBS.SEND_PAYMENT_SUCCESS:
        await this.handlePaymentSuccessEmail(
          job.data as PaymentSuccessEmailData,
        );
        break;
      case EMAIL_JOBS.SEND_MEMBERSHIP_ACTIVATED:
        await this.handleMembershipActivatedEmail(
          job.data as MembershipActivatedEmailData,
        );
        break;
      case EMAIL_JOBS.SEND_PASSWORD_RESET:
        await this.handlePasswordResetEmail(job.data as PasswordResetEmailData);
        break;
      case EMAIL_JOBS.SEND_OTP_VERIFICATION:
        await this.handleOtpVerificationEmail(
          job.data as OtpVerificationEmailData,
        );
        break;
      case EMAIL_JOBS.SEND_CONTEST_RESULT_READY:
        await this.handleContestResultReadyEmail(
          job.data as ContestResultReadyEmailData,
        );
        break;
      default:
        this.logger.warn(`Unknown email job name: ${job.name}`);
    }
  }

  private async handleOrderConfirmationEmail(
    data: OrderConfirmationEmailData,
  ): Promise<void> {
    this.logger.log(`Sending order confirmation email for ${data.orderCode}`);

    const html = await renderOrderConfirmationTemplate(data);

    await this.emailService.sendMail({
      to: data.to,
      subject: `Order Confirmation - ${data.orderCode}`,
      html,
    });
  }

  private async handlePaymentSuccessEmail(
    data: PaymentSuccessEmailData,
  ): Promise<void> {
    this.logger.log(`Sending payment success email for ${data.orderCode}`);

    const html = await renderPaymentSuccessTemplate(data);

    // Generate invoice PDF
    let invoicePdf: Buffer | null = null;
    try {
      this.logger.log(`Generating invoice PDF for ${data.orderCode}`);
      invoicePdf = await this.pdfService.generateInvoicePdf({
        orderCode: data.orderCode,
        username: data.username,
        email: data.to,
        orderType: data.orderType,
        membershipPlan: data.membershipPlan,
        items: data.items,
        subTotal: data.subTotal,
        totalDiscount: data.totalDiscount,
        totalAmount: data.totalAmount,
        paymentMethod: data.paymentMethod,
        invoiceDate: data.paidAt,
        paidAt: data.paidAt,
      });
      this.logger.log(`Invoice PDF generated for ${data.orderCode}`);
    } catch (error) {
      this.logger.error(`Failed to generate invoice PDF: ${error.message}`);
      // Continue sending email without attachment
    }

    await this.emailService.sendMail({
      to: data.to,
      subject: `Payment Successful - ${data.orderCode}`,
      html,
      attachments: invoicePdf
        ? [
            {
              filename: `Invoice-${data.orderCode}.pdf`,
              content: invoicePdf,
              contentType: 'application/pdf',
            },
          ]
        : undefined,
    });
  }

  private async handleContestResultReadyEmail(
    data: ContestResultReadyEmailData,
  ): Promise<void> {
    this.logger.log(
      `Sending contest result ready email to ${data.to} for contest ${data.contestSlug}`,
    );

    const html = await renderContestResultReadyTemplate(data);

    await this.emailService.sendMail({
      to: data.to,
      subject: `Contest Results: ${data.contestTitle}`,
      html,
    });
  }

  private async handleMembershipActivatedEmail(
    data: MembershipActivatedEmailData,
  ): Promise<void> {
    this.logger.log(`Sending membership activated email for ${data.orderCode}`);

    const html = await renderMembershipActivatedTemplate(data);

    // Generate invoice PDF for membership
    let invoicePdf: Buffer | null = null;
    try {
      this.logger.log(
        `Generating invoice PDF for membership ${data.orderCode}`,
      );
      invoicePdf = await this.pdfService.generateInvoicePdf({
        orderCode: data.orderCode,
        username: data.username,
        email: data.to,
        orderType: 'MEMBERSHIP',
        membershipPlan: data.plan,
        items: [],
        subTotal: data.totalAmount,
        totalDiscount: 0,
        totalAmount: data.totalAmount,
        paymentMethod: 'Bank Transfer',
        invoiceDate: new Date(),
        paidAt: new Date(),
      });
      this.logger.log(`Invoice PDF generated for membership ${data.orderCode}`);
    } catch (error) {
      this.logger.error(
        `Failed to generate membership invoice PDF: ${error.message}`,
      );
      // Continue sending email without attachment
    }

    await this.emailService.sendMail({
      to: data.to,
      subject: `${data.plan} Membership Activated - Welcome!`,
      html,
      attachments: invoicePdf
        ? [
            {
              filename: `Invoice-${data.orderCode}.pdf`,
              content: invoicePdf,
              contentType: 'application/pdf',
            },
          ]
        : undefined,
    });
  }

  private async handlePasswordResetEmail(
    data: PasswordResetEmailData,
  ): Promise<void> {
    this.logger.log(`Sending password reset email to ${data.to}`);

    const html = await renderPasswordResetTemplate(data);

    await this.emailService.sendMail({
      to: data.to,
      subject: 'Password Reset Request',
      html,
    });
  }

  private async handleOtpVerificationEmail(
    data: OtpVerificationEmailData,
  ): Promise<void> {
    this.logger.log(`Sending OTP verification email to ${data.to}`);

    const html = await renderOtpVerificationTemplate(data);

    await this.emailService.sendMail({
      to: data.to,
      subject: 'Email Verification - Your OTP Code',
      html,
    });
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<EmailJobData>) {
    this.logger.log(`Email job ${job.name} (${job.id}) completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<EmailJobData>, error: Error) {
    this.logger.error(
      `Email job ${job.name} (${job.id}) failed: ${error.message}`,
    );
  }
}
