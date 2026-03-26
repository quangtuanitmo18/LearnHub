import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { CartRepository } from './cart.repository';
import { CourseRepository } from '../course/course.repository';
import { AddToCartDto } from './dto/cart.dto';
import { CourseStatus } from 'src/generated/prisma/enums';

@Injectable()
export class CartService {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly courseRepository: CourseRepository,
  ) {}

  /**
   * Get user's cart
   */
  async getUserCart(userId: string) {
    const cart = await this.cartRepository.getOrCreateCart(userId);
    return this.cartRepository.getCartWithItems(cart.id);
  }

  /**
   * Add course to cart
   */
  async addToCart(userId: string, addToCartDto: AddToCartDto) {
    const { courseId } = addToCartDto;

    // Get or create cart for user
    const cart = await this.cartRepository.getOrCreateCart(userId);

    // Check if course exists and is active
    const course = await this.courseRepository.findOneOrNull({ id: courseId });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.status !== CourseStatus.PUBLISHED) {
      throw new BadRequestException('Course is not available for purchase');
    }

    // Check if course is already in cart
    const isInCart = await this.cartRepository.isCourseInCart(
      cart.id,
      courseId,
    );
    if (isInCart) {
      throw new ConflictException('Course is already in cart');
    }

    // Get image URL from media relation
    const imageUrl = (course as any).image
      ? `${(course as any).image.cdnBaseUrl}/${(course as any).image.storageKey}`
      : null;

    // Add course to cart
    await this.cartRepository.addItem(cart.id, courseId, {
      title: course.title,
      price: course.price,
      oldPrice: course.oldPrice,
      image: imageUrl,
    });

    // Return updated cart with items
    return this.cartRepository.getCartWithItems(cart.id);
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(userId: string, cartItemId: string) {
    // Get user's cart
    const cart = await this.cartRepository.getOrCreateCart(userId);

    // Verify the cart item belongs to this user's cart
    const cartWithItems = await this.cartRepository.getCartWithItems(cart.id);
    const cartItem = cartWithItems?.items.find(
      (item) => item.id === cartItemId,
    );

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    // Remove item
    await this.cartRepository.removeItem(cartItemId);

    // Return updated cart
    return this.cartRepository.getCartWithItems(cart.id);
  }

  /**
   * Clear cart
   */
  async clearCart(userId: string) {
    const cart = await this.cartRepository.getOrCreateCart(userId);
    await this.cartRepository.clearCart(cart.id);

    return this.cartRepository.getCartWithItems(cart.id);
  }
}
