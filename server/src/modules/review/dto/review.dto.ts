import {
  IsString,
  IsInt,
  Min,
  Max,
  IsEnum,
  IsOptional,
  IsUUID,
  MinLength,
  MaxLength,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';
import {
  ReviewStatus,
  type ReviewStatusType,
} from 'src/shared/constants/review.constant';

export class BulkDeleteReviewDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  ids: string[];
}

export class CreateReviewDto {
  @IsInt()
  @Min(1)
  @Max(5)
  star: number;

  @IsString()
  @MinLength(2)
  @MaxLength(1000)
  content: string;

  @IsUUID()
  courseId: string;
}

export class UpdateReviewDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  star?: number;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  content?: string;
}

export class UpdateReviewStatusDto {
  @IsEnum(ReviewStatus)
  status: ReviewStatusType;
}

export class ReviewQueryDto {
  @IsOptional()
  @IsEnum(ReviewStatus)
  status?: ReviewStatusType;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  star?: number;

  @IsOptional()
  @IsUUID()
  courseId?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;
}
