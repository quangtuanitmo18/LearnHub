import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateBlogDto, UpdateBlogDto, BlogQueryDto } from './dto/blog.dto';
import { PaginationQueryDto } from 'src/shared/dto/pagination.dto';
import { BlogRepository } from './blog.repository';
import { UserRepository } from '../user/user.repository';
import { CategoryRepository } from '../category/category.repository';
import { BlogStatus } from 'src/shared/constants/blog.constant';

@Injectable()
export class BlogService {
  constructor(
    private readonly blogRepository: BlogRepository,
    private readonly userRepository: UserRepository,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async getAllBlogs(blogQuery?: BlogQueryDto) {
    return await this.blogRepository.findAllBlogs(blogQuery);
  }

  async getPublishedBlogs(paginationQuery?: PaginationQueryDto) {
    return this.blogRepository.findPublished(paginationQuery);
  }

  async getBlogById(id: string) {
    const blog = await this.blogRepository.findOneOrNull({ id });
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }
    return blog;
  }

  async getBlogBySlug(slug: string) {
    const blog = await this.blogRepository.findBySlug(slug);
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }
    return blog;
  }

  async createBlog(createBlogDto: CreateBlogDto, authorId: string) {
    // Validate category
    const category = await this.categoryRepository.findOneOrNull({
      id: createBlogDto.categoryId,
    });
    if (!category) {
      throw new BadRequestException('Category not found');
    }

    // Check if slug already exists
    if (createBlogDto.slug) {
      const existingSlug = await this.blogRepository.isSlugExists(
        createBlogDto.slug,
      );
      if (existingSlug) {
        throw new BadRequestException('Blog slug already exists');
      }
    }

    // Set publishedAt if status is PUBLISHED
    if (
      createBlogDto.status === BlogStatus.PUBLISHED &&
      !createBlogDto.publishedAt
    ) {
      createBlogDto.publishedAt = new Date().toISOString();
    }

    return this.blogRepository.create({ ...createBlogDto, authorId });
  }

  async updateBlog(id: string, updateBlogDto: UpdateBlogDto) {
    // Check if blog exists
    const existingBlog = await this.blogRepository.findOneOrNull({ id });
    if (!existingBlog) {
      throw new NotFoundException('Blog not found');
    }

    // Validate author if provided
    if (updateBlogDto.authorId) {
      const author = await this.userRepository.findOneOrNull({
        id: updateBlogDto.authorId,
      });
      if (!author) {
        throw new BadRequestException('Author not found');
      }
    }

    // Validate category if provided
    if (updateBlogDto.categoryId) {
      const category = await this.categoryRepository.findOneOrNull({
        id: updateBlogDto.categoryId,
      });
      if (!category) {
        throw new BadRequestException('Category not found');
      }
    }

    // Check if slug already exists (excluding current blog)
    if (updateBlogDto.slug) {
      const existingSlug = await this.blogRepository.isSlugExists(
        updateBlogDto.slug,
        id,
      );
      if (existingSlug) {
        throw new BadRequestException('Blog slug already exists');
      }
    }

    // Set publishedAt if status changes to PUBLISHED and no publishedAt yet
    if (
      updateBlogDto.status === BlogStatus.PUBLISHED &&
      !existingBlog.publishedAt &&
      !updateBlogDto.publishedAt
    ) {
      updateBlogDto.publishedAt = new Date().toISOString();
    }

    return this.blogRepository.update({ id }, updateBlogDto);
  }

  async deleteBlog(id: string) {
    // Check if blog exists
    const existingBlog = await this.blogRepository.findOneOrNull({ id });
    if (!existingBlog) {
      throw new NotFoundException('Blog not found');
    }

    return this.blogRepository.delete({ id });
  }

  async bulkDeleteBlogs(ids: string[]) {
    if (!ids || ids.length === 0) {
      throw new BadRequestException('No IDs provided for deletion');
    }

    const result = await this.blogRepository.bulkDelete(ids);

    if (result.count === 0) {
      throw new NotFoundException('No blogs found with the provided IDs');
    }

    return {
      deletedCount: result.count,
      message: `Successfully deleted ${result.count} ${result.count === 1 ? 'blog' : 'blogs'}`,
    };
  }
}
