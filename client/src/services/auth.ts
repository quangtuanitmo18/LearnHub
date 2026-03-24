import { ApiService } from "@/lib/api-service";

// Auth endpoints
const ENDPOINTS = {
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  REFRESH: "/auth/refresh",
  PROFILE: "/auth/profile",
  ME: "/auth/me", // Add me endpoint
  REGISTER: "/auth/register",
  GOOGLE_AUTH: "/auth/google",
  FACEBOOK_AUTH: "/auth/facebook",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",
  VERIFY_EMAIL: "/auth/verify-email",
  RESEND_VERIFICATION: "/auth/resend-verification",
  UPDATE_PROFILE: "/auth/profile",
  CHANGE_PASSWORD: "/auth/password/change",
  AVATAR_PRESIGNED: "/auth/avatar/presigned",
  AVATAR_UPLOAD_COMPLETE: "/auth/avatar/upload-complete",
  AVATAR_DELETE: "/auth/avatar",
} as const;

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface GoogleAuthRequest {
  idToken: string;
}

export interface FacebookAuthRequest {
  accessToken: string;
}

export interface AuthResponse {
  user: {
    id: string;
    username: string;
    email: string;
    avatar?: string; // Optional avatar URL
    roles: string[];
  };
  accessToken: string;
  refreshToken: string;
}

// Membership interface for user subscription
export interface UserMembership {
  plan: string;
  isMembership: boolean;
  planStartDate: string;
  planEndDate: string;
  isActive: boolean;
}

// Extended user interface for /auth/me response
export interface CurrentUser {
  id: string;
  username: string;
  email: string;
  avatar?: string; // Optional avatar URL from UploadThing
  status: string;
  userType: string;
  roles: {
    id: string;
    name: string;
    description: string;
    permissions: string[];
  }[];
  permissions: string[];
  courses: string[];
  membership?: UserMembership | null;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  username?: string;
  email?: string;
  avatar?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Avatar upload types
export interface AvatarPresignedRequest {
  filename: string;
  mimetype: string;
  size: number;
}

export interface AvatarPresignedResponse {
  uploadUrl: string;
  key: string;
  expiresIn: number;
}

export interface AvatarUploadCompleteRequest {
  key: string;
}

export interface AvatarUploadCompleteResponse {
  avatar: string;
}

// Auth service
export class AuthService {
  // Login user
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    return ApiService.post<AuthResponse, LoginRequest>(
      ENDPOINTS.LOGIN,
      credentials
    );
  }

  // Register new user
  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    return ApiService.post<AuthResponse, RegisterRequest>(
      ENDPOINTS.REGISTER,
      userData
    );
  }

  // Unified Google authentication (handles both login and register)
  static async googleAuth(
    idToken: string
  ): Promise<AuthResponse | { message: string }> {
    return ApiService.post<
      AuthResponse | { message: string },
      GoogleAuthRequest
    >(ENDPOINTS.GOOGLE_AUTH, { idToken });
  }

  // Unified Facebook authentication (handles both login and register)
  static async facebookAuth(
    accessToken: string
  ): Promise<AuthResponse | { message: string }> {
    return ApiService.post<
      AuthResponse | { message: string },
      FacebookAuthRequest
    >(ENDPOINTS.FACEBOOK_AUTH, { accessToken });
  }

  // Logout user
  static async logout(): Promise<void> {
    return ApiService.post<void>(ENDPOINTS.LOGOUT);
  }

  // Refresh token
  static async refreshToken(): Promise<{
    token: string;
    refreshToken: string;
  }> {
    return ApiService.post<{ token: string; refreshToken: string }>(
      ENDPOINTS.REFRESH
    );
  }

  // Get user profile
  static async getProfile(): Promise<AuthResponse["user"]> {
    return ApiService.get<AuthResponse["user"]>(ENDPOINTS.PROFILE);
  }

  // Get current user with full details including role and permissions
  static async getAuthMe(): Promise<CurrentUser> {
    return ApiService.get<CurrentUser>(ENDPOINTS.ME);
  }

  // Forgot password
  static async forgotPassword(
    data: ForgotPasswordRequest
  ): Promise<{ message: string }> {
    return ApiService.post<{ message: string }, ForgotPasswordRequest>(
      ENDPOINTS.FORGOT_PASSWORD,
      data
    );
  }

  // Reset password
  static async resetPassword(
    data: ResetPasswordRequest
  ): Promise<{ message: string }> {
    return ApiService.post<{ message: string }, ResetPasswordRequest>(
      ENDPOINTS.RESET_PASSWORD,
      data
    );
  }

  // Update user profile
  static async updateProfile(data: UpdateProfileRequest): Promise<CurrentUser> {
    return ApiService.put<CurrentUser, UpdateProfileRequest>(
      ENDPOINTS.UPDATE_PROFILE,
      data
    );
  }

  // Change password
  static async changePassword(
    data: ChangePasswordRequest
  ): Promise<{ message: string }> {
    return ApiService.put<{ message: string }, ChangePasswordRequest>(
      ENDPOINTS.CHANGE_PASSWORD,
      data
    );
  }

  // Verify email
  static async verifyEmail(data: { token: string }): Promise<{
    success: boolean;
    message: string;
    statusCode: number;
  }> {
    const res = await ApiService.post<
      {
        success: boolean;
        message: string;
        statusCode: number;
      },
      { token: string }
    >(ENDPOINTS.VERIFY_EMAIL, data);

    return res;
  }

  // Get presigned URL for avatar upload
  static async getAvatarPresignedUrl(
    data: AvatarPresignedRequest
  ): Promise<AvatarPresignedResponse> {
    return ApiService.post<AvatarPresignedResponse, AvatarPresignedRequest>(
      ENDPOINTS.AVATAR_PRESIGNED,
      data
    );
  }

  // Complete avatar upload
  static async completeAvatarUpload(
    data: AvatarUploadCompleteRequest
  ): Promise<AvatarUploadCompleteResponse> {
    return ApiService.post<
      AvatarUploadCompleteResponse,
      AvatarUploadCompleteRequest
    >(ENDPOINTS.AVATAR_UPLOAD_COMPLETE, data);
  }

  // Delete avatar
  static async deleteAvatar(): Promise<{ message: string }> {
    return ApiService.delete<{ message: string }>(ENDPOINTS.AVATAR_DELETE);
  }
}

export default AuthService;
