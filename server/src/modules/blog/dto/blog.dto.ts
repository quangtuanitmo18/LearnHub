import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  MinLength,
  MaxLength,
  IsDateString,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';
import { BlogStatus } from 'src/generated/prisma/enums';

import { PaginationQueryDto } from 'src/shared/dto/pagination.dto';

export class BulkDeleteBlogDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  ids: string[];
}

export class CreateBlogDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  slug?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  excerpt?: string;

  @IsString()
  thumbnail: string;

  @IsOptional()
  @IsEnum(BlogStatus)
  status?: BlogStatus;

  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @IsOptional()
  @IsUUID()
  authorId?: string;

  @IsUUID()
  categoryId: string;

  @IsOptional()
  @IsUUID()
  courseId?: string;
}

export class CreateCommunityPostDto {
  @IsString()
  @MinLength(10)
  @MaxLength(255)
  title: string;

  @IsString()
  @MinLength(50)
  content: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  excerpt?: string;

  @IsOptional()
  @IsString()
  thumbnail?: string;

  @IsUUID()
  categoryId: string;

  @IsOptional()
  @IsUUID()
  courseId?: string;

  @IsOptional()
  @IsEnum(BlogStatus)
  status?: BlogStatus;
}

export class UpdateCommunityPostDto {
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(50)
  content?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  excerpt?: string;

  @IsOptional()
  @IsString()
  thumbnail?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsUUID()
  courseId?: string;

  @IsOptional()
  @IsEnum(BlogStatus)
  status?: BlogStatus;
}

export class UpdateBlogDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  slug?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  excerpt?: string;

  @IsOptional()
  @IsString()
  thumbnail?: string;

  @IsOptional()
  @IsEnum(BlogStatus)
  status?: BlogStatus;

  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @IsOptional()
  @IsUUID()
  authorId?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;
}

export class UpdateBlogStatusDto {
  @IsEnum(BlogStatus)
  status: BlogStatus;
}

export class BlogQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(BlogStatus, { each: true })
  status?: BlogStatus | BlogStatus[];

  @IsOptional()
  @IsUUID()
  authorId?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsUUID()
  courseId?: string;
}
