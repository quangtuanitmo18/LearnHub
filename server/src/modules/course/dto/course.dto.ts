import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  Min,
  IsUUID,
  IsUrl,
  IsIn,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';
import { Transform } from 'class-transformer';
import {
  CourseStatus,
  CourseLevel,
  CourseType,
  type CourseStatusType,
  type CourseLevelType,
  type CourseTypeValue,
} from 'src/shared/constants/course.constant';
import { PaginationQueryDto } from 'src/shared/dto/pagination.dto';

export class BulkDeleteCourseDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  ids: string[];
}

export class CreateCourseDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsUUID()
  imageId?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  previewImageIds?: string[];

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsOptional()
  @IsString()
  introUrl?: string;

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

  @IsOptional()
  @IsBoolean()
  isFree?: boolean;

  @IsOptional()
  @IsEnum(CourseStatus)
  status?: CourseStatusType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  view?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sold?: number;

  @IsOptional()
  @IsEnum(CourseLevel)
  level?: CourseLevelType;

  @IsOptional()
  info?: any;

  @IsOptional()
  @IsUUID()
  categoryId?: string;
}

export class UpdateCourseDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsUUID()
  imageId?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  previewImageIds?: string[];

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsOptional()
  @IsUrl()
  introUrl?: string;

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

  @IsOptional()
  @IsBoolean()
  isFree?: boolean;

  @IsOptional()
  @IsEnum(CourseStatus)
  status?: CourseStatusType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  view?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sold?: number;

  @IsOptional()
  @IsEnum(CourseLevel)
  level?: CourseLevelType;

  @IsOptional()
  info?: any;

  @IsOptional()
  @IsUUID()
  authorId?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;
}

export class CourseQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(CourseStatus, { each: true })
  status?: CourseStatusType | CourseStatusType[];

  @IsOptional()
  @IsEnum(CourseLevel, { each: true })
  level?: CourseLevelType | CourseLevelType[];

  @IsOptional()
  @IsEnum(CourseType, { each: true })
  type?: CourseTypeValue | CourseTypeValue[];
}

export class PublicCourseQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? parseFloat(value) : value,
  )
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? parseFloat(value) : value,
  )
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsIn([
    'newest',
    'rating',
    'price',
    'alphabetical',
    'popular',
    'createdAt',
    'title',
  ])
  declare sortBy?:
    | 'newest'
    | 'rating'
    | 'price'
    | 'alphabetical'
    | 'popular'
    | 'createdAt'
    | 'title';

  @IsOptional()
  @IsEnum(CourseLevel, { each: true })
  level?: CourseLevelType | CourseLevelType[];

  @IsOptional()
  @IsEnum(CourseType, { each: true })
  type?: CourseTypeValue | CourseTypeValue[];
}
