import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';

// Custom parameter serializer for arrays
const customParamsSerializer = (params: Record<string, unknown>) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      return; // Skip null/undefined values
    }

    if (Array.isArray(value)) {
      // For arrays, add multiple parameters with the same name (no brackets)
      value.forEach((item) => {
        if (item !== null && item !== undefined) {
          searchParams.append(key, String(item));
        }
      });
    } else {
      // For non-arrays, add normally
      searchParams.append(key, String(value));
    }
  });

  return searchParams.toString();
};

// API configuration
// - Browser: uses relative path → Next.js rewrites proxy to backend (same-origin, cookies auto-sent)
// - Server (SSR/RSC): uses absolute URL → calls NestJS directly (no cookies needed for public endpoints)
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    // Browser: relative path lets Next.js rewrites handle proxying
    return '/api/v1';
  }
  // Server: need absolute URL since there's no browser context
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
};

const API_CONFIG = {
  baseURL: getBaseURL(),
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  paramsSerializer: customParamsSerializer,
};

// Create the main Axios instance
export const apiClient: AxiosInstance = axios.create(API_CONFIG);

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// Response interceptor with token refresh logic
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // If 401 and not already retrying
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !(originalRequest as typeof originalRequest & { _retry?: boolean })._retry
    ) {
      // Don't retry refresh or login endpoints
      if (
        originalRequest.url?.includes('/auth/refresh') ||
        originalRequest.url?.includes('/auth/login')
      ) {
        handleUnauthorized();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => apiClient(originalRequest));
      }

      (originalRequest as typeof originalRequest & { _retry?: boolean })._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh tokens (cookie sent automatically)
        await apiClient.post('/auth/refresh');

        processQueue(null);
        // Retry the original request (new cookie is already set by server)
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        handleUnauthorized();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

const PROTECTED_PREFIXES = [
  '/admin',
  '/my-profile',
  '/my-orders',
  '/cart',
  '/learning',
  '/qr-payment',
];

function handleUnauthorized(): void {
  if (typeof window !== 'undefined') {
    // Clean up any legacy localStorage tokens
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');

    const pathname = window.location.pathname;
    const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

    // Only redirect to login if we are on a protected route
    if (isProtectedRoute && !pathname.startsWith('/auth/')) {
      const signInUrl = new URL('/auth/sign-in', window.location.origin);
      signInUrl.searchParams.set('callbackUrl', pathname);
      window.location.href = signInUrl.toString();
    }
  }
}

// Export configured instance
export default apiClient;
