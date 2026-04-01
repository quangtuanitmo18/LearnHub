import { IsString, IsOptional, IsUrl } from 'class-validator';

export class UpdateInstructorProfileDto {
  @IsString()
  @IsOptional()
  headline?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsUrl()
  @IsOptional()
  website?: string;

  @IsUrl()
  @IsOptional()
  youtube?: string;

  @IsUrl()
  @IsOptional()
  linkedin?: string;
}
