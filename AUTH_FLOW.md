# LearnHub Authentication & Authorization Architecture

This document provides a comprehensive overview of how Authentication (AuthN) and Authorization (AuthZ) are implemented across the LearnHub project, both on the client (Next.js) and server (NestJS).

---

## 1. Authentication (AuthN) Flow

LearnHub uses a **Secure, HttpOnly Cookie-Based** authentication strategy. This ensures that sensitive tokens (Access & Refresh tokens) are inaccessible to client-side JavaScript, effectively mitigating Cross-Site Scripting (XSS) attacks.

### 1.1 Token Strategy
- **Access Token (`access_token`)**: 
  - Expiration: **1 Day**
  - Cookie Settings: `HttpOnly=true`, `Secure=true` (in production), `SameSite=lax`, `Path=/`
  - Purpose: Authenticating requests to protected API endpoints.
- **Refresh Token (`refresh_token`)**: 
  - Expiration: **7 Days**
  - Cookie Settings: `HttpOnly=true`, `Secure=true` (in production), `SameSite=strict`, `Path=/api/v1/auth/refresh`
  - Purpose: Obtaining new Access Tokens via token rotation without requiring the user to log in again. Note: The `Path` restricts the browser from sending this token to any endpoint other than `/auth/refresh`.

### 1.2 Cross-Origin Resource Sharing (CORS) & Proxies
To seamlessly send cookies between the Next.js frontend (e.g., `http://localhost:4000`) and the NestJS backend (e.g., `http://localhost:3000`), the architecture uses **Next.js Rewrites**:
- The Next.js frontend is configured to proxy requests starting with `/api/v1/*` to the original backend API.
- Because the browser perceives the frontend and backend as the *same origin* during API requests, cookies are sent automatically without relying on complex cross-site `SameSite=none` configurations.
- Server Components (SSR/RSC) in Next.js bypass this proxy, calling backend public endpoints via absolute URLs (`NEXT_PUBLIC_API_URL`), since Node.js has no browser cookie context.

### 1.3 Token Rotation & Auto-Refresh Flow
Client requests are managed through a custom Axios instance (`src/lib/api-client.ts`) with `withCredentials: true`. The interceptor handles token rotation automatically:
1. **Request Fails with 401**: If an API request returns a `401 Unauthorized` status (due to an expired access token).
2. **Pause & Queue**: The interceptor pauses other concurrent API requests and queues them.
3. **Refresh Request**: A silent `POST /auth/refresh` request is triggered. The browser automatically attaches the `refresh_token` cookie.
4. **Token Rotation**: 
   - The NestJS server verifies the refresh token.
   - It issues a brand-new `access_token` and `refresh_token`.
   - Both new tokens are sent back as `Set-Cookie` headers.
5. **Retry**: The interceptor retries the queue of paused original requests. Since the browser updated its cookies automatically, the renewed access token is securely passed along.
6. **Failure**: If the refresh token is also expired or invalid, the queue is cleared, local legacy tokens are cleaned up, and the user is redirected to `/auth/sign-in`.

### 1.4 Route Protection (Next.js Middleware)
Edge protection prevents unauthorized users from rendering protected pages natively. The `middleware.ts` executes on the edge before rendering:
- Routes such as `/admin`, `/my-profile`, `/my-orders`, `/cart`, `/learning`, and `/qr-payment` are **protected**.
- The middleware checks `request.cookies.get('access_token')`. If empty, it redirects the user to `/auth/sign-in` appending a `callbackUrl` for redirection post-login.
- Auth routes (`/auth/sign-in`, `/auth/sign-up`) redirect authenticated users back to `/`.

### 1.5 WebSocket Authentication
For real-time Socket.IO notifications:
- The WebSocket handshake explicitly includes `withCredentials: true` logic on the client (`src/lib/socket.ts`).
- Inside NestJS, `WsAuthMiddleware` automatically reads `handshake.headers.cookie` and manually extracts the `access_token` for JWT verification, maintaining connection-level security.

---

## 2. Authorization (AuthZ) Flow

Authorization is governed through a **Role-Based Access Control (RBAC)** strategy consisting of Roles and granular Permissions.

### 2.1 Backend Implementation (NestJS)
Permissions govern actions tied to resources using a `resource:action` format (e.g., `blog:create`, `course:read`).
- **Decorator (`@RequirePermissions`)**: Used on controller endpoints to specify what permission is required to access it. Example: `@RequirePermissions(PERMISSIONS.COURSE_CREATE)`.
- **PermissionGuard (`PermissionGuard`)**:
  - Automatically triggered globally or at module level.
  - Skips checking if the route is `@Public()`.
  - Determines the authenticated user using `context.switchToHttp().getRequest().user`.
  - Queries the database for the user's `roles` and aggregates a unique set of `permissions`.
  - Automatically permits operations if the user is a `Super Admin`.
  - Throws a `403 Forbidden` if the subset of user permissions does not satisfy the `@RequirePermissions` payload.

### 2.2 Frontend Implementation (Next.js)
The client requires knowledge of user permissions to conditionally render UI (e.g., hide the "Create Course" button if unauthorized).
- **Fetching State**: The `/auth/me` endpoint returns the aggregate `permissions: string[]` generated on the server alongside the user's profile.
- **Client Store**: Zustand (`auth-store.ts`) caches these permissions inside the `user` object.
- **Permission Hooks**: 
  - `useAuthStore().canPerformAction(resource, action)` dynamically checks if `resource:action` exists in the local permission cache.
  - The custom standard hook `usePermissions(resource)` returns a helper object `can(action)`, cleanly structuring conditionally rendered blocks without heavy boilerplate.

---

## 3. Security Best Practices Observed
- **XSS Mitigation**: Because Access/Refresh Tokens are `HttpOnly`, malicious injected scripts cannot execute `document.cookie` to steal the session.
- **CSRF Mitigation**: Next.js Rewrite proxy allows usage of `SameSite=lax` alongside Next.js standard non-destructive forms, defending against Cross-Site Request Forgery.
- **Token Rotation Reliability**: By rotating both tokens on refresh, long-lived token leakage vectors are dramatically reduced.
- **Secure Fallbacks**: The NestJS server (`AuthGuard`) can fallback perfectly to `Authorization: Bearer <token>` in case Mobile App development calls are made without cookie capabilities.
