import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { S3Service } from 'src/shared/services/s3.service';
import { MediaRepository } from './media.repository';
import {
  RequestPresignedDto,
  PresignedUrlResponseItem,
  VideoProcessedDto,
  MediaFilterDto,
} from './dto/media.dto';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);
  private readonly cdnBaseUrl: string;

  constructor(
    private readonly mediaRepository: MediaRepository,
    private readonly s3Service: S3Service,
    private readonly configService: ConfigService,
  ) {
    this.cdnBaseUrl = this.configService.get<string>('cdn.baseUrl') || '';
  }

  /**
   * Get media type from mimetype
   */
  private getMediaType(mimetype: string): 'IMAGE' | 'VIDEO' {
    if (mimetype.startsWith('image/')) {
      return 'IMAGE';
    }
    if (mimetype.startsWith('video/')) {
      return 'VIDEO';
    }
    throw new BadRequestException(`Unsupported mimetype: ${mimetype}`);
  }

  /**
   * Validate mimetype matches expected type
   */
  private validateMimeTypeForType(
    mimetype: string,
    expectedType: 'IMAGE' | 'VIDEO',
  ): void {
    const actualType = this.getMediaType(mimetype);
    if (actualType !== expectedType) {
      throw new BadRequestException(
        `Invalid mimetype ${mimetype} for ${expectedType.toLowerCase()} upload`,
      );
    }
  }

  /**
   * Generate storage key for upload
   */
  private generateStorageKey(
    filename: string,
    type: 'IMAGE' | 'VIDEO',
  ): string {
    const ext = filename.split('.').pop() || '';
    const folder = type === 'IMAGE' ? 'images' : 'videos';
    return `${folder}/${uuidv4()}-${Date.now()}.${ext}`;
  }

  /**
   * Request presigned URLs for multiple files of a specific type
   */
  async createPresignedForType(
    userId: string,
    dto: RequestPresignedDto,
    type: 'IMAGE' | 'VIDEO',
  ): Promise<PresignedUrlResponseItem[]> {
    const results = await Promise.all(
      dto.files.map(async (file) => {
        // Validate mimetype matches expected type
        this.validateMimeTypeForType(file.mimetype, type);

        const storageKey = this.generateStorageKey(file.filename, type);

        // Generate presigned URL for public bucket
        const presignedData = await this.s3Service.getPresignedUploadUrl(
          storageKey,
          file.mimetype,
          600, // 10 minutes expiry
        );

        // Create media record with UPLOADING status
        const media = await this.mediaRepository.create({
          userId,
          filename: file.filename,
          size: BigInt(file.size),
          mimetype: file.mimetype,
          type,
          storageKey,
          cdnBaseUrl: this.cdnBaseUrl,
          status: 'UPLOADING',
        });

        return {
          mediaId: media.id,
          uploadUrl: presignedData.uploadUrl,
          key: storageKey,
          type,
        };
      }),
    );

    return results;
  }

  /**
   * Mark upload as complete
   * - IMAGE: status → COMPLETED
   * - VIDEO: status → PROCESSING (wait for HLS pipeline)
   */
  async markUploadComplete(mediaId: string, expectedType?: 'IMAGE' | 'VIDEO') {
    const media = await this.mediaRepository.findOneOrNull({ id: mediaId });

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    // Validate type if provided
    if (expectedType && media.type !== expectedType) {
      throw new BadRequestException(
        `Media is not a ${expectedType.toLowerCase()}`,
      );
    }

    if (media.status !== 'UPLOADING') {
      throw new BadRequestException(
        `Media is already in ${media.status} status`,
      );
    }

    // Verify file exists in S3
    const exists = await this.s3Service.fileExists(media.storageKey || '');
    if (!exists) {
      await this.mediaRepository.markFailed(
        mediaId,
        'File not found in S3 after upload',
      );
      throw new BadRequestException(
        'Upload not completed - file not found in S3',
      );
    }

    if (media.type === 'IMAGE') {
      // Image: mark as completed immediately
      const updated = await this.mediaRepository.update(
        { id: mediaId },
        {
          status: 'COMPLETED',
        },
      );

      this.logger.log(`Image ${mediaId} marked as COMPLETED`);

      return updated;
    }

    // Video: mark as COMPLETED directly since local webhook isn't configured for HLS
    const updated = await this.mediaRepository.updateStatus(
      mediaId,
      'COMPLETED',
    );

    this.logger.log(`Video ${mediaId} marked as COMPLETED`);

    return updated;
  }

  /**
   * Mark video as processed (called by Lambda after HLS conversion)
   */
  async markVideoProcessed(dto: VideoProcessedDto) {
    const media = await this.mediaRepository.findOneOrNull({ id: dto.mediaId });

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    if (media.type !== 'VIDEO') {
      throw new BadRequestException('Media is not a video');
    }

    const updated = await this.mediaRepository.markVideoProcessed(dto.mediaId, {
      playlistKey: dto.playlistKey,
      thumbnailKey: dto.thumbnailKey,
      duration: dto.duration,
    });

    this.logger.log(`Video ${dto.mediaId} processed successfully`);

    return updated;
  }

  /**
   * Get all media for a user
   */
  async listMyMedia(userId: string) {
    return await this.mediaRepository.findByUserId(userId);
  }

  /**
   * Get all media for a user filtered by type
   */
  async listMyMediaByType(userId: string, type: 'IMAGE' | 'VIDEO') {
    return await this.mediaRepository.findByUserIdAndType(userId, type);
  }

  /**
   * Get all media with pagination (admin)
   */
  async getAll(filterQuery?: MediaFilterDto) {
    const { type, ...paginationQuery } = filterQuery || {};

    const whereCondition = type ? { type } : undefined;

    const result = await this.mediaRepository.findAll(
      paginationQuery,
      whereCondition,
    );

    return result;
  }

  /**
   * Get media by ID
   */
  async getById(id: string) {
    const media = await this.mediaRepository.findOneOrNull({ id });
    if (!media) {
      throw new NotFoundException('Media not found');
    }
    return media;
  }

  /**
   * Get media status (for polling)
   */
  async getStatus(id: string) {
    const media = await this.mediaRepository.findOneOrNull({ id });
    if (!media) {
      throw new NotFoundException('Media not found');
    }

    return {
      id: media.id,
      status: media.status,
      type: media.type,
      errorMessage: media.errorMessage,
    };
  }

  /**
   * Delete media
   */
  async delete(id: string, userId?: string) {
    const media = await this.mediaRepository.findOneOrNull({ id });
    if (!media) {
      throw new NotFoundException('Media not found');
    }

    // Check ownership if userId provided
    if (userId && media.userId !== userId) {
      throw new BadRequestException('You do not own this media');
    }

    // await this.s3Service.deleteFile(media.storageKey);

    // await this.mediaRepository.delete({ id });

    const keysToDelete: string[] = [];
    if (media.storageKey) keysToDelete.push(media.storageKey);

    const deletePromises: Promise<any>[] = [
      this.mediaRepository.delete({ id }),
    ];

    if (media.type === 'VIDEO') {
      if (media.thumbnailKey) keysToDelete.push(media.thumbnailKey);
      
      // Clean up HLS files
      if (media.hlsPlaylistKey) {
        keysToDelete.push(media.hlsPlaylistKey);
        const lastSlash = media.hlsPlaylistKey.lastIndexOf('/');
        if (lastSlash > 0) {
          const folderPrefix = media.hlsPlaylistKey.substring(0, lastSlash + 1);
          deletePromises.push(this.s3Service.deleteFolder(folderPrefix));
        }
      }
    }

    // Add individual file deletion promises
    for (const key of keysToDelete) {
      deletePromises.push(this.s3Service.deleteFile(key));
    }

    await Promise.all(deletePromises);

    this.logger.log(`Media ${id} deleted`);

    return { success: true, message: 'Media deleted' };
  }
}
