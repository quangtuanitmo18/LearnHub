import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/shared/services/base.service';
import { PrismaService } from 'src/shared/services/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { PaginationQueryDto } from 'src/shared/dto/pagination.dto';
import { type ReactionTypeType } from 'src/shared/constants/comment.constant';

@Injectable()
export class CommentRepository extends BaseService<
  Prisma.CommentGetPayload<{
    include: {
      user: true;
      reactions: { include: { user: true } };
      _count: { select: { children: true } };
    };
  }>,
  any,
  any,
  Prisma.CommentWhereUniqueInput
> {
  protected modelName = Prisma.ModelName.Comment;

  constructor(prismaService: PrismaService) {
    super(prismaService, {
      defaultSortBy: 'createdAt',
      defaultSortOrder: 'desc',
      searchFields: ['content'],
      selectFields: {
        id: true,
        lessonId: true,
        blogId: true,
        userId: true,
        parentId: true,
        content: true,
        level: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
          },
        },
      },
    });
  }

  /**
   * Find root comments for a lesson (parentId is null)
   */
  async findRootCommentsByLesson(
    lessonId: string,
    paginationQuery?: PaginationQueryDto,
    status?: string,
  ) {
    const where: Prisma.CommentWhereInput = {
      lessonId,
      parentId: null,
    };

    if (status) {
      (where as any).status = status;
    }

    return this.findAll(paginationQuery, where);
  }

  /**
   * Find root comments for a blog (parentId is null)
   */
  async findRootCommentsByBlog(
    blogId: string,
    paginationQuery?: PaginationQueryDto,
    status?: string,
  ) {
    const where: Prisma.CommentWhereInput = {
      blogId,
      parentId: null,
    };

    if (status) {
      (where as any).status = status;
    }

    return this.findAll(paginationQuery, where);
  }

  /**
   * Find direct children (replies) of a comment
   */
  async findRepliesByCommentId(commentId: string, status?: string) {
    const where: Prisma.CommentWhereInput = {
      parentId: commentId,
    };

    if (status) {
      (where as any).status = status;
    }

    return this.prismaService.comment.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
        _count: {
          select: {
            children: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  /**
   * Find comment with reactions aggregated by type
   */
  async findCommentWithReactions(commentId: string, userId?: string) {
    const comment = await this.prismaService.comment.findUnique({
      where: { id: commentId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
        _count: {
          select: {
            children: true,
          },
        },
      },
    });

    if (!comment) {
      return null;
    }

    // Aggregate reactions by type
    const reactionsMap: Record<string, number> = {};
    let myReaction: string | null = null;

    comment.reactions.forEach((reaction) => {
      reactionsMap[reaction.type] = (reactionsMap[reaction.type] || 0) + 1;
      if (userId && reaction.userId === userId) {
        myReaction = reaction.type;
      }
    });

    // Extract _count and exclude it from the response (we replace reactions with aggregated map)
    const { _count, ...commentData } = comment;

    return {
      ...commentData,
      reactions: reactionsMap,
      myReaction,
      replyCount: _count.children,
    };
  }

  /**
   * Find root comments with reactions aggregated (generic for lesson or blog)
   */
  async findRootCommentsWithReactions(
    targetId: string,
    targetType: 'lesson' | 'blog',
    paginationQuery?: PaginationQueryDto,
    userId?: string,
    status?: string,
  ) {
    const where: Prisma.CommentWhereInput = {
      ...(targetType === 'lesson'
        ? { lessonId: targetId }
        : { blogId: targetId }),
      parentId: null,
    };

    if (status) {
      (where as any).status = status;
    }

    const comments = await this.findAll(paginationQuery, where);

    // Process each comment to aggregate reactions
    const processedComments = await Promise.all(
      comments.result.map(async (comment: { id: string }) => {
        const commentWithReactions = await this.findCommentWithReactions(
          comment.id,
          userId,
        );
        return commentWithReactions;
      }),
    );

    return {
      ...comments,
      result: processedComments.filter((c) => c !== null),
    };
  }

  /**
   * Create comment with level calculation
   */
  async createComment(data: {
    lessonId?: string;
    blogId?: string;
    userId: string;
    content: string;
    parentId?: string;
  }) {
    let level = 0;
    if (data.parentId) {
      const parent = await this.findOneOrNull({ id: data.parentId });
      if (parent) {
        level = parent.level + 1;
      }
    }

    return this.create({
      lessonId: data.lessonId || null,
      blogId: data.blogId || null,
      userId: data.userId,
      content: data.content,
      parentId: data.parentId || null,
      level,
    });
  }

  /**
   * Toggle reaction (create or update if exists)
   */
  async toggleReaction(
    commentId: string,
    userId: string,
    type: ReactionTypeType,
  ) {
    const existingReaction =
      await this.prismaService.commentReaction.findUnique({
        where: {
          unique_comment_user_reaction: {
            commentId,
            userId,
          },
        },
      });

    if (existingReaction) {
      if (existingReaction.type === type) {
        // Remove reaction if same type
        await this.prismaService.commentReaction.delete({
          where: {
            id: existingReaction.id,
          },
        });
      } else {
        // Update reaction type
        await this.prismaService.commentReaction.update({
          where: {
            id: existingReaction.id,
          },
          data: { type },
        });
      }
    } else {
      // Create new reaction
      await this.prismaService.commentReaction.create({
        data: {
          commentId,
          userId,
          type,
        },
      });
    }

    // Return updated comment with reactions
    return this.findCommentWithReactions(commentId, userId);
  }

  /**
   * Update comment status
   */
  async updateStatus(commentId: string, status: string) {
    return await this.prismaService.comment.update({
      where: { id: commentId },
      data: { status: status as any },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
        _count: {
          select: {
            children: true,
          },
        },
      },
    });
  }

  /**
   * Bulk delete comments by IDs
   */
  async bulkDelete(ids: string[]) {
    return this.prismaService.comment.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }
}
