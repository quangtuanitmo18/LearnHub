import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  Min,
  IsUUID,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateChapterDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsUUID()
  courseId: string;
}

export class UpdateChapterDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? parseInt(value, 10) : value,
  )
  @IsNumber()
  @Min(0)
  order?: number;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsUUID()
  courseId?: string;
}

export class ReorderChapterItemDto {
  @IsUUID()
  id: string;

  @IsNumber()
  @Min(1)
  order: number;
}

export class ReorderChaptersDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderChapterItemDto)
  chapters: ReorderChapterItemDto[];
}
