import { ApiService } from '@/lib/api-service';
import type {
  CreateRoleRequest,
  IRole,
  RolesFilterParams,
  RolesListResponse,
  UpdateRoleRequest,
} from '@/types/role';

const ENDPOINTS = {
  ROLES: '/roles',
  ROLE: (id: string) => `/roles/${id}`,
  ROLE_STATS: '/roles/stats',
} as const;

export class RolesService {
  // Get roles
  static async getRoles(params?: RolesFilterParams): Promise<RolesListResponse> {
    try {
      return await ApiService.get<RolesListResponse>(
        ENDPOINTS.ROLES,
        params as Record<string, unknown>,
      );
    } catch {
      return {
        result: [],
        meta: { page: 1, limit: 10, totalItems: 0, totalPages: 0 },
      };
    }
  }

  // Get role by ID
  static async getRole(id: string): Promise<IRole> {
    return ApiService.get<IRole>(ENDPOINTS.ROLE(id));
  }

  // Create role
  static async createRole(roleData: CreateRoleRequest): Promise<IRole> {
    return ApiService.post<IRole, CreateRoleRequest>(ENDPOINTS.ROLES, roleData);
  }

  // Update role
  static async updateRole(roleData: UpdateRoleRequest): Promise<IRole> {
    const { id, ...updateData } = roleData;
    return ApiService.put<IRole, Omit<UpdateRoleRequest, 'id'>>(ENDPOINTS.ROLE(id), updateData);
  }

  // Delete role
  static async deleteRole(id: string): Promise<void> {
    return ApiService.delete<void>(ENDPOINTS.ROLE(id));
  }
}

export default RolesService;
