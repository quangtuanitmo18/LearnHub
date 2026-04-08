const AUTH_ROUTE_PREFIX = '/auth/';

/**
 * Normalize callback URL to an internal, non-auth path.
 * This prevents redirect loops like /auth/sign-in -> /auth/sign-in.
 */
export function resolveAuthRedirectPath(
  rawCallbackUrl: string | null | undefined,
  fallbackPath: string,
): string {
  if (!rawCallbackUrl) return fallbackPath;

  let candidate = rawCallbackUrl.trim();
  if (!candidate) return fallbackPath;

  try {
    candidate = decodeURIComponent(candidate);
  } catch {
    // Keep original value when decode fails
  }

  if (/^https?:\/\//i.test(candidate)) {
    try {
      const parsed = new URL(candidate);
      if (typeof window !== 'undefined' && parsed.origin !== window.location.origin) {
        return fallbackPath;
      }
      candidate = `${parsed.pathname}${parsed.search}${parsed.hash}`;
    } catch {
      return fallbackPath;
    }
  }

  if (!candidate.startsWith('/') || candidate.startsWith('//')) {
    return fallbackPath;
  }

  if (candidate === '/auth' || candidate.startsWith(AUTH_ROUTE_PREFIX)) {
    return fallbackPath;
  }

  return candidate;
}
