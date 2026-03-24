// Generic pagination metadata interface
export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

// Generic list response interface that can be used for any entity
export interface ListResponse<T> {
  result: T[];
  meta: PaginationMeta;
}

// Generic API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  data: T;
  message?: string;
  error?: string;
}

// Generic filter parameters
export interface BaseFilterParams {
  search?: string;
  page?: number;
  limit?: number;
}

// Common error types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  status: number;
  message: string;
  errors?: ValidationError[];
}
