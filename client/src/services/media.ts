import { ApiService } from "@/lib/api-service";
import { ListResponse } from "@/types/common";
import {
  IMedia,
  MediaFilterParams,
  RequestPresignedDto,
  PresignedUrlResponse,
  MarkUploadCompleteDto,
} from "@/types/media";

// Endpoints matching backend: @Controller('media')
const ENDPOINTS = {
  // General
  BASE: "/media",

  // Image endpoints
  IMAGES_PRESIGNED: "/media/images/presigned",
  IMAGES_UPLOAD_COMPLETE: "/media/images/upload-complete",
  IMAGES_MY: "/media/images/my",

  // Video endpoints
  VIDEOS_PRESIGNED: "/media/videos/presigned",
  VIDEOS_UPLOAD_COMPLETE: "/media/videos/upload-complete",
  VIDEOS_PROCESSED: "/media/videos/processed",
  VIDEOS_MY: "/media/videos/my",
} as const;

/**
 * Media Service
 * Handles all unified media-related API calls (images + videos)
 */
export class MediaService {
  // ==================== GENERAL ENDPOINTS ====================

  /**
   * Get all media with pagination
   * GET /media
   */
  static async getAll(
    params?: MediaFilterParams
  ): Promise<ListResponse<IMedia>> {
    console.log("MediaService.getAll called with params:", params);
    return ApiService.get<ListResponse<IMedia>>(
      ENDPOINTS.BASE,
      params as Record<string, unknown>
    );
  }

  /**
   * Get media by ID
   * GET /media/:id
   */
  static async getById(id: string): Promise<IMedia> {
    return ApiService.get<IMedia>(`${ENDPOINTS.BASE}/${id}`);
  }

  /**
   * Get media status (for polling during processing)
   * GET /media/:id/status
   */
  static async getStatus(id: string): Promise<IMedia> {
    return ApiService.get<IMedia>(`${ENDPOINTS.BASE}/${id}/status`);
  }

  /**
   * Delete media by ID
   * DELETE /media/:id
   */
  static async delete(id: string): Promise<void> {
    return ApiService.delete(`${ENDPOINTS.BASE}/${id}`);
  }

  /**
   * Delete multiple media items
   * DELETE /media (with body: { ids: string[] })
   */
  static async deleteMany(ids: string[]): Promise<void> {
    return ApiService.delete(ENDPOINTS.BASE, { data: { ids } });
  }

  // ==================== IMAGE ENDPOINTS ====================

  /**
   * Request presigned URLs for multiple image uploads
   * POST /media/images/presigned
   */
  static async requestImagePresignedUrls(
    dto: RequestPresignedDto
  ): Promise<PresignedUrlResponse[]> {
    return ApiService.post<PresignedUrlResponse[]>(
      ENDPOINTS.IMAGES_PRESIGNED,
      dto
    );
  }

  /**
   * Mark image upload as complete
   * POST /media/images/upload-complete
   */
  static async markImageUploadComplete(
    dto: MarkUploadCompleteDto
  ): Promise<IMedia> {
    return ApiService.post<IMedia>(ENDPOINTS.IMAGES_UPLOAD_COMPLETE, dto);
  }

  /**
   * Get user's images
   * GET /media/images/my
   */
  static async getMyImages(): Promise<IMedia[]> {
    return ApiService.get<IMedia[]>(ENDPOINTS.IMAGES_MY);
  }

  // ==================== VIDEO ENDPOINTS ====================

  /**
   * Request presigned URLs for multiple video uploads
   * POST /media/videos/presigned
   */
  static async requestVideoPresignedUrls(
    dto: RequestPresignedDto
  ): Promise<PresignedUrlResponse[]> {
    return ApiService.post<PresignedUrlResponse[]>(
      ENDPOINTS.VIDEOS_PRESIGNED,
      dto
    );
  }

  /**
   * Mark video upload as complete (starts processing)
   * POST /media/videos/upload-complete
   */
  static async markVideoUploadComplete(
    dto: MarkUploadCompleteDto
  ): Promise<IMedia> {
    return ApiService.post<IMedia>(ENDPOINTS.VIDEOS_UPLOAD_COMPLETE, dto);
  }

  /**
   * Get user's videos
   * GET /media/videos/my
   */
  static async getMyVideos(): Promise<IMedia[]> {
    return ApiService.get<IMedia[]>(ENDPOINTS.VIDEOS_MY);
  }

  // ==================== UPLOAD HELPERS ====================

  /**
   * Upload file directly to S3 using presigned URL
   * Uses Axios for progress tracking
   */
  static async uploadToS3(
    presignedUrl: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    const { default: axios } = await import("axios");

    await axios.put(presignedUrl, file, {
      headers: { "Content-Type": file.type },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(progress);
        }
      },
    });
  }
}
