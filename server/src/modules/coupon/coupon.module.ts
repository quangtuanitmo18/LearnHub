import { Module } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CouponController } from './coupon.controller';
import { CouponRepository } from './coupon.repository';
import { SharedModule } from 'src/shared/shared.module';
import { CourseModule } from '../course/course.module';

@Module({
  imports: [SharedModule, CourseModule],
  controllers: [CouponController],
  providers: [CouponService, CouponRepository],
  exports: [CouponService, CouponRepository],
})
export class CouponModule {}
