import { Permission } from "@/configs/permission";
import { ListResponse, BaseFilterParams } from "./common";

export interface IRole {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  totalUsers: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export type RolesListResponse = ListResponse<IRole>;

export interface CreateRoleRequest {
  name: string;
  description: string;
  permissions: Permission[];
}

export interface UpdateRoleRequest extends Partial<CreateRoleRequest> {
  id: string;
}

export interface RolesFilterParams extends BaseFilterParams {
  hasPermissions?: boolean;
  sortBy?: keyof IRole;
  permissions?: Permission[];
}
