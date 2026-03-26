import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { CommentRepository } from './comment.repository';
import { LessonRepository } from '../lesson/lesson.repository';
import { UserRepository } from '../user/user.repository';
import {
  CreateCommentDto,
  UpdateCommentDto,
  ReactCommentDto,
  UpdateCommentStatusDto,
  CommentQueryDto,
} from './dto/comment.dto';
import { PaginationQueryDto } from 'src/shared/dto/pagination.dto';
import { CommentStatus } from 'src/shared/constants/comment.constant';

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly lessonRepository: LessonRepository,
    private readonly userRepository: UserRepository,
  ) {}

  /**
   * Get root comments for a lesson
   */
  async getLessonComments(
    lessonId: string,
    paginationQuery?: PaginationQueryDto,
    userId?: string,
  ) {
    // Verify lesson exists
    const lesson = await this.lessonRepository.findOneOrNull({ id: lessonId });
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    // For public endpoints, only show APPROVED comments
    return this.commentRepository.findRootCommentsWithReactions(
      lessonId,
      paginationQuery,
      userId,
      CommentStatus.APPROVED as string,
    );
  }

  /**
   * Get replies for a comment
   */
  async getCommentReplies(commentId: string, userId?: string) {
    const comment = await this.commentRepository.findOneOrNull({
      id: commentId,
    });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // For public endpoints, only show APPROVED replies
    const replies = await this.commentRepository.findRepliesByCommentId(
      commentId,
      CommentStatus.APPROVED as string,
    );

    // Process replies to aggregate reactions
    const processedReplies = await Promise.all(
      replies.map(async (reply) => {
        return this.commentRepository.findCommentWithReactions(
          reply.id,
          userId,
        );
      }),
    );

    return {
      comments: processedReplies.filter((r) => r !== null),
    };
  }

  /**
   * Create a comment (root or reply)
   */
  async createComment(
    lessonId: string,
    userId: string,
    createCommentDto: CreateCommentDto,
  ) {
    // Verify lesson exists
    const lesson = await this.lessonRepository.findOneOrNull({ id: lessonId });
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    // If parentId is provided, verify parent comment exists and belongs to same lesson
    if (createCommentDto.parentId) {
      const parentComment = await this.commentRepository.findOneOrNull({
        id: createCommentDto.parentId,
      });

      if (!parentComment) {
        throw new NotFoundException('Parent comment not found');
      }

      if (parentComment.lessonId !== lessonId) {
        throw new BadRequestException(
          'Parent comment does not belong to this lesson',
        );
      }
    }

    const comment = await this.commentRepository.createComment({
      lessonId,
      userId,
      content: createCommentDto.content,
      parentId: createCommentDto.parentId,
    });

    // Return comment with reactions
    return this.commentRepository.findCommentWithReactions(comment.id, userId);
  }

  /**
   * Update a comment
   */
  async updateComment(
    commentId: string,
    userId: string,
    updateCommentDto: UpdateCommentDto,
  ) {
    const comment = await this.commentRepository.findOneOrNull({
      id: commentId,
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Verify ownership
    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only update your own comments');
    }

    return this.commentRepository.update(
      { id: commentId },
      { content: updateCommentDto.content },
    );
  }

  /**
   * Delete a comment (cascade will handle reactions and children)
   * Owner, Admin, or Super Admin can delete
   */
  async deleteComment(commentId: string, userId: string) {
    const comment = await this.commentRepository.findOneOrNull({
      id: commentId,
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Get user with roles to check admin status
    const user = await this.userRepository.findByIdWithRoles(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user is admin or super admin
    const isAdmin = user.roles.some(
      (role) => role.name === 'Admin' || role.name === 'Super Admin',
    );

    // Verify ownership or admin status
    if (comment.userId !== userId && !isAdmin) {
      throw new ForbiddenException(
        'You can only delete your own comments or must be an admin',
      );
    }

    await this.commentRepository.delete({ id: commentId });

    return { message: 'Comment deleted successfully' };
  }

  /**
   * React to a comment (toggle reaction)
   */
  async reactToComment(
    commentId: string,
    userId: string,
    reactCommentDto: ReactCommentDto,
  ) {
    const comment = await this.commentRepository.findOneOrNull({
      id: commentId,
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return this.commentRepository.toggleReaction(
      commentId,
      userId,
      reactCommentDto.type,
    );
  }

  /**
   * Get all comments (admin)
   */
  async getAllComments(
    paginationQuery?: PaginationQueryDto,
    queryDto?: CommentQueryDto,
  ) {
    const additionalWhere: any = {};

    if (queryDto?.status) {
      additionalWhere.status = queryDto.status;
    }

    if (queryDto?.lessonId) {
      additionalWhere.lessonId = queryDto.lessonId;
    }

    if (queryDto?.userId) {
      additionalWhere.userId = queryDto.userId;
    }

    return this.commentRepository.findAll(paginationQuery, additionalWhere);
  }

  /**
   * Update comment status (admin)
   */
  async updateCommentStatus(
    commentId: string,
    updateStatusDto: UpdateCommentStatusDto,
  ) {
    const comment = await this.commentRepository.findOneOrNull({
      id: commentId,
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return this.commentRepository.updateStatus(
      commentId,
      updateStatusDto.status,
    );
  }

  /**
   * Bulk delete comments (admin only)
   * Owner, Admin, or Super Admin can delete
   */
  async bulkDeleteComments(ids: string[], userId: string) {
    if (!ids || ids.length === 0) {
      throw new BadRequestException('No IDs provided for deletion');
    }

    // Get user with roles to check admin status
    const user = await this.userRepository.findByIdWithRoles(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user is admin or super admin
    const isAdmin = user.roles.some(
      (role) => role.name === 'Admin' || role.name === 'Super Admin',
    );

    if (!isAdmin) {
      // If not admin, only allow deleting own comments
      const comments = await this.commentRepository.findAll(undefined, {
        id: { in: ids },
      });

      // Check if all comments belong to the user
      const allOwnComments = comments.result.every(
        (comment: any) => comment.userId === userId,
      );

      if (!allOwnComments) {
        throw new ForbiddenException(
          'You can only delete your own comments or must be an admin',
        );
      }
    }

    const result = await this.commentRepository.bulkDelete(ids);

    if (result.count === 0) {
      throw new NotFoundException('No comments found with the provided IDs');
    }

    return {
      deletedCount: result.count,
      message: `Successfully deleted ${result.count} ${result.count === 1 ? 'comment' : 'comments'}`,
    };
  }
}
