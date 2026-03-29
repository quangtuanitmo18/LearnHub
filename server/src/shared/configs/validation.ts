import * as Zod from 'zod';

const envSchema = Zod.object({
  NODE_ENV: Zod.enum(['development', 'production']).default('development'),
  PORT: Zod.string()
    .default('3000')
    .transform((val) => parseInt(val, 10)),
  FRONTEND_URL: Zod.string().default('http://localhost:4000'),
  DATABASE_URL: Zod.string(),
  JWT_ACCESS_SECRET: Zod.string(),
  JWT_ACCESS_EXPIRES_IN: Zod.string(),
  JWT_REFRESH_SECRET: Zod.string(),
  JWT_REFRESH_EXPIRES_IN: Zod.string().optional(),
  AWS_S3_REGION: Zod.string(),
  AWS_S3_ENDPOINT: Zod.string().optional(),
  AWS_S3_ACCESS_KEY_ID: Zod.string(),
  AWS_S3_SECRET_ACCESS_KEY: Zod.string(),
  AWS_S3_PUBLIC_BUCKET: Zod.string(),
  AWS_CLOUDFRONT_URL: Zod.string(),
  CDN_BASE_URL: Zod.string(),
  SEPAY_API_KEY: Zod.string(),
  REDIS_HOST: Zod.string().default('localhost'),
  REDIS_PORT: Zod.string()
    .default('6379')
    .transform((val) => parseInt(val, 10)),
  // Mail configuration (optional for development)
  MAIL_HOST: Zod.string().optional(),
  MAIL_PORT: Zod.string().optional(),
  MAIL_SECURE: Zod.string().optional(),
  MAIL_USER: Zod.string().optional(),
  MAIL_PASSWORD: Zod.string().optional(),
  MAIL_FROM: Zod.string().optional(),
  MAIL_FROM_NAME: Zod.string().optional(),

  // Stripe configuration
  STRIPE_SECRET_KEY: Zod.string(),
  STRIPE_WEBHOOK_SECRET: Zod.string().optional(),
  STRIPE_PUBLISHABLE_KEY: Zod.string().optional(),
  STRIPE_SUCCESS_URL: Zod.string().optional(),
  STRIPE_CANCEL_URL: Zod.string().optional(),

  OPENROUTER_API_KEY: Zod.string().optional(),
  OPENROUTER_MODEL: Zod.string().optional(),
  GOOGLE_CLIENT_ID: Zod.string().optional(),
});

export const validate = (config: Record<string, unknown>) => {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    throw new Error(
      `Config validation error: ${JSON.stringify(result.error.format(), null, 2)}`,
    );
  }

  return result.data;
};
