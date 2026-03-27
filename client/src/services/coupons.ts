import { ApiService } from '@/lib/api-service';
import {
  CouponsListParams,
  CouponsListResponse,
  CreateCouponRequest,
  GetActiveCouponsRequest,
  ICoupon,
  UpdateCouponRequest,
  ValidateCouponRequest,
  ValidateCouponResponse,
} from '@/types/coupon';

const ENDPOINTS = {
  COUPONS: '/coupons',
  COUPONS_ALL: '/coupons/all',
  ACTIVE_COUPONS: '/coupons/active',
  VALID_COUPONS: '/coupons/valid',
  VALIDATE_COUPON: '/coupons/validate',
} as const;

export class CouponService {
  // Get coupons with pagination
  static async getCoupons(params?: CouponsListParams): Promise<CouponsListResponse> {
    try {
      return await ApiService.get<CouponsListResponse>(
        ENDPOINTS.COUPONS,
        params as Record<string, unknown>,
      );
    } catch {
      return {
        result: [],
        meta: {
          page: params?.page || 1,
          limit: params?.limit || 10,
          totalItems: 0,
          totalPages: 0,
        },
      };
    }
  }

  // Get all coupons
  static async getAllCoupons(): Promise<ICoupon[]> {
    try {
      const response = await ApiService.get<{ coupons: ICoupon[] }>(ENDPOINTS.COUPONS_ALL);
      return response.coupons || [];
    } catch {
      return [];
    }
  }

  // Get coupon by ID
  static async getCoupon(id: string): Promise<ICoupon> {
    return ApiService.get<ICoupon>(`${ENDPOINTS.COUPONS}/${id}`);
  }

  // Create coupon
  static async createCoupon(couponData: CreateCouponRequest): Promise<ICoupon> {
    return ApiService.post<ICoupon, CreateCouponRequest>(ENDPOINTS.COUPONS, couponData);
  }

  // Update coupon
  static async updateCoupon(couponData: UpdateCouponRequest): Promise<ICoupon> {
    const { id, ...updateData } = couponData;
    return ApiService.put<ICoupon, Omit<UpdateCouponRequest, 'id'>>(
      `${ENDPOINTS.COUPONS}/${id}`,
      updateData,
    );
  }

  // Patch coupon
  static async patchCoupon(id: string, couponData: Partial<CreateCouponRequest>): Promise<ICoupon> {
    return ApiService.patch<ICoupon, Partial<CreateCouponRequest>>(
      `${ENDPOINTS.COUPONS}/${id}`,
      couponData,
    );
  }

  // Delete coupon
  static async deleteCoupon(id: string): Promise<void> {
    return ApiService.delete<void>(`${ENDPOINTS.COUPONS}/${id}`);
  }

  // Bulk operations
  static async deleteCoupons(couponIds: string[]): Promise<void> {
    return ApiService.delete<void, { ids: string[] }>(`${ENDPOINTS.COUPONS}/bulk-delete`, {
      ids: couponIds,
    });
  }

  // Get active coupons
  static async getActiveCoupons(params?: GetActiveCouponsRequest): Promise<CouponsListResponse> {
    try {
      const response = await ApiService.get<CouponsListResponse>(
        ENDPOINTS.ACTIVE_COUPONS,
        params as Record<string, unknown>,
      );
      return response;
    } catch {
      return {
        result: [],
        meta: {
          page: 1,
          limit: 10,
          totalItems: 0,
          totalPages: 0,
        },
      };
    }
  }

  // Get valid coupons for current user (public, non-paginated)
  static async getValidCoupons(): Promise<ICoupon[]> {
    try {
      const response = await ApiService.get<ICoupon[]>(ENDPOINTS.VALID_COUPONS);
      return response;
    } catch {
      return [];
    }
  }

  // Validate coupon code
  static async validateCoupon(data: ValidateCouponRequest): Promise<ValidateCouponResponse> {
    return ApiService.post<ValidateCouponResponse, ValidateCouponRequest>(
      ENDPOINTS.VALIDATE_COUPON,
      data,
    );
  }
}

export default CouponService;
