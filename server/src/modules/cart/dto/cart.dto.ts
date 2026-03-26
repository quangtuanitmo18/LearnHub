import { IsUUID, IsOptional, IsNumber, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class AddToCartDto {
  @IsUUID()
  courseId: string;
}

export class UpdateCartItemDto {
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? parseFloat(value) : value,
  )
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price?: number;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? parseFloat(value) : value,
  )
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  oldPrice?: number;
}

export class RemoveFromCartDto {
  @IsUUID()
  cartItemId: string;
}
