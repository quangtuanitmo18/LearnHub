import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { RoleModule } from './modules/role/role.module';
import { BlogModule } from './modules/blog/blog.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { GlobalExceptionFilter } from './shared/filters/global-exception.filter';
import { ResponseInterceptor } from './shared/interceptors/response.interceptor';
import { AuthGuard } from './modules/auth/auth.guard';
import { PermissionGuard } from './shared/guards/permission.guard';
import { SharedModule } from './shared/shared.module';
import { configuration } from './shared/configs/configuration';
import { validate } from './shared/configs/validation';
import { MediaModule } from './modules/media/media.module';
import { CategoryModule } from './modules/category/category.module';
import { CourseModule } from './modules/course/course.module';
import { ChapterModule } from './modules/chapter/chapter.module';
import { LessonModule } from './modules/lesson/lesson.module';
import { ArticleModule } from './modules/article/article.module';
import { CouponModule } from './modules/coupon/coupon.module';
import { CartModule } from './modules/cart/cart.module';
import { OrderModule } from './modules/order/order.module';
import { ReviewModule } from './modules/review/review.module';
import { PaymentModule } from './modules/payment/payment.module';
import { EmailModule } from './modules/email/email.module';
import { NotificationModule } from './modules/notification/notification.module';
import { QuizAttemptModule } from './modules/quiz-attempt/quiz-attempt.module';
import { ChatModule } from './modules/chat/chat.module';
import { CommentModule } from './modules/comment/comment.module';
import { UserLessonProgressModule } from './modules/user-lesson-progress/user-lesson-progress.module';

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
    ChatModule,
    CommentModule,
    UserLessonProgressModule,
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
        },
      }),
      inject: [ConfigService],
    }),
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
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
  ],
})
export class AppModule {}
