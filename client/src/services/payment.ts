import ApiService from '@/lib/api-service';

export interface CreateStripeCheckoutRequest {
  orderCode: string;
}

export interface CreateStripeCheckoutResponse {
  sessionId: string;
  sessionUrl: string;
  orderCode: string;
}

export class PaymentService {
  /**
   * Create Stripe checkout session
   */
  static async createStripeCheckout(
    data: CreateStripeCheckoutRequest,
  ): Promise<CreateStripeCheckoutResponse> {
    return ApiService.post<CreateStripeCheckoutResponse>('/payment/stripe/checkout', {
      orderCode: data.orderCode,
    });
  }
}
