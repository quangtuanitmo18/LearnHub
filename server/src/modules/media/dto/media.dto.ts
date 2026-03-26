import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsArray,
  ValidateNested,
  IsOptional,
  Min,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from 'src/shared/dto/pagination.dto';

// ==================== Media Filter DTO ====================
export class MediaFilterDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(['IMAGE', 'VIDEO'], { message: 'type must be either IMAGE or VIDEO' })
  type?: 'IMAGE' | 'VIDEO';
}

// ==================== File Info DTO ====================
export class FileInfoDto {
  @IsString()
  @IsNotEmpty()
  filename: string;

  @IsString()
  @IsNotEmpty()
  mimetype: string;

  @IsNumber()
  @Min(1)
  size: number;
}

// ==================== Request Presigned URLs DTO ====================
export class RequestPresignedDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileInfoDto)
  files: FileInfoDto[];
}

// ==================== Presigned URL Response Item ====================
export class PresignedUrlResponseItem {
  mediaId: string;
  uploadUrl: string;
  key: string;
  type: 'IMAGE' | 'VIDEO';
}

// ==================== Upload Complete DTO ====================
export class UploadCompleteDto {
  @IsString()
  @IsNotEmpty()
  mediaId: string;
}

// ==================== Video Processed DTO (Lambda callback) ====================
export class VideoProcessedDto {
  @IsString()
  @IsNotEmpty()
  mediaId: string;

  @IsString()
  @IsNotEmpty()
  playlistKey: string;

  @IsString()
  @IsOptional()
  thumbnailKey?: string;

  @IsNumber()
  @IsOptional()
  duration?: number;
}

// ==================== Create Media DTO (Internal) ====================
export class CreateMediaDto {
  userId: string;
  filename: string;
  size: bigint;
  mimetype: string;
  type: 'IMAGE' | 'VIDEO';
  storageKey: string;
  cdnBaseUrl: string;
  status?: 'UPLOADING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  thumbnailKey?: string;
  hlsPlaylistKey?: string;
  duration?: number;
  errorMessage?: string;
}

// ==================== Update Media DTO (Internal) ====================
export class UpdateMediaDto {
  storageKey?: string;
  thumbnailKey?: string;
  hlsPlaylistKey?: string;
  duration?: number;
  status?: 'UPLOADING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  errorMessage?: string;
}

// ==================== Media Response DTO ====================
export class MediaResponseDto {
  id: string;
  userId: string;
  filename: string;
  size: string; // BigInt serialized as string
  mimetype: string;
  type: 'IMAGE' | 'VIDEO';
  storageKey: string;
  thumbnailKey?: string;
  cdnBaseUrl: string;
  hlsPlaylistKey?: string;
  duration?: number;
  status: 'UPLOADING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;

  // Computed URLs for FE convenience
  mediaUrl?: string;
  thumbnailUrl?: string;
  hlsUrl?: string;
}
