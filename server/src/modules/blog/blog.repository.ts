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
        courseId: true,
        upvotesCount: true,
        viewsCount: true,
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
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });
  }

  /**
   * Find all blogs with filtering by status, author, category, and course
   */
  async findAllBlogs(
    blogQuery?: BlogQueryDto,
  ): Promise<PaginatedResponseDto<any>> {
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

    if (blogQuery?.courseId) {
      additionalWhere.courseId = blogQuery.courseId;
    }

    return this.findAll(blogQuery, additionalWhere);
  }

  /**
   * Find blog by slug
   */
  async findBySlug(slug: string) {
    return this.findFirst({ slug });
  }

  /**
   * Find blogs by author with pagination (My Posts)
   */
  async findByAuthor(authorId: string, paginationQuery?: PaginationQueryDto) {
    return this.findAll(paginationQuery, { authorId });
  }

  /**
   * Find blogs by author with status filter (My Posts with status tabs)
   */
  async findByAuthorWithStatus(
    authorId: string,
    status?: BlogStatus | BlogStatus[],
    paginationQuery?: PaginationQueryDto,
  ) {
    const where: any = { authorId };
    if (status) {
      if (Array.isArray(status)) {
        where.status = { in: status };
      } else {
        where.status = status;
      }
    }
    return this.findAll(paginationQuery, where);
  }

  /**
   * Find published blogs linked to a specific course (Community Articles)
   */
  async findPublishedByCourse(
    courseId: string,
    paginationQuery?: PaginationQueryDto,
  ) {
    return this.findAll(paginationQuery, {
      courseId,
      status: BlogStatus.PUBLISHED,
    });
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

  /**
   * Toggle upvote: returns { action: 'added' | 'removed', upvotesCount }
   */
  async toggleUpvote(blogId: string, userId: string) {
    const existing = await this.prismaService.blogUpvote.findUnique({
      where: { unique_user_blog_upvote: { userId, blogId } },
    });

    if (existing) {
      // Remove upvote
      await this.prismaService.blogUpvote.delete({
        where: { id: existing.id },
      });
      const blog = await this.prismaService.blog.update({
        where: { id: blogId },
        data: { upvotesCount: { decrement: 1 } },
        select: { upvotesCount: true, authorId: true },
      });
      return { action: 'removed' as const, ...blog };
    } else {
      // Add upvote
      await this.prismaService.blogUpvote.create({
        data: { userId, blogId },
      });
      const blog = await this.prismaService.blog.update({
        where: { id: blogId },
        data: { upvotesCount: { increment: 1 } },
        select: { upvotesCount: true, authorId: true },
      });
      return { action: 'added' as const, ...blog };
    }
  }

  /**
   * Check if a user has upvoted a blog
   */
  async hasUserUpvoted(blogId: string, userId: string): Promise<boolean> {
    const upvote = await this.prismaService.blogUpvote.findUnique({
      where: { unique_user_blog_upvote: { userId, blogId } },
    });
    return !!upvote;
  }

  /**
   * Increment view count
   */
  async incrementViewCount(blogId: string) {
    return this.prismaService.blog.update({
      where: { id: blogId },
      data: { viewsCount: { increment: 1 } },
    });
  }
}
