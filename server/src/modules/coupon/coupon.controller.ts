import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { PERMISSIONS } from 'src/shared/configs/permission';
import { RequirePermissions } from 'src/shared/decorators/permission.decorator';
import { Public } from 'src/shared/decorators/public.decorator';
import { ResponseMessage } from 'src/shared/decorators/response-message.decorator';
import { PermissionGuard } from 'src/shared/guards/permission.guard';
import { CouponService } from './coupon.service';
import {
  CreateCouponDto,
  UpdateCouponDto,
  ValidateCouponDto,
  CouponQueryDto,
  BulkDeleteCouponDto,
} from './dto/coupon.dto';

@Controller('coupons')
@UseGuards(PermissionGuard)
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post()
  @RequirePermissions(PERMISSIONS.COUPON_CREATE)
  @ResponseMessage('Coupon created successfully')
  create(@Body() createCouponDto: CreateCouponDto) {
    return this.couponService.createCoupon(createCouponDto);
  }

  @Get()
  @RequirePermissions(PERMISSIONS.COUPON_READ)
  @ResponseMessage('Coupons retrieved successfully')
  findAll(@Query() couponQuery: CouponQueryDto) {
    return this.couponService.getAllCoupons(couponQuery);
  }

  @Get('valid')
  @Public()
  @ResponseMessage('Valid coupons retrieved successfully')
  findValid() {
    return this.couponService.getValidCoupons();
  }

  @Post('validate')
  @Public()
  @ResponseMessage('Coupon validated successfully')
  validate(@Body() validateCouponDto: ValidateCouponDto) {
    return this.couponService.validateCoupon(validateCouponDto);
  }

  @Post('apply')
  @ResponseMessage('Coupon applied successfully')
  apply(@Body() validateCouponDto: ValidateCouponDto) {
    return this.couponService.applyCoupon(
      validateCouponDto.code,
      validateCouponDto.courseIds,
    );
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.COUPON_READ)
  @ResponseMessage('Coupon retrieved successfully')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.couponService.getCouponById(id);
  }

  @Put(':id')
  @RequirePermissions(PERMISSIONS.COUPON_UPDATE)
  @ResponseMessage('Coupon updated successfully')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCouponDto: UpdateCouponDto,
  ) {
    return this.couponService.updateCoupon(id, updateCouponDto);
  }

  @Delete('bulk-delete')
  @RequirePermissions(PERMISSIONS.COUPON_DELETE)
  @ResponseMessage('Coupons deleted successfully')
  bulkDelete(@Body() bulkDeleteDto: BulkDeleteCouponDto) {
    return this.couponService.bulkDeleteCoupons(bulkDeleteDto.ids);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.COUPON_DELETE)
  @ResponseMessage('Coupon deleted successfully')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.couponService.deleteCoupon(id);
  }
}
