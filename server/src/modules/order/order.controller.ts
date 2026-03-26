import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';

import { PERMISSIONS } from 'src/shared/configs/permission';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { RequirePermissions } from 'src/shared/decorators/permission.decorator';
import { ResponseMessage } from 'src/shared/decorators/response-message.decorator';
import { PaginationQueryDto } from 'src/shared/dto/pagination.dto';
import { PermissionGuard } from 'src/shared/guards/permission.guard';
import {
  CheckoutDto,
  OrderQueryDto,
  UpdateOrderStatusDto,
  MembershipCheckoutDto,
} from './dto/order.dto';
import { OrderService } from './order.service';
import { OrderStatusType } from 'src/shared/constants/order.constant';

@Controller('orders')
@UseGuards(PermissionGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('checkout')
  @ResponseMessage('Order created successfully')
  async checkout(
    @CurrentUser('sub') userId: string,
    @Body() checkoutDto: CheckoutDto,
  ) {
    return this.orderService.checkout(userId, checkoutDto);
  }

  @Get()
  @RequirePermissions(PERMISSIONS.ORDER_READ)
  @ResponseMessage('Orders retrieved successfully')
  async getAllOrders(@Query() queryDto: OrderQueryDto) {
    return this.orderService.getAllOrders(queryDto);
  }

  @Get('my-orders')
  @ResponseMessage('User orders retrieved successfully')
  async getMyOrders(
    @CurrentUser('sub') userId: string,
    @Query() paginationQuery: PaginationQueryDto,
    @Query('status') status?: OrderStatusType,
  ) {
    return this.orderService.getUserOrders(userId, paginationQuery, status);
  }

  @Get('code/:code')
  @RequirePermissions(PERMISSIONS.ORDER_READ)
  @ResponseMessage('Order retrieved successfully')
  async getOrderByCode(
    @Param('code') code: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.orderService.getOrderByCode(code, userId);
  }

  @Get(':id')
  @ResponseMessage('Order retrieved successfully')
  async getOrderById(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.orderService.getOrderById(id, userId);
  }

  @Put(':id/status')
  @RequirePermissions(PERMISSIONS.ORDER_UPDATE)
  @ResponseMessage('Order status updated successfully')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateOrderStatus(id, updateStatusDto);
  }

  @Delete(':id')
  @ResponseMessage('Order deleted successfully')
  async deleteOrder(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.orderService.deleteOrder(id, userId);
  }

  // ==================== MEMBERSHIP ENDPOINTS ====================

  @Post('membership/checkout')
  @ResponseMessage('Membership order created successfully')
  async checkoutMembership(
    @CurrentUser('sub') userId: string,
    @Body() membershipCheckoutDto: MembershipCheckoutDto,
  ) {
    return this.orderService.checkoutMembership(userId, membershipCheckoutDto);
  }
}
