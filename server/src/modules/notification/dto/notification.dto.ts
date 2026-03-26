import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsObject,
  IsArray,
  IsUUID,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationQueryDto } from 'src/shared/dto/pagination.dto';

export enum NotificationType {
  COURSE = 'COURSE',
  PAYMENT = 'PAYMENT',
  SYSTEM = 'SYSTEM',
}

export class CreateNotificationDto {
  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @IsArray()
  @IsUUID('4', { each: true })
  recipientIds: string[];
}

export class NotificationQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isRead?: boolean;
}

export class MarkNotificationReadDto {
  @IsUUID()
  notificationId: string;
}

export class MarkMultipleReadDto {
  @IsArray()
  @IsString({ each: true })
  recipientIds: string[];
}

export class DeleteMultipleNotificationsDto {
  @IsArray()
  @IsString({ each: true })
  recipientIds: string[];
}

// Response DTOs
export class NotificationResponseDto {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

export class NotificationCountDto {
  total: number;
  unread: number;
}
