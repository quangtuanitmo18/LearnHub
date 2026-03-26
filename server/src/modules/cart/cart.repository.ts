import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/shared/services/base.service';
import { PrismaService } from 'src/shared/services/prisma.service';
import { Prisma } from 'src/generated/prisma/client';

@Injectable()
export class CartRepository extends BaseService<
  Prisma.CartGetPayload<{ include: { items: true; user: true } }>,
  any,
  any,
  Prisma.CartWhereUniqueInput
> {
  protected modelName = Prisma.ModelName.Cart;

  constructor(prismaService: PrismaService) {
    super(prismaService, {
      defaultSortBy: 'createdAt',
      defaultSortOrder: 'desc',
      selectFields: {
        id: true,
        totalPrice: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
        items: {
          select: {
            id: true,
            title: true,
            price: true,
            oldPrice: true,
            thumbnail: true,
            courseId: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Find cart by user ID
   */
  async findByUserId(userId: string) {
    return this.findFirst({ userId });
  }

  /**
   * Get or create cart for user
   */
  async getOrCreateCart(
    userId: string,
  ): Promise<NonNullable<Awaited<ReturnType<typeof this.findByUserId>>>> {
    let cart = await this.findByUserId(userId);

    if (!cart) {
      const newCart = await this.prismaService.cart.create({
        data: {
          userId,
          totalPrice: 0,
        },
      });

      // Return with full relations
      cart = await this.findFirst({ id: newCart.id });

      if (!cart) {
        throw new Error('Failed to create cart');
      }
    }

    return cart;
  }

  /**
   * Add item to cart
   */
  async addItem(cartId: string, courseId: string, courseData: any) {
    // Check if item already exists in cart
    const existingItem = await this.prismaService.cartItem.findFirst({
      where: {
        cartId,
        courseId,
      },
    });

    if (existingItem) {
      return existingItem;
    }

    // Add new item
    const cartItem = await this.prismaService.cartItem.create({
      data: {
        cartId,
        courseId,
        title: courseData.title,
        price: courseData.price,
        oldPrice: courseData.oldPrice,
        thumbnail: courseData.image,
      },
    });

    // Update cart total price
    await this.updateCartTotal(cartId);

    return cartItem;
  }

  /**
   * Remove item from cart
   */
  async removeItem(cartItemId: string) {
    const cartItem = await this.prismaService.cartItem.findUnique({
      where: { id: cartItemId },
    });

    if (!cartItem) {
      return null;
    }

    const cartId: string = cartItem.cartId;

    await this.prismaService.cartItem.delete({
      where: { id: cartItemId },
    });

    // Update cart total price
    await this.updateCartTotal(cartId);

    return cartItem;
  }

  /**
   * Clear all items from cart
   */
  async clearCart(cartId: string) {
    await this.prismaService.cartItem.deleteMany({
      where: { cartId },
    });

    await this.prismaService.cart.update({
      where: { id: cartId },
      data: { totalPrice: 0 },
    });
  }

  /**
   * Update cart total price based on items
   */
  async updateCartTotal(cartId: string) {
    const cartItems = await this.prismaService.cartItem.findMany({
      where: { cartId },
    });

    const totalPrice = cartItems.reduce(
      (sum, item) => sum + Number(item.price),
      0,
    );

    await this.prismaService.cart.update({
      where: { id: cartId },
      data: { totalPrice },
    });

    return totalPrice;
  }

  /**
   * Get cart with items
   */
  async getCartWithItems(cartId: string) {
    return await this.prismaService.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
                image: true,
                price: true,
                oldPrice: true,
                isFree: true,
                status: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Check if course is in cart
   */
  async isCourseInCart(cartId: string, courseId: string): Promise<boolean> {
    const item = await this.prismaService.cartItem.findFirst({
      where: {
        cartId,
        courseId,
      },
    });

    return !!item;
  }
}
