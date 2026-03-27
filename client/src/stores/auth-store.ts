'use client';

import { AuthService, type CurrentUser } from '@/services/auth';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Use the CurrentUser type from auth service
export type AuthUser = CurrentUser;

// Auth store state
interface AuthState {
  // User state
  user: AuthUser | null;
  isLoading: boolean;

  // Auth actions
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;

  // Permission helper - only keep the one we actually use
  canPerformAction: (resource: string, action: 'create' | 'read' | 'update' | 'delete') => boolean;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set, get) => ({
      // Initial state
      user: null,
      isLoading: true,

      // Actions
      setUser: (user) => {
        set({ user });
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      // Fetch current user from /auth/me (cookie sent automatically)
      getCurrentUser: async () => {
        try {
          const userData = await AuthService.getAuthMe();
          set({ user: userData, isLoading: false });
        } catch {
          set({ user: null, isLoading: false });
        }
      },

      // Logout: call server to clear cookies, then reset state
      logout: async () => {
        try {
          await AuthService.logout();
        } catch {
          // Ignore logout errors
        }
        // Clean up any legacy localStorage tokens
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
        set({ user: null, isLoading: false });
      },

      canPerformAction: (resource, action) => {
        const state = get();
        const userPermissions = state?.user?.permissions || [];
        const permissionKey = `${resource.toLowerCase()}:${action}`;
        return userPermissions.includes(permissionKey);
      },
    }),
    {
      name: 'auth-store',
    },
  ),
);

// Selectors for performance optimization
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => !!state.user);
export const useIsLoading = () => useAuthStore((state) => state.isLoading);

// Main permission selector
export const useCanPerformAction = (
  resource: string,
  action: 'create' | 'read' | 'update' | 'delete',
) => useAuthStore((state) => state.canPerformAction(resource, action));
