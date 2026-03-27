import { IsEnum, IsOptional, IsDateString, IsBoolean } from 'class-validator';
import {
  MembershipPlan,
  type MembershipPlanType,
} from 'src/shared/constants/user.constant';

export class UpdateMembershipDto {
  @IsEnum(MembershipPlan)
  plan: MembershipPlanType;
}

export class AdminUpdateMembershipDto {
  @IsOptional()
  @IsEnum(MembershipPlan)
  plan?: MembershipPlanType;

  @IsOptional()
  @IsDateString()
  planStartDate?: string;

  @IsOptional()
  @IsDateString()
  planEndDate?: string;

  @IsOptional()
  @IsBoolean()
  isMembership?: boolean;
}

export class MembershipResponseDto {
  plan: MembershipPlanType;
  planStartDate: Date | null;
  planEndDate: Date | null;
  isMembership: boolean;
  daysRemaining: number;
  isExpired: boolean;
}
