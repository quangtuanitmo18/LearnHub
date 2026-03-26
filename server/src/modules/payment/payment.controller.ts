import {
  Body,
  Controller,
  Post,
  Get,
  UseGuards,
  Headers,
  Req,
  Query,
  RawBodyRequest,
} from '@nestjs/common';
import { Request } from 'express';
import { PaymentService } from './payment.service';
import {
  WebhookPaymentBodyDto,
  CreateStripeCheckoutDto,
} from './dto/payment.dto';
import { Public } from 'src/shared/decorators/public.decorator';
import { SepayWebhookGuard } from './guards/sepay-webhook.guard';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // ==================== SEPAY ENDPOINTS ====================

  @Public()
  @UseGuards(SepayWebhookGuard)
  @Post('webhook/sepay')
  async sepayWebhook(@Body() webhookData: WebhookPaymentBodyDto) {
    return this.paymentService.handleSepayWebhook(webhookData);
  }

  // ==================== STRIPE ENDPOINTS ====================

  /**
   * Create Stripe checkout session
   * User must be authenticated
   */
  @Post('stripe/checkout')
  async createStripeCheckout(
    @Body() dto: CreateStripeCheckoutDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.paymentService.createStripeCheckout(dto.orderCode, userId);
  }

  /**
   * Handle Stripe webhook
   * Must receive raw body for signature verification
   */
  @Public()
  @Post('webhook/stripe')
  async stripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const rawBody = req.rawBody;
    if (!rawBody) {
      throw new Error('Raw body not available');
    }

    return this.paymentService.handleStripeWebhook(rawBody, signature);
  }

  /**
   * Verify Stripe checkout session status
   */
  @Public()
  @Get('stripe/verify')
  async verifyStripeCheckout(@Query('session_id') sessionId: string) {
    return this.paymentService.verifyStripeCheckout(sessionId);
  }
}
