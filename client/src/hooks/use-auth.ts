import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { signOut, signIn } from "next-auth/react";
import { AuthService } from "@/services/auth";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  UpdateProfileRequest,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  RegisterRequest,
  LoginRequest,
} from "@/services/auth";
import { ROUTE_CONFIG } from "@/configs/routes";

// Query keys for auth
export const authKeys = {
  all: ["auth"] as const,
  profile: () => [...authKeys.all, "profile"] as const,
  currentUser: () => [...authKeys.all, "currentUser"] as const,
};

// Hook to get current user profile
export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: () => AuthService.getAuthMe(),
  });
}

// Mutation hooks
export function useVerifyEmail() {
  return useMutation({
    mutationFn: (data: { token: string }) => AuthService.verifyEmail(data),
    onSuccess: (response) => {
      toast.success(response.message || "Email verified successfully!");
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { getCurrentUser } = useAuthStore();

  return useMutation({
    mutationFn: (profileData: UpdateProfileRequest) =>
      AuthService.updateProfile(profileData),
    onSuccess: async () => {
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: authKeys.currentUser() });
      queryClient.invalidateQueries({ queryKey: authKeys.profile() });
      // Also update auth store
      await getCurrentUser();
      toast.success("Profile updated successfully!");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to update profile");
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (passwordData: ChangePasswordRequest) =>
      AuthService.changePassword(passwordData),
    onSuccess: (response) => {
      toast.success(response.message || "Password changed successfully!");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to change password");
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (emailData: ForgotPasswordRequest) =>
      AuthService.forgotPassword(emailData),
    onSuccess: () => {
      toast.success("Password reset email sent successfully!");
    },
    onError: (error) => {
      toast.error(
        error?.message || "Failed to send reset email. Please try again."
      );
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (resetData: ResetPasswordRequest) =>
      AuthService.resetPassword(resetData),
    onSuccess: () => {
      toast.success("Password reset successfully!");
    },
    onError: (error) => {
      toast.error(
        error?.message || "Failed to reset password. Please try again."
      );
    },
  });
}

// Regular registration hook
export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: (userData: RegisterRequest) => AuthService.register(userData),
    onSuccess: () => {
      toast.success(
        "Registration successful! Please check your email to verify your account."
      );
      router.push(ROUTE_CONFIG.AUTH.SIGN_IN);
    },
    onError: async (error) => {
      await signOut({ redirect: false });
      toast.error(error?.message || "Registration failed. Please try again.");
    },
  });
}

// Social authentication hook - handles both login and registration
export function useSocialAuth(mode: "login" | "register") {
  const router = useRouter();
  const { getCurrentUser } = useAuthStore();

  // Start OAuth flow with NextAuth
  const startOAuthFlow = async (provider: "google" | "facebook") => {
    await signIn(provider, { redirect: false });
  };

  // Handle backend authentication after OAuth
  const handleBackendAuth = useMutation({
    mutationFn: async ({
      provider,
      token,
    }: {
      provider: "google" | "facebook";
      token: string;
    }) => {
      // Use unified auth endpoints for both login and register
      if (provider === "google") {
        return AuthService.googleAuth(token);
      }

      return AuthService.facebookAuth(token);
    },
    onSuccess: async (response) => {
      // Clear NextAuth session
      await signOut({ redirect: false });

      // Check if response has accessToken (login) or message (registration)
      const hasAccessToken = "accessToken" in response && response.accessToken;

      if (hasAccessToken) {
        // Login flow - store tokens and get user
        const authResponse = response as {
          accessToken: string;
          refreshToken: string;
        };
        if (typeof window !== "undefined") {
          localStorage.setItem("access_token", authResponse.accessToken);
          localStorage.setItem("refresh_token", authResponse.refreshToken);
        }
        await getCurrentUser();
        toast.success("Login successful!");
      } else {
        // Registration flow
        toast.success(
          (response as { message: string }).message ||
            "Registration successful!"
        );
        // Redirect to home page first, then login
        router.push(ROUTE_CONFIG.HOME);
        setTimeout(() => {
          router.push(ROUTE_CONFIG.AUTH.SIGN_IN);
        }, 1500);
      }
    },
    onError: async (error) => {
      await signOut({ redirect: false });
      toast.error(
        error?.message ||
          `${
            mode === "register" ? "Registration" : "Login"
          } failed. Please try again.`
      );
    },
  });

  return {
    startOAuthFlow,
    handleBackendAuth: handleBackendAuth.mutate,
    isPending: handleBackendAuth.isPending,
    error: handleBackendAuth.error,
  };
}

// Direct login hook (bypasses NextAuth)
export function useLogin() {
  const { getCurrentUser } = useAuthStore();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => AuthService.login(credentials),
    onSuccess: async (response) => {
      if (response && response.accessToken) {
        if (typeof window !== "undefined") {
          localStorage.setItem("access_token", response.accessToken);
          localStorage.setItem("refresh_token", response.refreshToken);
        }
        await getCurrentUser();
        toast.success("Login successful!");
      } else {
        toast.error("Invalid login response");
      }
    },
    onError: async (error) => {
      await signOut({ redirect: false });
      toast.error(error?.message || "Login failed. Please try again.");
    },
  });
}
