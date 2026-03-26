import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  Put,
} from '@nestjs/common';
import { CouponService } from './coupon.service';
import {
  CreateCouponDto,
  UpdateCouponDto,
  ValidateCouponDto,
  CouponQueryDto,
  BulkDeleteCouponDto,
} from './dto/coupon.dto';
import { PaginationQueryDto } from 'src/shared/dto/pagination.dto';
import { ResponseMessage } from 'src/shared/decorators/response-message.decorator';

@Controller('coupons')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post()
  @ResponseMessage('Coupon created successfully')
  create(@Body() createCouponDto: CreateCouponDto) {
    return this.couponService.createCoupon(createCouponDto);
  }

  @Get()
  @ResponseMessage('Coupons retrieved successfully')
  findAll(@Query() couponQuery: CouponQueryDto) {
    return this.couponService.getAllCoupons(couponQuery);
  }

  @Get('valid')
  @ResponseMessage('Valid coupons retrieved successfully')
  findValid() {
    return this.couponService.getValidCoupons();
  }

  @Post('validate')
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
  @ResponseMessage('Coupon retrieved successfully')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.couponService.getCouponById(id);
  }

  @Put(':id')
  @ResponseMessage('Coupon updated successfully')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCouponDto: UpdateCouponDto,
  ) {
    return this.couponService.updateCoupon(id, updateCouponDto);
  }

  @Delete('bulk-delete')
  @ResponseMessage('Coupons deleted successfully')
  bulkDelete(@Body() bulkDeleteDto: BulkDeleteCouponDto) {
    return this.couponService.bulkDeleteCoupons(bulkDeleteDto.ids);
  }

  @Delete(':id')
  @ResponseMessage('Coupon deleted successfully')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.couponService.deleteCoupon(id);
  }
}
