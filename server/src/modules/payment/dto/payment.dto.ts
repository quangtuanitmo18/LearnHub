import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum TransferType {
  IN = 'in',
  OUT = 'out',
}

export class WebhookPaymentBodyDto {
  @IsNumber()
  @Type(() => Number)
  id: number;

  @IsString()
  gateway: string;

  @IsDateString()
  transactionDate: string;

  @IsOptional()
  @IsString()
  accountNumber?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsEnum(TransferType)
  transferType: TransferType;

  @IsNumber()
  @Type(() => Number)
  transferAmount: number;

  @IsNumber()
  @Type(() => Number)
  accumulated: number;

  @IsOptional()
  @IsString()
  subAccount?: string;

  @IsOptional()
  @IsString()
  referenceCode?: string;

  @IsString()
  description: string;
}

export class CreateStripeCheckoutDto {
  @IsString()
  orderCode: string;
}

export class StripeCheckoutResponseDto {
  sessionId: string;
  sessionUrl: string;
  orderCode: string;
}
