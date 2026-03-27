import { ListResponse, BaseFilterParams } from './common';

export enum DiscountType {
  PERCENT = 'PERCENT',
  FIXED = 'FIXED',
}

export enum CouponStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  EXPIRED = 'EXPIRED',
}

export interface ICoupon {
  id: string;
  title: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  courses: Array<{
    id: string;
    title: string;
    price?: number;
  }>;
  minPurchaseAmount: number;
  maxUses: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// Request types
export interface GetActiveCouponsRequest {
  minAmount?: number;
}

// Validation request
export interface ValidateCouponRequest {
  code: string;
  courseIds?: string[];
}

// Extended coupon with populated courseIds for validation response
export interface ValidatedCoupon extends Omit<ICoupon, 'courses'> {
  courses: Array<{
    id: string;
    title: string;
    price: number;
  }>;
}

// Response after ApiService extracts the data field
export interface ValidateCouponResponse {
  valid: boolean;
  coupon: ValidatedCoupon;
  purchaseAmount: number;
  discountAmount: number;
  finalAmount: number;
}

export interface CreateCouponRequest {
  title: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  courseIds?: string[];
  minPurchaseAmount?: number;
  maxUses?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

export interface UpdateCouponRequest extends Partial<CreateCouponRequest> {
  id: string;
}

export interface CouponsListParams extends BaseFilterParams {
  status?: string[];
  discountType?: string[];
}

export type CouponsListResponse = ListResponse<ICoupon>;
