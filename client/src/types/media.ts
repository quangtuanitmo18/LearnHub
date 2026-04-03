// Media types based on new unified media system
// Endpoint: /media/*

// ==================== ENUMS ====================

export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
}

export enum MediaStatus {
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

// ==================== INTERFACES ====================

/**
 * Media entity from backend
 * Matches Prisma model structure
 */
export interface IMedia {
  id: string;
  userId: string;

  // Upload info
  filename: string;
  size: number; // BigInt in DB, number in JS
  mimetype: string;

  // Type
  type: MediaType;

  // Storage / CDN
  storageKey: string; // Key for UI (image or thumbnail)
  thumbnailKey: string | null; // For video thumbnail
  cdnBaseUrl: string;

  // Video HLS
  hlsPlaylistKey: string | null; // videos/abc123/playlist.m3u8
  duration: number | null; // seconds

  status: MediaStatus;

  createdAt: string;
  updatedAt: string;
}

/**
 * Request presigned URLs for multiple files
 */
export interface RequestPresignedDto {
  files: {
    filename: string;
    mimetype: string;
    size: number;
  }[];
}

/**
 * Presigned URL response for a single file
 */
export interface PresignedUrlResponse {
  mediaId: string;
  uploadUrl: string;
  key: string;
  type: MediaType;
}

/**
 * Mark upload complete DTO
 */
export interface MarkUploadCompleteDto {
  mediaId: string;
}

/**
 * Video processed callback DTO (from Lambda)
 */
export interface VideoProcessedDto {
  mediaId: string;
  playlistKey: string;
  thumbnailKey?: string;
  duration?: number;
}

/**
 * Media filter params for listing
 */
export interface MediaFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: MediaType;
  status?: MediaStatus;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Media upload progress state (for UI)
 */
export interface MediaUploadProgress {
  mediaId: string;
  filename: string;
  type: MediaType;
  uploadProgress: number; // 0-100
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  errorMessage?: string;
}

// ==================== HELPERS ====================

/**
 * Format file size to human readable
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Format duration to human readable (mm:ss or hh:mm:ss)
 */
export const formatDuration = (seconds: number | null): string => {
  if (!seconds) return '-';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Get badge variant for media status
 */
export const getMediaStatusBadgeVariant = (
  status: MediaStatus,
): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case MediaStatus.COMPLETED:
      return 'default';
    case MediaStatus.PROCESSING:
      return 'secondary';
    case MediaStatus.UPLOADING:
      return 'outline';
    case MediaStatus.FAILED:
      return 'destructive';
    default:
      return 'secondary';
  }
};

/**
 * Get label for media status
 */
export const getMediaStatusLabel = (status: MediaStatus): string => {
  switch (status) {
    case MediaStatus.COMPLETED:
      return 'Completed';
    case MediaStatus.PROCESSING:
      return 'Processing';
    case MediaStatus.UPLOADING:
      return 'Uploading';
    case MediaStatus.FAILED:
      return 'Failed';
    default:
      return status;
  }
};

/**
 * Get badge variant for media type
 */
export const getMediaTypeBadgeVariant = (type: MediaType): 'default' | 'secondary' => {
  return type === MediaType.IMAGE ? 'default' : 'secondary';
};

/**
 * Get label for media type
 */
export const getMediaTypeLabel = (type: MediaType): string => {
  return type === MediaType.IMAGE ? 'Image' : 'Video';
};

// ==================== URL BUILDERS ====================

/**
 * Build full URL from CDN base and key
 */
export const buildMediaUrl = (cdnBaseUrl: string, key: string | null): string | null => {
  if (!key) return null;
  // Remove trailing slash from base and leading slash from key
  const base = cdnBaseUrl.replace(/\/$/, '');
  const cleanKey = key.replace(/^\//, '');
  return `${base}/${cleanKey}`;
};

/**
 * Get display URL for media (image or video thumbnail)
 */
export const getMediaDisplayUrl = (media: IMedia): string | null => {
  return buildMediaUrl(media.cdnBaseUrl, media.storageKey);
};

/**
 * Get thumbnail URL for video
 */
export const getThumbnailUrl = (media: IMedia): string | null => {
  if (media.type === MediaType.IMAGE) {
    return getMediaDisplayUrl(media);
  }
  // For videos, only return if we have an explicit thumbnail
  if (media.thumbnailKey) {
    return buildMediaUrl(media.cdnBaseUrl, media.thumbnailKey);
  }
  return null;
};

/**
 * Get HLS stream URL for video
 */
export const getHlsUrl = (media: IMedia): string | null => {
  if (media.type !== MediaType.VIDEO || !media.hlsPlaylistKey) {
    return null;
  }
  return buildMediaUrl(media.cdnBaseUrl, media.hlsPlaylistKey);
};

// ==================== VALIDATION ====================

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export const ACCEPTED_VIDEO_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-matroska',
  'video/webm',
];

export const ACCEPTED_MEDIA_TYPES = [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES];

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_VIDEO_SIZE = 5 * 1024 * 1024 * 1024; // 5GB

/**
 * Check if file is valid media type
 */
export const isValidMediaType = (mimetype: string): boolean => {
  return ACCEPTED_MEDIA_TYPES.includes(mimetype);
};

/**
 * Check if file is image
 */
export const isImageType = (mimetype: string): boolean => {
  return ACCEPTED_IMAGE_TYPES.includes(mimetype);
};

/**
 * Check if file is video
 */
export const isVideoType = (mimetype: string): boolean => {
  return ACCEPTED_VIDEO_TYPES.includes(mimetype);
};

/**
 * Validate file size based on type
 */
export const isValidFileSize = (file: File): boolean => {
  if (isImageType(file.type)) {
    return file.size <= MAX_IMAGE_SIZE;
  }
  if (isVideoType(file.type)) {
    return file.size <= MAX_VIDEO_SIZE;
  }
  return false;
};

/**
 * Get max file size based on type
 */
export const getMaxFileSize = (mimetype: string): number => {
  if (isImageType(mimetype)) {
    return MAX_IMAGE_SIZE;
  }
  return MAX_VIDEO_SIZE;
};

/**
 * Validate a file for upload
 */
export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export const validateFile = (file: File): FileValidationResult => {
  if (!isValidMediaType(file.type)) {
    return {
      valid: false,
      error: `"${file.name}" is not a supported file type`,
    };
  }

  if (!isValidFileSize(file)) {
    const maxSize = getMaxFileSize(file.type);
    return {
      valid: false,
      error: `"${file.name}" exceeds maximum size of ${formatFileSize(maxSize)}`,
    };
  }

  return { valid: true };
};

/**
 * Validate an image file for upload
 */
export const validateImageFile = (file: File): FileValidationResult => {
  if (!isImageType(file.type)) {
    return {
      valid: false,
      error: `"${file.name}" is not a valid image file. Supported: JPG, PNG, GIF, WebP`,
    };
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: `"${file.name}" exceeds maximum image size of ${formatFileSize(MAX_IMAGE_SIZE)}`,
    };
  }

  return { valid: true };
};

/**
 * Validate a video file for upload
 */
export const validateVideoFile = (file: File): FileValidationResult => {
  if (!isVideoType(file.type)) {
    return {
      valid: false,
      error: `"${file.name}" is not a valid video file. Supported: MP4, MOV, AVI, MKV, WebM`,
    };
  }

  if (file.size > MAX_VIDEO_SIZE) {
    return {
      valid: false,
      error: `"${file.name}" exceeds maximum video size of ${formatFileSize(MAX_VIDEO_SIZE)}`,
    };
  }

  return { valid: true };
};
