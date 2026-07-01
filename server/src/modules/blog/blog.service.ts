import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PointReason } from 'src/generated/prisma/client';
import { BlogStatus } from 'src/shared/constants/blog.constant';
import { PaginationQueryDto } from 'src/shared/dto/pagination.dto';
import { CategoryRepository } from '../category/category.repository';
import { GamificationService } from '../gamification/gamification.service';
import { UserRepository } from '../user/user.repository';
import { BlogRepository } from './blog.repository';
import { EmbedService } from '../ai-worker/embed.service';
import {
  BlogQueryDto,
  CreateBlogDto,
  CreateCommunityPostDto,
  UpdateBlogDto,
  UpdateCommunityPostDto,
} from './dto/blog.dto';

@Injectable()
export class BlogService {
  constructor(
    private readonly blogRepository: BlogRepository,
    private readonly userRepository: UserRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly gamificationService: GamificationService,
    private readonly embedService: EmbedService,
  ) {}

  // ==========================================
  // ADMIN ENDPOINTS (existing)
  // ==========================================

  async getAllBlogs(blogQuery?: BlogQueryDto) {
    return await this.blogRepository.findAllBlogs(blogQuery);
  }

  async getAllBlogsUnpaginated() {
    const blogs = await this.blogRepository.findMany(undefined, {
      createdAt: 'desc',
    });
    return { blogs };
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
    // Increment view count in background
    this.blogRepository.incrementViewCount(blog.id).catch(() => {});
    return blog;
  }

  private dispatchEmbedding(content: string, blogId: string): void {
    this.embedService
      .enqueueContent({ content, sourceType: 'BLOG', blogId })
      .catch((err) => console.error('Blog embed dispatch failed:', err));
  }

  private dispatchDeleteEmbedding(blogId: string): void {
    this.embedService
      .clearContent({ blogId })
      .catch((err) => console.error('Blog embed delete failed:', err));
  }

  async createBlog(createBlogDto: CreateBlogDto, authorId: string) {
    const category = await this.categoryRepository.findOneOrNull({
      id: createBlogDto.categoryId,
    });
    if (!category) {
      throw new BadRequestException('Category not found');
    }

    if (createBlogDto.slug) {
      const existingSlug = await this.blogRepository.isSlugExists(
        createBlogDto.slug,
      );
      if (existingSlug) {
        throw new BadRequestException('Blog slug already exists');
      }
    }

    if (
      createBlogDto.status === BlogStatus.PUBLISHED &&
      !createBlogDto.publishedAt
    ) {
      createBlogDto.publishedAt = new Date().toISOString();
    }

    const blog = await this.blogRepository.create({
      ...createBlogDto,
      authorId,
    });
    if (blog.status === BlogStatus.PUBLISHED && blog.content) {
      this.dispatchEmbedding(blog.content, blog.id);
    }
    return blog;
  }

  async updateBlog(id: string, updateBlogDto: UpdateBlogDto) {
    const existingBlog = await this.blogRepository.findOneOrNull({ id });
    if (!existingBlog) {
      throw new NotFoundException('Blog not found');
    }

    if (updateBlogDto.authorId) {
      const author = await this.userRepository.findOneOrNull({
        id: updateBlogDto.authorId,
      });
      if (!author) {
        throw new BadRequestException('Author not found');
      }
    }

    if (updateBlogDto.categoryId) {
      const category = await this.categoryRepository.findOneOrNull({
        id: updateBlogDto.categoryId,
      });
      if (!category) {
        throw new BadRequestException('Category not found');
      }
    }

    if (updateBlogDto.slug) {
      const existingSlug = await this.blogRepository.isSlugExists(
        updateBlogDto.slug,
        id,
      );
      if (existingSlug) {
        throw new BadRequestException('Blog slug already exists');
      }
    }

    if (
      updateBlogDto.status === BlogStatus.PUBLISHED &&
      !existingBlog.publishedAt &&
      !updateBlogDto.publishedAt
    ) {
      updateBlogDto.publishedAt = new Date().toISOString();
    }

    const updatedBlog = await this.blogRepository.update({ id }, updateBlogDto);
    if (updatedBlog.status === BlogStatus.PUBLISHED) {
      if (updatedBlog.content) {
        this.dispatchEmbedding(updatedBlog.content, updatedBlog.id);
      }
    } else {
      this.dispatchDeleteEmbedding(updatedBlog.id);
    }
    return updatedBlog;
  }

