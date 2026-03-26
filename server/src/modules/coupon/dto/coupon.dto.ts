import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  Min,
  IsEnum,
  IsDateString,
  IsArray,
  IsUUID,
  ArrayNotEmpty,
} from 'class-validator';
import { Transform } from 'class-transformer';
import {
  CouponDiscountType,
  CouponStatus,
  type CouponDiscountTypeValue,
  type CouponStatusType,
} from 'src/shared/constants/coupon.constant';
import { PaginationQueryDto } from 'src/shared/dto/pagination.dto';

export class BulkDeleteCouponDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  ids: string[];
}

export class CreateCouponDto {
  @IsString()
  title: string;

  @IsString()
  code: string;

  @IsEnum(CouponDiscountType)
  discountType: CouponDiscountTypeValue;

  @Transform(({ value }) =>
    typeof value === 'string' ? parseFloat(value) : value,
  )
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  discountValue: number;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? parseFloat(value) : value,
  )
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  minPurchaseAmount?: number;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? parseInt(value, 10) : value,
  )
  @IsNumber()
  @Min(1)
  maxUses?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  courseIds?: string[];
}

export class UpdateCouponDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsEnum(CouponDiscountType)
  discountType?: CouponDiscountTypeValue;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? parseFloat(value) : value,
  )
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  discountValue?: number;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? parseFloat(value) : value,
  )
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  minPurchaseAmount?: number;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? parseInt(value, 10) : value,
  )
  @IsNumber()
  @Min(1)
  maxUses?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  courseIds?: string[];
}

export class ValidateCouponDto {
  @IsString()
  code: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID(undefined, { each: true })
  courseIds: string[];
}

export class CouponQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(CouponDiscountType, { each: true })
  discountType?: CouponDiscountTypeValue | CouponDiscountTypeValue[];

  @IsOptional()
  @IsEnum(CouponStatus, { each: true })
  status?: CouponStatusType | CouponStatusType[];
}
