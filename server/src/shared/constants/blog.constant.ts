export const BlogStatus = {
  DRAFT: 'DRAFT',
  PENDING: 'PENDING',
  PUBLISHED: 'PUBLISHED',
  REJECTED: 'REJECTED',
} as const;

export type BlogStatusType = (typeof BlogStatus)[keyof typeof BlogStatus];