  async deleteBlog(id: string) {
    const existingBlog = await this.blogRepository.findOneOrNull({ id });
    if (!existingBlog) {
      throw new NotFoundException('Blog not found');
    }

    const result = await this.blogRepository.delete({ id });
    this.dispatchDeleteEmbedding(id);
    return result;
  }

  async bulkDeleteBlogs(ids: string[]) {
    if (!ids || ids.length === 0) {
      throw new BadRequestException('No IDs provided for deletion');
    }

    const result = await this.blogRepository.bulkDelete(ids);

    if (result.count === 0) {
      throw new NotFoundException('No blogs found with the provided IDs');
    }

    // Trigger vector deletion for all bulk-deleted blogs
    for (const id of ids) {
      this.dispatchDeleteEmbedding(id);
    }

    return {
      deletedCount: result.count,
      message: `Successfully deleted ${result.count} ${result.count === 1 ? 'blog' : 'blogs'}`,
    };
  }

  /**
   * Admin: Update blog status (Approve/Reject community posts)
   */
  async updateBlogStatus(id: string, status: string) {
    const blog = await this.blogRepository.findOneOrNull({ id });
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    const updateData: any = { status };

    // Set publishedAt when approving and award XP
    if (status === BlogStatus.PUBLISHED && !blog.publishedAt) {
      updateData.publishedAt = new Date();
      // Award points for publishing a community post
      if (blog.authorId) {
        this.gamificationService
          .handleAddPoints(blog.authorId, 50, PointReason.BLOG_PUBLISHED, {
            blogId: blog.id,
          })
          .catch((err) =>
            console.error(`Failed to award points for blog publish:`, err),
          );
      }
    }

    const updatedBlog = await this.blogRepository.update(
      { id },
      updateData as UpdateBlogDto,
    );
    if (updatedBlog.status === BlogStatus.PUBLISHED) {
      if (updatedBlog.content) {
        this.dispatchEmbedding(updatedBlog.content, updatedBlog.id);
      }
    } else {
      this.dispatchDeleteEmbedding(updatedBlog.id);
    }
    return updatedBlog;
  }

  // ==========================================
  // COMMUNITY ENDPOINTS (new)
  // ==========================================

  /**
   * Get current user's posts (My Posts tab)
   */
  async getMyPosts(userId: string, paginationQuery?: PaginationQueryDto) {
    return this.blogRepository.findByAuthorWithStatus(
      userId,
      undefined,
      paginationQuery,
    );
  }

