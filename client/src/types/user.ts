import { ListResponse, BaseFilterParams } from "./common";

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BANNED = "BANNED",
}

export enum UserType {
  FACEBOOK = "FACEBOOK",
  GOOGLE = "GOOGLE",
  DEFAULT = "DEFAULT",
}

export interface UserRole {
  id: string;
  name: string;
}

export interface IUser {
  id: string;
  username: string;
  email: string;
  password: string;
  status: UserStatus;
  avatar?: string;
  courses: string[];
  userType: UserType;
  roles: UserRole[];
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  bannedUsers: number;
  facebookUsers: number;
  googleUsers: number;
  defaultUsers: number;
}

export type UsersListResponse = ListResponse<IUser>;

export interface UsersFilterParams extends BaseFilterParams {
  status?: string[];
  userType?: string[];
  role?: string;
}

export interface UpdateUserRequest {
  id: string;
  username?: string;
  email?: string;
  status?: UserStatus;
  avatar?: string;
  courses?: string[];
  userType?: UserType;
  roleIds: string[];
}
