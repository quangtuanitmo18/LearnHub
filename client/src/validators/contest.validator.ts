import { ContestStatus } from '@/types/contest';
import * as yup from 'yup';

export const contestSchema = yup.object({
  title: yup
    .string()
    .required('Contest title is required')
    .min(3, 'Contest title must be at least 3 characters')
    .max(200, 'Contest title must not exceed 200 characters'),
  slug: yup
    .string()
    .required('Slug is required')
    .min(3, 'Slug must be at least 3 characters')
    .max(200, 'Slug must not exceed 200 characters')
    .matches(/^[a-z0-9\-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: yup.string().optional().default(''),
  imageId: yup.string().optional().default(''),
  passScore: yup
    .number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .optional()
    .min(0, 'Pass score must be at least 0')
    .max(100, 'Pass score must not exceed 100'),
  maxAttempts: yup
    .number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .optional()
    .min(1, 'Max attempts must be at least 1'),
  durationSec: yup
    .number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .optional()
    .min(60, 'Duration must be at least 60 seconds'),
  startTime: yup.string().optional().default(''),
  endTime: yup.string().optional().default(''),
  showResultDate: yup.string().optional().default(''),
  isMembership: yup.boolean().required().default(false),
  status: yup.string().oneOf(Object.values(ContestStatus)).required().default(ContestStatus.DRAFT),
});

export type ContestSchema = yup.InferType<typeof contestSchema>;
