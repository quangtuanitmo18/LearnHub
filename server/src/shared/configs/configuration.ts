export const configuration = () => ({
  nodeEnv: process.env.NODE_ENV,
  port: parseInt(process.env.PORT || '', 10) || 3000,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4000',
  databaseUrl: process.env.DATABASE_URL,
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
  },
  aws: {
    s3: {
      region: process.env.AWS_S3_REGION || 'ru-central1',
      endpoint:
        process.env.AWS_S3_ENDPOINT || 'https://storage.yandexcloud.net',
      publicBucket: process.env.AWS_S3_PUBLIC_BUCKET || '',
      rawBucket: process.env.AWS_S3_RAW_BUCKET || '',
      accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY || '',
    },
    cloudfront: {
      url: process.env.AWS_CLOUDFRONT_URL || '',
    },
  },
  cdn: {
    baseUrl: process.env.CDN_BASE_URL || '',
  },
  payment: {
    sepayApiKey: process.env.SEPAY_API_KEY || '',
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY || '',
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
      successUrl:
        process.env.STRIPE_SUCCESS_URL ||
        'http://localhost:3000/payment/success',
      cancelUrl:
        process.env.STRIPE_CANCEL_URL || 'http://localhost:3000/payment/cancel',
    },
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },
  mail: {
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.MAIL_PORT || '587', 10),
    secure: process.env.MAIL_SECURE === 'true',
    user: process.env.MAIL_USER || '',
    password: process.env.MAIL_PASSWORD || '',
    from: process.env.MAIL_FROM || 'noreply@example.com',
    fromName: process.env.MAIL_FROM_NAME || 'NestJS Tutorial',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
  },
  facebook: {
    appId: process.env.FACEBOOK_APP_ID || '',
    appSecret: process.env.FACEBOOK_APP_SECRET || '',
  },
});
