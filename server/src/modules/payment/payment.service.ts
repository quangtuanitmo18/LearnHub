import { Injectable } from '@nestjs/common';
import { PaymentRepository } from './payment.repository';
import { WebhookPaymentBodyDto } from './dto/payment.dto';

@Injectable()
export class PaymentService {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  /**
   * Handle Sepay webhook
   */
  handleSepayWebhook(webhookData: WebhookPaymentBodyDto) {
    return this.paymentRepository.handleSepayWebhook(webhookData);
  }

  /**
   * Create Stripe checkout session for an order
   */
  createStripeCheckout(orderCode: string, userId: string) {
    return this.paymentRepository.createStripeCheckout(orderCode, userId);
  }

  /**
   * Handle Stripe webhook
   */
  handleStripeWebhook(payload: Buffer, signature: string) {
    return this.paymentRepository.handleStripeWebhook(payload, signature);
  }

  /**
   * Verify Stripe checkout session status
   */
  verifyStripeCheckout(sessionId: string, userId: string) {
    return this.paymentRepository.verifyStripeCheckout(sessionId, userId);
  }
}
