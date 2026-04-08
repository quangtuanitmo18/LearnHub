import {
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsBoolean,
  IsNumber,
  Min,
} from 'class-validator';
import {
  UserStatus,
  UserType,
  MembershipPlan,
  type UserStatusType,
  type UserTypeValue,
  type MembershipPlanType,
} from 'src/shared/constants/user.constant';
import { PaginationQueryDto } from 'src/shared/dto/pagination.dto';

export class CreateUserDto {
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatusType;

  @IsOptional()
  @IsEnum(UserType)
  userType?: UserTypeValue;

  @IsOptional()
  @IsString()
  avatar?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatusType;

  @IsOptional()
  @IsEnum(UserType)
  userType?: UserTypeValue;

  @IsOptional()
  @IsString()
  avatar?: string;
}

export class UpdateMeDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}

export class UpdateUserAdminDto {
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatusType;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roleIds?: string[];
}

export class UserQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(UserStatus, { each: true })
  status?: UserStatusType | UserStatusType[];

  @IsOptional()
  @IsEnum(UserType, { each: true })
  userType?: UserTypeValue | UserTypeValue[];

  @IsOptional()
  @IsEnum(MembershipPlan, { each: true })
  plan?: MembershipPlanType | MembershipPlanType[];

  @IsOptional()
  @IsBoolean()
  isMembership?: boolean;
}

// ==================== AVATAR UPLOAD DTOs ====================

export class AvatarPresignedRequestDto {
  @IsString()
  filename: string;

  @IsString()
  mimetype: string;

  @IsNumber()
  @Min(1)
  size: number;
}

export class AvatarPresignedResponseDto {
  uploadUrl: string;
  key: string;
  expiresIn: number;
}

export class AvatarUploadCompleteDto {
  @IsString()
  key: string;
}

// ==================== USER SETTINGS DTOs ====================

export class UpdateUserSettingsDto {
  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  pushNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  marketingEmails?: boolean;

  @IsOptional()
  @IsBoolean()
  darkMode?: boolean;

  @IsOptional()
  @IsString()
  language?: string;
}

export class UserSettingsResponseDto {
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  darkMode: boolean;
  language: string;
}
