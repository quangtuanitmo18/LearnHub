import { PostStatus } from '@/types/post';
import * as yup from 'yup';

export const postSchema = yup
  .object({
    title: yup.string().required('Title is required').min(3).max(200),
    slug: yup
      .string()
      .required('Slug is required')
      .matches(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
    content: yup
      .string()
      .required('Content is required')
      .min(50, 'Content must be at least 50 characters'),
    thumbnailId: yup.string().nullable().default(null),
    status: yup.mixed<PostStatus>().oneOf(Object.values(PostStatus)).required('Status is required'),
    tags: yup.array().of(yup.string().required()).default([]),
    publishedAt: yup.date().nullable().default(null),
  })
  .required();

export type PostSchema = yup.InferType<typeof postSchema>;
