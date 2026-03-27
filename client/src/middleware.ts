import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Routes that require authentication — must match actual paths in app/(protected)/ and app/admin/
const PROTECTED_PREFIXES = [
  '/admin',
  '/my-profile',
  '/my-orders',
  '/cart',
  '/learning',
  '/qr-payment',
];

// Routes that should redirect to home if already authenticated
const AUTH_ROUTES = ['/auth/sign-in', '/auth/sign-up'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('access_token')?.value;

  // Check if the path matches any protected prefix
  const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  // Check if the path is an auth route
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // If the route is protected and there's no access token, redirect to login
  if (isProtectedRoute && !accessToken) {
    const signInUrl = new URL('/auth/sign-in', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // If user is already authenticated and trying to access auth routes, redirect to home
  if (isAuthRoute && accessToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protected routes
    '/admin/:path*',
    '/my-profile/:path*',
    '/my-orders/:path*',
    '/cart/:path*',
    '/learning/:path*',
    '/qr-payment/:path*',
    // Auth routes
    '/auth/:path*',
  ],
};
