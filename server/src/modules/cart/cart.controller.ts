import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PERMISSIONS } from 'src/shared/configs/permission';
import { RequirePermissions } from 'src/shared/decorators/permission.decorator';
import { ResponseMessage } from 'src/shared/decorators/response-message.decorator';
import { PermissionGuard } from 'src/shared/guards/permission.guard';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/cart.dto';

@Controller('cart')
@UseGuards(PermissionGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ResponseMessage('Cart retrieved successfully')
  async getCart(@CurrentUser('sub') userId: string) {
    return this.cartService.getUserCart(userId);
  }

  @Post('add')
  @ResponseMessage('Item added to cart successfully')
  async addToCart(
    @CurrentUser('sub') userId: string,
    @Body() addToCartDto: AddToCartDto,
  ) {
    return this.cartService.addToCart(userId, addToCartDto);
  }

  @Delete('remove/:cartItemId')
  @ResponseMessage('Item removed from cart successfully')
  async removeFromCart(
    @CurrentUser('sub') userId: string,
    @Param('cartItemId') cartItemId: string,
  ) {
    return this.cartService.removeFromCart(userId, cartItemId);
  }

  @Delete('clear')
  @ResponseMessage('Cart cleared successfully')
  async clearCart(@CurrentUser('sub') userId: string) {
    return this.cartService.clearCart(userId);
  }
}
