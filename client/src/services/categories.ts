import { ApiService } from "@/lib/api-service";
import {
  CategoriesFilterParams,
  CategoriesListResponse,
  CreateCategoryRequest,
  ICategory,
  UpdateCategoryRequest,
} from "@/types/category";

const ENDPOINTS = {
  CATEGORIES: "/categories",
  CATEGORIES_ALL: "/categories/all",
  CATEGORY: (id: string) => `/categories/${id}`,
} as const;

export class CategoriesService {
  // Get categories with pagination
  static async getCategories(
    params: CategoriesFilterParams
  ): Promise<CategoriesListResponse> {
    try {
      return await ApiService.get<CategoriesListResponse>(
        ENDPOINTS.CATEGORIES,
        params as Record<string, unknown>
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

  // Get all categories
  static async getAllCategories(): Promise<ICategory[]> {
    try {
      const response = await ApiService.get<{ categories: ICategory[] }>(
        ENDPOINTS.CATEGORIES_ALL
      );
      return response.categories || [];
    } catch {
      return [];
    }
  }

  // Get category by ID
  static async getCategory(id: string): Promise<ICategory> {
    return ApiService.get<ICategory>(ENDPOINTS.CATEGORY(id));
  }

  // Create category
  static async createCategory(
    categoryData: CreateCategoryRequest
  ): Promise<ICategory> {
    return ApiService.post<ICategory, CreateCategoryRequest>(
      ENDPOINTS.CATEGORIES,
      categoryData
    );
  }

  // Update category
  static async updateCategory(
    categoryData: UpdateCategoryRequest
  ): Promise<ICategory> {
    const { id, ...updateData } = categoryData;
    return ApiService.put<ICategory, Omit<UpdateCategoryRequest, "id">>(
      ENDPOINTS.CATEGORY(id),
      updateData
    );
  }

  // Patch category
  static async patchCategory(
    id: string,
    categoryData: Partial<CreateCategoryRequest>
  ): Promise<ICategory> {
    return ApiService.patch<ICategory, Partial<CreateCategoryRequest>>(
      ENDPOINTS.CATEGORY(id),
      categoryData
    );
  }

  // Delete category
  static async deleteCategory(id: string): Promise<void> {
    return ApiService.delete<void>(ENDPOINTS.CATEGORY(id));
  }

  // Bulk operations
  static async bulkDeleteCategories(categoryIds: string[]): Promise<void> {
    return ApiService.delete<void, { ids: string[] }>(
      `${ENDPOINTS.CATEGORIES}/bulk-delete`,
      { ids: categoryIds }
    );
  }
}

export default CategoriesService;
