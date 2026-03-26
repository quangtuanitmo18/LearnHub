import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/shared/services/base.service';
import { PrismaService } from 'src/shared/services/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { CreateMediaDto, UpdateMediaDto } from './dto/media.dto';

@Injectable()
export class MediaRepository extends BaseService<
  Prisma.MediaGetPayload<object>,
  CreateMediaDto,
  UpdateMediaDto,
  Prisma.MediaWhereUniqueInput
> {
  protected modelName = Prisma.ModelName.Media;

  constructor(prismaService: PrismaService) {
    super(prismaService, {
      defaultSortBy: 'createdAt',
      defaultSortOrder: 'desc',
      searchFields: ['filename'],
      selectFields: {
        id: true,
        userId: true,
        filename: true,
        size: true,
        mimetype: true,
        type: true,
        storageKey: true,
        thumbnailKey: true,
        cdnBaseUrl: true,
        hlsPlaylistKey: true,
        duration: true,
        status: true,
        errorMessage: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Update media status
   */
  async updateStatus(
    id: string,
    status: 'UPLOADING' | 'PROCESSING' | 'COMPLETED' | 'FAILED',
    errorMessage?: string,
  ) {
    return await this.model.update({
      where: { id },
      data: {
        status,
        errorMessage: errorMessage ?? null,
      },
    });
  }

  /**
   * Find all media by user ID
   */
  async findByUserId(userId: string) {
    return await this.model.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Find all media by user ID and type
   */
  async findByUserIdAndType(userId: string, type: 'IMAGE' | 'VIDEO') {
    return await this.model.findMany({
      where: { userId, type },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Find media by storage key
   */
  async findByStorageKey(storageKey: string) {
    return await this.model.findUnique({
      where: { storageKey },
    });
  }

  /**
   * Mark video as processed with HLS data
   */
  async markVideoProcessed(
    id: string,
    data: {
      playlistKey: string;
      thumbnailKey?: string;
      duration?: number;
    },
  ) {
    return await this.model.update({
      where: { id },
      data: {
        hlsPlaylistKey: data.playlistKey,
        thumbnailKey: data.thumbnailKey ?? null,
        duration: data.duration ?? null,
        storageKey: data.thumbnailKey ?? data.playlistKey,
        status: 'COMPLETED',
      },
    });
  }

  /**
   * Mark media as failed
   */
  async markFailed(id: string, errorMessage: string) {
    return await this.model.update({
      where: { id },
      data: {
        status: 'FAILED',
        errorMessage,
      },
    });
  }
}
