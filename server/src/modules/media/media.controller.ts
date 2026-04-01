import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PERMISSIONS } from 'src/shared/configs/permission';
import { RequirePermissions } from 'src/shared/decorators/permission.decorator';
import { MediaService } from './media.service';
import {
  RequestPresignedDto,
  UploadCompleteDto,
  VideoProcessedDto,
  PresignedUrlResponseItem,
  MediaFilterDto,
} from './dto/media.dto';
import { Public } from 'src/shared/decorators/public.decorator';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { PermissionGuard } from 'src/shared/guards/permission.guard';

@Controller('media')
@UseGuards(PermissionGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  // ==================== IMAGE ENDPOINTS ====================

  /**
   * Request presigned URLs for multiple image uploads
   */
  @Post('images/presigned')
  async getImagePresigned(
    @Body() dto: RequestPresignedDto,
    @CurrentUser('sub') userId: string,
  ): Promise<PresignedUrlResponseItem[]> {
    return this.mediaService.createPresignedForType(userId, dto, 'IMAGE');
  }

  /**
   * Mark image upload as complete
   */
  @Post('images/upload-complete')
  async imageUploadComplete(@Body() dto: UploadCompleteDto) {
    return this.mediaService.markUploadComplete(dto.mediaId, 'IMAGE');
  }

  /**
   * Get all images for the authenticated user
   */
  @Get('images/my')
  async myImages(@CurrentUser('sub') userId: string) {
    return this.mediaService.listMyMediaByType(userId, 'IMAGE');
  }

  // ==================== VIDEO ENDPOINTS ====================

  /**
   * Request presigned URLs for multiple video uploads
   */
  @Post('videos/presigned')
  async getVideoPresigned(
    @Body() dto: RequestPresignedDto,
    @CurrentUser('sub') userId: string,
  ): Promise<PresignedUrlResponseItem[]> {
    return this.mediaService.createPresignedForType(userId, dto, 'VIDEO');
  }

  /**
   * Mark video upload as complete (starts processing)
   */
  @Post('videos/upload-complete')
  async videoUploadComplete(@Body() dto: UploadCompleteDto) {
    return this.mediaService.markUploadComplete(dto.mediaId, 'VIDEO');
  }

  /**
   * Callback endpoint for Lambda when video HLS processing is complete
   */
  @Public()
  @Post('videos/processed')
  async videoProcessed(@Body() dto: VideoProcessedDto) {
    const media = await this.mediaService.markVideoProcessed(dto);
    return { success: true, media };
  }

  /**
   * Get all videos for the authenticated user
   */
  @Get('videos/my')
  async myVideos(@CurrentUser('sub') userId: string) {
    return this.mediaService.listMyMediaByType(userId, 'VIDEO');
  }

  // ==================== GENERAL ENDPOINTS ====================

  /**
   * Get media status (for polling during processing)
   */
  @Get(':id/status')
  async getStatus(@Param('id') id: string) {
    return this.mediaService.getStatus(id);
  }

  /**
   * Get media by ID
   */
  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.mediaService.getById(id);
  }

  /**
   * Get all media with pagination (admin)
   */
  @Get()
  @RequirePermissions(PERMISSIONS.IMAGE_READ)
  async getAll(@Query() filterQuery: MediaFilterDto) {
    return this.mediaService.getAll(filterQuery);
  }

  /**
   * Delete media
   */
  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.mediaService.delete(id, userId);
  }
}
