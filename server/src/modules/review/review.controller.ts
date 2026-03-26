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
import { type ReviewStatusType } from 'src/shared/constants/review.constant';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { RequirePermissions } from 'src/shared/decorators/permission.decorator';
import { Public } from 'src/shared/decorators/public.decorator';
import { ResponseMessage } from 'src/shared/decorators/response-message.decorator';
import { PaginationQueryDto } from 'src/shared/dto/pagination.dto';
import { PermissionGuard } from 'src/shared/guards/permission.guard';
import {
  BulkDeleteReviewDto,
  CreateReviewDto,
  ReviewQueryDto,
  UpdateReviewDto,
  UpdateReviewStatusDto,
} from './dto/review.dto';
import { ReviewService } from './review.service';

@Controller('reviews')
@UseGuards(PermissionGuard)
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @ResponseMessage('Review created successfully')
  async createReview(
    @CurrentUser('sub') userId: string,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    return this.reviewService.createReview(userId, createReviewDto);
  }

  @Get()
  @RequirePermissions(PERMISSIONS.REVIEW_READ)
  @ResponseMessage('Reviews retrieved successfully')
  async getAllReviews(
    @Query() paginationQuery: PaginationQueryDto,
    @Query() queryDto: ReviewQueryDto,
  ) {
    return this.reviewService.getAllReviews(paginationQuery, queryDto);
  }

  @Get('course/:courseId')
  @Public()
  @ResponseMessage('Course reviews retrieved successfully')
  async getCourseReviews(
    @Param('courseId') courseId: string,
    @Query() paginationQuery: PaginationQueryDto,
    @Query('status') status?: ReviewStatusType,
  ) {
    return this.reviewService.getCourseReviews(
      courseId,
      paginationQuery,
      status,
    );
  }

  @Get('course/:courseId/stats')
  @Public()
  @ResponseMessage('Course review statistics retrieved successfully')
  async getCourseReviewStats(@Param('courseId') courseId: string) {
    return this.reviewService.getCourseReviewStats(courseId);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.REVIEW_READ)
  @ResponseMessage('Review retrieved successfully')
  async getReviewById(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.reviewService.getReviewById(id, userId);
  }

  @Put(':id')
  @RequirePermissions(PERMISSIONS.REVIEW_UPDATE)
  @ResponseMessage('Review updated successfully')
  async updateReview(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewService.updateReview(id, userId, updateReviewDto);
  }

  @Delete('bulk-delete')
  @RequirePermissions(PERMISSIONS.REVIEW_DELETE)
  @ResponseMessage('Reviews deleted successfully')
  async bulkDeleteReviews(@Body() bulkDeleteDto: BulkDeleteReviewDto) {
    return this.reviewService.bulkDeleteReviews(bulkDeleteDto.ids);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.REVIEW_DELETE)
  @ResponseMessage('Review deleted successfully')
  async deleteReview(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.reviewService.deleteReview(id, userId);
  }

  @Put(':id/status')
  @RequirePermissions(PERMISSIONS.REVIEW_UPDATE)
  @ResponseMessage('Review status updated successfully')
  async updateReviewStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateReviewStatusDto,
  ) {
    return this.reviewService.updateReviewStatus(id, updateStatusDto);
  }
}
