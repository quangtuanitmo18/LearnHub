import { ApiService } from '@/lib/api-service';
import type {
  IUser,
  UpdateUserRequest,
  UsersFilterParams,
  UsersListResponse,
  UserStats,
} from '@/types/user';

// User API endpoints
const ENDPOINTS = {
  USERS: '/users',
  USER: (id: string) => `/users/${id}`,
  ADMIN_UPDATE_USER: (id: string) => `/users/admin/${id}`,
  USER_STATS: '/users/stats',
  BULK_DELETE: '/users/bulk-delete',
  AVATAR_PRESIGNED: '/users/avatar/presigned',
  AVATAR_UPLOAD_COMPLETE: '/users/avatar/upload-complete',
  AVATAR_DELETE: '/users/avatar',
} as const;

// Users service
export class UsersService {
  // Get all users with optional filtering
  static async getUsers(params: UsersFilterParams): Promise<UsersListResponse> {
    try {
      return await ApiService.get<UsersListResponse>(
        ENDPOINTS.USERS,
        params as unknown as Record<string, unknown>,
      );
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

  // Get a single user by ID
  static async getUser(id: string): Promise<IUser> {
    return ApiService.get<IUser>(ENDPOINTS.USER(id));
  }

  // Note: User creation is handled by registration/external auth
  // This functionality is intentionally removed from admin panel

  // Update an existing user (regular user update)
  static async updateUser(userData: UpdateUserRequest): Promise<IUser> {
    const { id, ...updateData } = userData;
    return ApiService.put<IUser, Omit<UpdateUserRequest, 'id'>>(ENDPOINTS.USER(id), updateData);
  }

  // Update user from admin panel (comprehensive admin update)
  static async updateUserAdmin(userData: UpdateUserRequest): Promise<IUser> {
    const { id, ...updateData } = userData;
    return ApiService.put<IUser, Omit<UpdateUserRequest, 'id'>>(
      ENDPOINTS.ADMIN_UPDATE_USER(id),
      updateData,
    );
  }

  // Delete a user
  static async deleteUser(id: string): Promise<void> {
    return ApiService.delete<void>(ENDPOINTS.USER(id));
  }

  // Bulk delete users
  static async bulkDeleteUsers(userIds: string[]): Promise<void> {
    return ApiService.post<void, { userIds: string[] }>(ENDPOINTS.BULK_DELETE, {
      userIds,
    });
  }

  // Get user statistics
  static async getUserStats(): Promise<UserStats> {
    return ApiService.get<UserStats>(ENDPOINTS.USER_STATS);
  }

  // Avatar upload methods
  // Get presigned URL for avatar upload
  static async getAvatarPresignedUrl(data: {
    filename: string;
    mimetype: string;
    size: number;
  }): Promise<{ uploadUrl: string; key: string; expiresIn: number }> {
    return ApiService.post<
      { uploadUrl: string; key: string; expiresIn: number },
      { filename: string; mimetype: string; size: number }
    >(ENDPOINTS.AVATAR_PRESIGNED, data);
  }

  // Complete avatar upload
  static async completeAvatarUpload(data: { key: string }): Promise<{ avatar: string }> {
    return ApiService.post<{ avatar: string }, { key: string }>(
      ENDPOINTS.AVATAR_UPLOAD_COMPLETE,
      data,
    );
  }

  // Delete avatar
  static async deleteAvatar(): Promise<{ message: string }> {
    return ApiService.delete<{ message: string }>(ENDPOINTS.AVATAR_DELETE);
  }
}

// Export as default for consistency with other services
export default UsersService;
