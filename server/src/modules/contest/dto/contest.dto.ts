import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  ArrayNotEmpty,
  IsUUID,
  IsBoolean,
  IsInt,
  IsDateString,
  Min,
} from 'class-validator';
import { ContestStatus } from 'src/generated/prisma/enums';

export class CreateContestDto {
  @IsString()
  title: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  imageId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  passScore?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxAttempts?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  durationSec?: number;

  @IsOptional()
  @IsDateString()
  startTime?: string;

  @IsOptional()
  @IsDateString()
  endTime?: string;

  @IsOptional()
  @IsDateString()
  showResultDate?: string;

  @IsOptional()
  @IsBoolean()
  isMembership?: boolean;
}

export class UpdateContestDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  imageId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  passScore?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxAttempts?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  durationSec?: number;

  @IsOptional()
  @IsDateString()
  startTime?: string;

  @IsOptional()
  @IsDateString()
  endTime?: string;

  @IsOptional()
  @IsDateString()
  showResultDate?: string;

  @IsOptional()
  @IsBoolean()
  isMembership?: boolean;

  @IsOptional()
  @IsEnum(ContestStatus)
  status?: ContestStatus;
}

export class BulkDeleteContestDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  ids: string[];
}
