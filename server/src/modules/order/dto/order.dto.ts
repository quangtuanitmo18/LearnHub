import {
  IsEnum,
  IsOptional,
  IsString,
  IsArray,
  IsUUID,
  ArrayMinSize,
} from 'class-validator';
import {
  PaymentMethod,
  type PaymentMethodType,
} from 'src/shared/constants/payment.constant';
import {
  OrderStatus,
  OrderType,
  type OrderStatusType,
  type OrderTypeValue,
} from 'src/shared/constants/order.constant';
import {
  MembershipPlan,
  type MembershipPlanType,
} from 'src/shared/constants/user.constant';
import { PaginationQueryDto } from 'src/shared/dto/pagination.dto';

export class CreateOrderDto {
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethodType;

  @IsOptional()
  @IsString()
  couponCode?: string;
}

export class UpdateOrderDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatusType;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethodType;

  @IsOptional()
  @IsString()
  couponCode?: string;
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatusType;
}

export class CheckoutDto {
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethodType;

  @IsOptional()
  @IsString()
  couponCode?: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  courseIds: string[];
}

export class OrderQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(OrderStatus, { each: true })
  status?: OrderStatusType | OrderStatusType[];

  @IsOptional()
  @IsEnum(PaymentMethod, { each: true })
  paymentMethod?: PaymentMethodType | PaymentMethodType[];

  @IsOptional()
  @IsEnum(OrderType, { each: true })
  orderType?: OrderTypeValue | OrderTypeValue[];
}

export class MembershipCheckoutDto {
  @IsEnum(MembershipPlan)
  plan: MembershipPlanType;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethodType;
}
