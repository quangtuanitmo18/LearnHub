import {
  IsString,
  IsOptional,
  IsArray,
  ArrayNotEmpty,
  IsUUID,
} from 'class-validator';

export class BulkDeleteArticleDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  ids: string[];
}

export class CreateArticleDto {
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateArticleDto {
  @IsOptional()
  @IsString()
  description?: string;
}
