export const ReviewStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export type ReviewStatusType = (typeof ReviewStatus)[keyof typeof ReviewStatus];
