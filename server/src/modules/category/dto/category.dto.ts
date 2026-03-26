import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  ArrayNotEmpty,
  IsUUID,
} from 'class-validator';
import {
  CategoryStatus,
  type CategoryStatusType,
} from 'src/shared/constants/category.constant';

export class BulkDeleteCategoryDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  ids: string[];
}

export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsEnum(CategoryStatus, {
    message: 'status must be a valid CategoryStatus',
  })
  status?: CategoryStatusType;
}

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsEnum(CategoryStatus, {
    message: 'status must be a valid CategoryStatus',
  })
  status?: CategoryStatusType;
}
