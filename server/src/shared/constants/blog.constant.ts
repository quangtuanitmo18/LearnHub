export const BlogStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
} as const;

export type BlogStatusType = (typeof BlogStatus)[keyof typeof BlogStatus];
