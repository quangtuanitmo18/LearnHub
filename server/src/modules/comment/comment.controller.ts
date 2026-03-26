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
import { Public } from 'src/shared/decorators/public.decorator';
import { ResponseMessage } from 'src/shared/decorators/response-message.decorator';
import { PaginationQueryDto } from 'src/shared/dto/pagination.dto';
import { PermissionGuard } from 'src/shared/guards/permission.guard';
import { CommentService } from './comment.service';
import {
  CreateCommentDto,
  ReactCommentDto,
  UpdateCommentDto,
  UpdateCommentStatusDto,
  CommentQueryDto,
  BulkDeleteCommentDto,
} from './dto/comment.dto';

@Controller()
@UseGuards(PermissionGuard)
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get('lessons/:lessonId/comments')
  @Public()
  @ResponseMessage('Lesson comments retrieved successfully')
  async getLessonComments(
    @Param('lessonId') lessonId: string,
    @Query() paginationQuery: PaginationQueryDto,
    @CurrentUser('sub') userId?: string,
  ) {
    return this.commentService.getLessonComments(
      lessonId,
      paginationQuery,
      userId,
    );
  }

  @Get('comments/:id/replies')
  @Public()
  @ResponseMessage('Comment replies retrieved successfully')
  async getCommentReplies(
    @Param('id') id: string,
    @CurrentUser('sub') userId?: string,
  ) {
    return this.commentService.getCommentReplies(id, userId);
  }

  @Post('lessons/:lessonId/comments')
  @ResponseMessage('Comment created successfully')
  async createComment(
    @Param('lessonId') lessonId: string,
    @CurrentUser('sub') userId: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentService.createComment(
      lessonId,
      userId,
      createCommentDto,
    );
  }

  @Put('comments/:id')
  @ResponseMessage('Comment updated successfully')
  async updateComment(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentService.updateComment(id, userId, updateCommentDto);
  }

  @Delete('comments/bulk-delete')
  @ResponseMessage('Comments deleted successfully')
  async bulkDeleteComments(
    @Body() bulkDeleteDto: BulkDeleteCommentDto,
    @CurrentUser('sub') userId: string,
  ) {
    return await this.commentService.bulkDeleteComments(
      bulkDeleteDto.ids,
      userId,
    );
  }

  @Delete('comments/:id')
  @ResponseMessage('Comment deleted successfully')
  async deleteComment(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return await this.commentService.deleteComment(id, userId);
  }

  @Post('comments/:id/react')
  @ResponseMessage('Reaction updated successfully')
  async reactToComment(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body() reactCommentDto: ReactCommentDto,
  ) {
    return this.commentService.reactToComment(id, userId, reactCommentDto);
  }

  @Get('comments')
  @RequirePermissions(PERMISSIONS.COMMENT_READ)
  @ResponseMessage('Comments retrieved successfully')
  async getAllComments(
    @Query() paginationQuery: PaginationQueryDto,
    @Query() queryDto: CommentQueryDto,
  ) {
    return await this.commentService.getAllComments(paginationQuery, queryDto);
  }

  @Put('comments/:id/status')
  @RequirePermissions(PERMISSIONS.COMMENT_UPDATE)
  @ResponseMessage('Comment status updated successfully')
  async updateCommentStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateCommentStatusDto,
  ) {
    return await this.commentService.updateCommentStatus(id, updateStatusDto);
  }
}
