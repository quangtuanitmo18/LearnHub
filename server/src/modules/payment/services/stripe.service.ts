import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

export interface CreateCheckoutSessionParams {
  orderId: string;
  orderCode: string;
  userId: string;
  userEmail: string;
  currency?: string; // ISO 4217 currency code (e.g., 'usd', 'vnd')
  lineItems: {
    name: string;
    description?: string;
    amount: number; // in smallest currency unit (cents for USD, VND is already smallest unit)
    quantity: number;
    imageUrl?: string;
  }[];
  metadata?: Record<string, string>;
}

export interface StripeWebhookEvent {
  type: string;
  data: {
    object: Stripe.Checkout.Session | Stripe.PaymentIntent;
  };
}

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private stripe: Stripe | null = null;
  private readonly webhookSecret: string;
  private readonly successUrl: string;
  private readonly cancelUrl: string;

  constructor(private readonly configService: ConfigService) {
    const secretKey = this.configService.get<string>(
      'payment.stripe.secretKey',
    );

    this.webhookSecret =
      this.configService.get<string>('payment.stripe.webhookSecret') || '';
    this.successUrl =
      this.configService.get<string>('payment.stripe.successUrl') || '';
    this.cancelUrl =
      this.configService.get<string>('payment.stripe.cancelUrl') || '';

    if (secretKey) {
      this.stripe = new Stripe(secretKey, {
        apiVersion: '2025-12-15.clover',
      });
      this.logger.log('Stripe service initialized');
    } else {
      this.logger.warn('Stripe secret key not configured');
    }
  }

  /**
   * Check if Stripe is properly configured
   */
  isConfigured(): boolean {
    return this.stripe !== null;
  }

  /**
   * Create a Stripe Checkout Session
   */
  async createCheckoutSession(
    params: CreateCheckoutSessionParams,
  ): Promise<Stripe.Checkout.Session> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    const {
      orderId,
      orderCode,
      userId,
      userEmail,
      currency = 'vnd',
      lineItems,
      metadata,
    } = params;

    // Normalize currency code to lowercase
    const normalizedCurrency = currency.toLowerCase();

    // Validate currency is supported (only USD and VND)
    const supportedCurrencies = ['usd', 'vnd'];
    if (!supportedCurrencies.includes(normalizedCurrency)) {
      throw new BadRequestException(
        `Currency ${currency} is not supported. Supported currencies: ${supportedCurrencies.join(', ')}`,
      );
    }

    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email: userEmail,
        line_items: lineItems.map((item) => ({
          price_data: {
            currency: normalizedCurrency,
            product_data: {
              name: item.name,
              description: item.description,
              images: item.imageUrl ? [item.imageUrl] : undefined,
            },
            unit_amount: item.amount, // Amount in smallest unit (cents for USD, VND already smallest)
          },
          quantity: item.quantity,
        })),
        metadata: {
          orderId,
          orderCode,
          userId,
          currency: normalizedCurrency,
          ...metadata,
        },
        success_url: `${this.successUrl}?session_id={CHECKOUT_SESSION_ID}&order_code=${orderCode}`,
        cancel_url: `${this.cancelUrl}?order_code=${orderCode}`,
        expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes expiry
      });

      this.logger.log(
        `Checkout session created: ${session.id} for order ${orderCode} (${normalizedCurrency.toUpperCase()})`,
      );
      return session;
    } catch (error) {
      this.logger.error(`Failed to create checkout session: ${error.message}`);
      throw new BadRequestException(
        `Failed to create checkout session: ${error.message}`,
      );
    }
  }

  /**
   * Verify and construct webhook event from raw body
   */
  constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    if (!this.webhookSecret) {
      throw new BadRequestException('Stripe webhook secret not configured');
    }

    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret,
      );

      return event;
    } catch (error) {
      this.logger.error(
        `Webhook signature verification failed: ${error.message}`,
      );
      throw new BadRequestException(
        `Webhook signature verification failed: ${error.message}`,
      );
    }
  }

  /**
   * Retrieve a checkout session by ID
   */
  async retrieveCheckoutSession(
    sessionId: string,
  ): Promise<Stripe.Checkout.Session> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    try {
      return await this.stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['payment_intent', 'line_items'],
      });
    } catch (error) {
      this.logger.error(
        `Failed to retrieve checkout session: ${error.message}`,
      );
      throw new BadRequestException(
        `Failed to retrieve checkout session: ${error.message}`,
      );
    }
  }

  /**
   * Retrieve a payment intent by ID
   */
  async retrievePaymentIntent(
    paymentIntentId: string,
  ): Promise<Stripe.PaymentIntent> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    try {
      return await this.stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      this.logger.error(`Failed to retrieve payment intent: ${error.message}`);
      throw new BadRequestException(
        `Failed to retrieve payment intent: ${error.message}`,
      );
    }
  }

  /**
   * Create a refund for a payment
   */
  async createRefund(
    paymentIntentId: string,
    amount?: number,
  ): Promise<Stripe.Refund> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    try {
      const refundParams: Stripe.RefundCreateParams = {
        payment_intent: paymentIntentId,
      };

      if (amount) {
        refundParams.amount = amount; // Amount in cents
      }

      const refund = await this.stripe.refunds.create(refundParams);
      this.logger.log(
        `Refund created: ${refund.id} for payment ${paymentIntentId}`,
      );
      return refund;
    } catch (error) {
      this.logger.error(`Failed to create refund: ${error.message}`);
      throw new BadRequestException(
        `Failed to create refund: ${error.message}`,
      );
    }
  }
}