  /**
   * Create a community post (any logged-in user)
   */
  async createCommunityPost(dto: CreateCommunityPostDto, userId: string) {
    // Validate category
    const category = await this.categoryRepository.findOneOrNull({
      id: dto.categoryId,
    });
    if (!category) {
      throw new BadRequestException('Category not found');
    }

    // Force status: only DRAFT or PENDING allowed
    const status =
      dto.status === BlogStatus.PENDING ? BlogStatus.PENDING : BlogStatus.DRAFT;

    // Generate slug from title
    const baseSlug = dto.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    let slug = baseSlug;
    let counter = 1;
    while (await this.blogRepository.isSlugExists(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Generate excerpt from content if not provided
    const excerpt =
      dto.excerpt ||
      dto.content
        .replace(/[#*`>\-\[\]()!]/g, '')
        .substring(0, 200)
        .trim() + '...';

    return this.blogRepository.create({
      title: dto.title,
      slug,
      content: dto.content,
      excerpt,
      thumbnail: dto.thumbnail || '',
      status,
      authorId: userId,
      categoryId: dto.categoryId,
      courseId: dto.courseId,
    } as CreateBlogDto);
  }

  /**
   * Update own community post (owner only, Draft/Pending/Rejected)
   */
  async updateCommunityPost(
    id: string,
    dto: UpdateCommunityPostDto,
    userId: string,
  ) {
    const blog = await this.blogRepository.findOneOrNull({ id });
    if (!blog) {
      throw new NotFoundException('Post not found');
    }

    if (blog.authorId !== userId) {
      throw new ForbiddenException('You can only edit your own posts');
    }

    // Cannot edit published posts
    if (blog.status === BlogStatus.PUBLISHED) {
      throw new BadRequestException(
        'Cannot edit a published post. Contact admin if changes are needed.',
      );
    }

    // Force status guard: can only set DRAFT or PENDING
    if (
      dto.status &&
      dto.status !== BlogStatus.DRAFT &&
      dto.status !== BlogStatus.PENDING
    ) {
      throw new BadRequestException(
        'You can only set status to DRAFT or PENDING',
      );
    }

    // Regenerate slug if title changed
    const updateData: any = { ...dto };
    if (dto.title && dto.title !== blog.title) {
      const baseSlug = dto.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      let slug = baseSlug;
      let counter = 1;
      while (await this.blogRepository.isSlugExists(slug, id)) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      updateData.slug = slug;
    }

    // Regenerate excerpt if content changed and no custom excerpt
    if (dto.content && !dto.excerpt) {
      updateData.excerpt =
        dto.content
          .replace(/[#*`>\-\[\]()!]/g, '')
          .substring(0, 200)
          .trim() + '...';
    }

    return this.blogRepository.update({ id }, updateData as UpdateBlogDto);
  }

  /**
   * Delete own community post (owner only, Draft/Pending only)
   */
  async deleteCommunityPost(id: string, userId: string) {
    const blog = await this.blogRepository.findOneOrNull({ id });
    if (!blog) {
      throw new NotFoundException('Post not found');
    }

    if (blog.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    if (
      blog.status === BlogStatus.PUBLISHED ||
      blog.status === BlogStatus.REJECTED
    ) {
      throw new BadRequestException(
        'Cannot delete a published or rejected post. Contact admin.',
      );
    }

    return this.blogRepository.delete({ id });
  }

  /**
   * Toggle upvote on a published blog
   */
  async toggleUpvote(blogId: string, userId: string) {
    const blog = await this.blogRepository.findOneOrNull({ id: blogId });
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    if (blog.status !== BlogStatus.PUBLISHED) {
      throw new BadRequestException('Can only upvote published posts');
    }

    // Don't allow self-upvote
    if (blog.authorId === userId) {
      throw new BadRequestException('Cannot upvote your own post');
    }

    const result = await this.blogRepository.toggleUpvote(blogId, userId);

    // If result.action === 'added' means an upvote was just added, give points to author
    if (result.action === 'added' && blog.authorId) {
      this.gamificationService
        .handleAddPoints(blog.authorId, 5, PointReason.BLOG_UPVOTED, {
          blogId,
          fromUserId: userId,
        })
        .catch((err) =>
          console.error(`Failed to award points for blog upvote:`, err),
        );
    }

    return result;
  }

  /**
   * Get published blogs for a course (Community Articles section)
   */
  async getCommunityBlogsByCourse(
    courseId: string,
    paginationQuery?: PaginationQueryDto,
  ) {
    return this.blogRepository.findPublishedByCourse(courseId, paginationQuery);
  }

  /**
   * Check if current user has upvoted
   */
  async checkUpvoteStatus(blogId: string, userId: string) {
    const hasUpvoted = await this.blogRepository.hasUserUpvoted(blogId, userId);
    return { hasUpvoted };
  }
}
