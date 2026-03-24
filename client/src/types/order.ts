import { ListResponse, BaseFilterParams } from "./common";
import { MembershipPlan } from "./membership";

// Order interfaces
export enum OrderStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum PaymentMethod {
  STRIPE = "STRIPE",
  BANK_TRANSFER = "BANK_TRANSFER",
}

export enum OrderType {
  COURSE = "COURSE",
}

export interface OrderUser {
  id: string;
  username: string;
  email: string;
  avatar?: string;
}

export interface IOrderItem {
  id: string;
  title: string;
  price: number;
  oldPrice: number;
  thumbnail: string;
  courseId: string;
  createdAt: string;
  updatedAt: string;
}

export interface IOrder {
  id: string;
  code: string;
  orderType: OrderType;
  couponCode?: string;
  subTotal: number;
  totalDiscount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  membershipPlan: MembershipPlan | null;
  userId: string;
  user: OrderUser;
  items: IOrderItem[];
  createdAt: string;
  updatedAt: string;
}

// New interface specifically for My Orders page API response

// Order creation interfaces (moved from cart types)
export interface CreateOrderRequest {
  paymentMethod: PaymentMethod;
  couponCode?: string;
  courseIds?: string[];
}

export interface UpdateAdminOrderRequest extends Partial<IOrder> {
  id: string;
}

// Order service filter parameters
export interface OrdersFilterParams extends BaseFilterParams {
  status?: OrderStatus;
  paymentMethod?: PaymentMethod;
}

// Admin orders filter parameters (supports array filters)
export interface AdminOrdersFilterParams extends BaseFilterParams {
  status?: string[];
  paymentMethod?: string[];
}

// Orders list response (for admin/other use cases)
export type OrdersListResponse = ListResponse<IOrder>;
