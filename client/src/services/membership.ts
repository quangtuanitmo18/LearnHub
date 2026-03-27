import ApiService from '@/lib/api-service';
import { PaymentMethod } from '@/types/order';
import { MembershipPlan } from '@/types/membership';

export interface CreateMembershipOrderRequest {
  paymentMethod: PaymentMethod;
  plan: MembershipPlan;
}

export interface CreateMembershipOrderResponse {
  id: string;
  code: string;
  orderType: string;
  membershipPlan: MembershipPlan;
  subTotal: number;
  totalDiscount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export class MembershipService {
  /**
   * Create membership order
   */
  static async createMembershipOrder(
    data: CreateMembershipOrderRequest,
  ): Promise<CreateMembershipOrderResponse> {
    return ApiService.post<CreateMembershipOrderResponse>('/orders/membership/checkout', {
      paymentMethod: data.paymentMethod,
      plan: data.plan,
    });
  }
}
