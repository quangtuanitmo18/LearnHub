import { IsString, IsArray, IsOptional } from 'class-validator';
import { Permission } from 'src/shared/configs/permission';

export class CreateRoleDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsArray()
  @IsString({ each: true })
  permissions: Permission[];
}

export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: Permission[];
}

export class AssignRoleDto {
  @IsString()
  userId: string;

  @IsString()
  roleId: string;
}
