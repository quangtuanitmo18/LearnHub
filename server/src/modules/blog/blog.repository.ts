import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/shared/services/base.service';
import { PrismaService } from 'src/shared/services/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { CreateBlogDto, UpdateBlogDto, BlogQueryDto } from './dto/blog.dto';
import { PaginatedResponseDto } from 'src/shared/dto/pagination.dto';
import { PaginationQueryDto } from 'src/shared/dto/pagination.dto';
import { BlogStatus } from 'src/generated/prisma/enums';

@Injectable()
export class BlogRepository extends BaseService<
  Prisma.BlogGetPayload<{ include: { author: true; category: true } }>,
  CreateBlogDto,
  UpdateBlogDto,
  Prisma.BlogWhereUniqueInput
> {
  protected modelName = Prisma.ModelName.Blog;

  constructor(prismaService: PrismaService) {
    super(prismaService, {
      defaultSortBy: 'createdAt',
      defaultSortOrder: 'desc',
      searchFields: ['title', 'content', 'excerpt'],
      selectFields: {
        id: true,
        title: true,
        slug: true,
        content: true,
        excerpt: true,
        thumbnail: true,
        status: true,
        publishedAt: true,
        authorId: true,
        categoryId: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  }

  /**
   * Find all blogs with filtering by status, author, and category
   */
  async findAllBlogs(
    blogQuery?: BlogQueryDto,
  ): Promise<PaginatedResponseDto<any>> {
    // Build additional where conditions for filtering
    const additionalWhere: any = {};

    if (blogQuery?.status) {
      if (Array.isArray(blogQuery.status)) {
        additionalWhere.status = { in: blogQuery.status };
      } else {
        additionalWhere.status = blogQuery.status;
      }
    }

    if (blogQuery?.authorId) {
      additionalWhere.authorId = blogQuery.authorId;
    }

    if (blogQuery?.categoryId) {
      additionalWhere.categoryId = blogQuery.categoryId;
    }

    // Use the base findAll method with additional filters
    return this.findAll(blogQuery, additionalWhere);
  }

  /**
   * Find blog by slug
   */
  async findBySlug(slug: string) {
    return this.findFirst({ slug });
  }

  /**
   * Find blogs by author
   */
  async findByAuthor(authorId: string, paginationQuery?: PaginationQueryDto) {
    return this.findAll(paginationQuery, { authorId });
  }

  /**
   * Bulk delete blogs by IDs
   */
  async bulkDelete(ids: string[]) {
    return this.prismaService.blog.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }

  /**
   * Find published blogs
   */
  async findPublished(paginationQuery?: PaginationQueryDto) {
    return this.findAll(paginationQuery, { status: 'PUBLISHED' });
  }

  /**
   * Check if slug exists (excluding current blog for updates)
   */
  async isSlugExists(slug: string, excludeId?: string) {
    const where: Prisma.BlogWhereInput = { slug };
    if (excludeId) {
      where.NOT = { id: excludeId };
    }
    const blog = await this.findFirst(where);
    return !!blog;
  }
}
