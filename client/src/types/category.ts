import { ListResponse, BaseFilterParams } from './common';

export enum CategoryStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export interface ICategory {
  id: string;
  name: string;
  slug: string;
  status: CategoryStatus;
  createdAt: string;
  updatedAt: string;
}

export type CategoriesListResponse = ListResponse<ICategory>;

export interface CategoriesFilterParams extends BaseFilterParams {
  status?: string[];
}

// Category creation request
export interface CreateCategoryRequest {
  name: string;
  slug: string;
  status?: CategoryStatus;
}

// Category update request
export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {
  id: string;
}
