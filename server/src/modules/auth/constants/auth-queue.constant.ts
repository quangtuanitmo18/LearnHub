export const AUTH_QUEUE = 'auth-queue';

export const AUTH_JOBS = {
  CLEANUP_UNVERIFIED_USERS: 'cleanup-unverified-users',
} as const;

export type AuthJobType = (typeof AUTH_JOBS)[keyof typeof AUTH_JOBS];
