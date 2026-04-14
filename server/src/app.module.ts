import { BullModule } from '@nestjs/bullmq';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AiWorkerModule } from './modules/ai-worker/ai-worker.module';
import { ArticleModule } from './modules/article/article.module';
import { AuthGuard } from './modules/auth/auth.guard';
import { AuthModule } from './modules/auth/auth.module';
import { BlogModule } from './modules/blog/blog.module';
import { CartModule } from './modules/cart/cart.module';
import { CategoryModule } from './modules/category/category.module';
import { ChapterModule } from './modules/chapter/chapter.module';
import { ChatModule } from './modules/chat/chat.module';
import { CommentModule } from './modules/comment/comment.module';
import { CouponModule } from './modules/coupon/coupon.module';
import { CourseModule } from './modules/course/course.module';
import { EmailModule } from './modules/email/email.module';
import { InstructorModule } from './modules/instructor/instructor.module';
import { LessonModule } from './modules/lesson/lesson.module';
import { MediaModule } from './modules/media/media.module';
import { NotificationModule } from './modules/notification/notification.module';
import { OrderModule } from './modules/order/order.module';
import { PaymentModule } from './modules/payment/payment.module';
import { QuizAttemptModule } from './modules/quiz-attempt/quiz-attempt.module';
import { QuizQuestionModule } from './modules/quiz-question/quiz-question.module';
import { ReviewModule } from './modules/review/review.module';
import { RoleModule } from './modules/role/role.module';
import { SearchModule } from './modules/search/search.module';
import { StatsModule } from './modules/stats/stats.module';
import { UserLessonProgressModule } from './modules/user-lesson-progress/user-lesson-progress.module';
import { UserModule } from './modules/user/user.module';
import { configuration } from './shared/configs/configuration';
import { validate } from './shared/configs/validation';
import { GlobalExceptionFilter } from './shared/filters/global-exception.filter';
import { PermissionGuard } from './shared/guards/permission.guard';
import { ResponseInterceptor } from './shared/interceptors/response.interceptor';
import { SharedModule } from './shared/shared.module';

import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { NoteModule } from './modules/note/note.module';
import { CertificateModule } from './modules/certificate/certificate.module';
import { GamificationModule } from './modules/gamification/gamification.module';
import { redisStore } from 'cache-manager-ioredis-yet';
import { ContestModule } from './modules/contest/contest.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    RoleModule,
    BlogModule,
    MediaModule,
    CategoryModule,
    CourseModule,
    ChapterModule,
    LessonModule,
    ArticleModule,
    CouponModule,
    CartModule,
    OrderModule,
    ReviewModule,
    PaymentModule,
    EmailModule,
    NotificationModule,
    QuizAttemptModule,
    QuizQuestionModule,
    ChatModule,
    CommentModule,
    UserLessonProgressModule,
    StatsModule,
    SearchModule,
    SharedModule,
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      load: [configuration],
      validate,
      isGlobal: true,
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('redis.host'),
          port: configService.get('redis.port'),
          password: configService.get('redis.password'),
          maxRetriesPerRequest: 3,
          enableReadyCheck: false,
          ...(configService.get('redis.tls') ? { tls: {} } : {}),
        },
      }),
      inject: [ConfigService],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          host: configService.get('redis.host'),
          port: configService.get('redis.port'),
          password: configService.get('redis.password'),
          ...(configService.get('redis.tls') ? { tls: {} } : {}),
          ttl: 300000, // Default TTL: 5 minutes (in ms)
        }),
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 seconds
        limit: 50, // 50 requests per minute by default for all API endpoints
      },
    ]),
    InstructorModule,
    AiWorkerModule,
    NoteModule,
    CertificateModule,
    GamificationModule,
    ContestModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
  ],
})
export class AppModule {}
