import { MediaService } from '@/services/media';
import { ListResponse } from '@/types/common';
import {
  IMedia,
  MediaFilterParams,
  MediaType,
  MediaUploadProgress,
  validateImageFile,
  validateVideoFile,
} from '@/types/media';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

// ============================================================================
// Query Keys
// ============================================================================

export const mediaKeys = {
  all: ['media'] as const,
  lists: () => [...mediaKeys.all, 'list'] as const,
  list: (params?: MediaFilterParams) => [...mediaKeys.lists(), params ?? {}] as const,
  details: () => [...mediaKeys.all, 'detail'] as const,
  detail: (id: string) => [...mediaKeys.details(), id] as const,
  myImages: () => [...mediaKeys.all, 'my-images'] as const,
  myVideos: () => [...mediaKeys.all, 'my-videos'] as const,
  status: (id: string) => [...mediaKeys.all, 'status', id] as const,
};

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Hook to fetch paginated list of media
 */
export function useMediaList(params?: MediaFilterParams) {
  return useQuery({
    queryKey: mediaKeys.list(params),
    queryFn: () => MediaService.getAll(params),
  });
}

/**
 * Hook to fetch user's images
 */
export function useMyImages() {
  return useQuery({
    queryKey: mediaKeys.myImages(),
    queryFn: () => MediaService.getMyImages(),
  });
}

/**
 * Hook to fetch user's videos
 */
export function useMyVideos() {
  return useQuery({
    queryKey: mediaKeys.myVideos(),
    queryFn: () => MediaService.getMyVideos(),
  });
}

/**
 * Hook to fetch single media by ID
 */
export function useMediaById(id: string | undefined) {
  return useQuery({
    queryKey: mediaKeys.detail(id!),
    queryFn: () => MediaService.getById(id!),
    enabled: !!id,
  });
}

/**
 * Hook to fetch media status (for polling)
 */
export function useMediaStatus(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: mediaKeys.status(id!),
    queryFn: () => MediaService.getStatus(id!),
    enabled: !!id && enabled,
    refetchInterval: (query) => {
      const data = query.state.data;
      // Stop polling when completed or failed
      if (data?.status === 'COMPLETED' || data?.status === 'FAILED') {
        return false;
      }
      return 5000; // Poll every 5 seconds while processing
    },
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Hook to delete a single media item
 */
export function useDeleteMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => MediaService.delete(id),
    onSuccess: () => {
      toast.success('Successfully deleted media');
      queryClient.invalidateQueries({ queryKey: mediaKeys.all });
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete media: ${error.message}`);
    },
  });
}

/**
 * Hook to delete multiple media items
 */
export function useDeleteManyMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => MediaService.deleteMany(ids),
    onSuccess: (_, ids) => {
      toast.success(`Successfully deleted ${ids.length} media items`);
      queryClient.invalidateQueries({ queryKey: mediaKeys.all });
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete media: ${error.message}`);
    },
  });
}

// ============================================================================
// Upload Hook - Separate Image & Video uploads
// ============================================================================

/**
 * Hook for media upload with progress tracking
 *
 * Upload flow:
 * - Images: POST /media/images/presigned → S3 Upload → POST /media/images/upload-complete
 * - Videos: POST /media/videos/presigned → S3 Upload → POST /media/videos/upload-complete
 */
export function useMediaUpload() {
  const queryClient = useQueryClient();

  const [uploads, setUploads] = useState<Map<string, MediaUploadProgress>>(new Map());

  /**
   * Upload multiple images
   */
  const uploadImages = useCallback(
    async (files: File[]): Promise<void> => {
      // Validate files
      const validFiles: File[] = [];
      for (const file of files) {
        const validation = validateImageFile(file);
        if (!validation.valid) {
          toast.error(validation.error);
        } else {
          validFiles.push(file);
        }
      }

      if (validFiles.length === 0) return;

      // Request presigned URLs for images
      const presignedData = await MediaService.requestImagePresignedUrls({
        files: validFiles.map((f) => ({
          filename: f.name,
          mimetype: f.type,
          size: f.size,
        })),
      });

      // Initialize upload progress tracking
      const fileMap = new Map<string, File>();
      presignedData.forEach((item, index) => {
        fileMap.set(item.mediaId, validFiles[index]);
        setUploads((prev) => {
          const updated = new Map(prev);
          updated.set(item.mediaId, {
            mediaId: item.mediaId,
            filename: validFiles[index].name,
            type: MediaType.IMAGE,
            uploadProgress: 0,
            status: 'pending',
          });
          return updated;
        });
      });

      // Upload all files in parallel
      const uploadPromises = presignedData.map(async (item) => {
        const file = fileMap.get(item.mediaId)!;

        // Mark as uploading
        setUploads((prev) => {
          const updated = new Map(prev);
          const upload = updated.get(item.mediaId);
          if (upload) {
            updated.set(item.mediaId, { ...upload, status: 'uploading' });
          }
          return updated;
        });

        try {
          // Upload to S3
          await MediaService.uploadToS3(item.uploadUrl, file, (progress) => {
            setUploads((prev) => {
              const updated = new Map(prev);
              const upload = updated.get(item.mediaId);
              if (upload) {
                updated.set(item.mediaId, {
                  ...upload,
                  uploadProgress: progress,
                });
              }
              return updated;
            });
          });

          // Mark upload complete
          await MediaService.markImageUploadComplete({ mediaId: item.mediaId });

          // Update status to completed
          setUploads((prev) => {
            const updated = new Map(prev);
            const upload = updated.get(item.mediaId);
            if (upload) {
              updated.set(item.mediaId, {
                ...upload,
                uploadProgress: 100,
                status: 'completed',
              });
            }
            return updated;
          });

          toast.success(`"${file.name}" uploaded successfully`);
          return { success: true, mediaId: item.mediaId };
        } catch (error) {
          setUploads((prev) => {
            const updated = new Map(prev);
            const upload = updated.get(item.mediaId);
            if (upload) {
              updated.set(item.mediaId, {
                ...upload,
                status: 'error',
                errorMessage: error instanceof Error ? error.message : 'Upload failed',
              });
            }
            return updated;
          });

          toast.error(`Failed to upload "${file.name}"`);
          return { success: false, mediaId: item.mediaId, error };
        }
      });

      await Promise.allSettled(uploadPromises);
      queryClient.invalidateQueries({ queryKey: mediaKeys.all });
    },
    [queryClient],
  );

  /**
   * Upload multiple videos
   */
  const uploadVideos = useCallback(
    async (files: File[]): Promise<void> => {
      // Validate files
      const validFiles: File[] = [];
      for (const file of files) {
        const validation = validateVideoFile(file);
        if (!validation.valid) {
          toast.error(validation.error);
        } else {
          validFiles.push(file);
        }
      }

      if (validFiles.length === 0) return;

      // Request presigned URLs for videos
      const presignedData = await MediaService.requestVideoPresignedUrls({
        files: validFiles.map((f) => ({
          filename: f.name,
          mimetype: f.type,
          size: f.size,
        })),
      });

      // Initialize upload progress tracking
      const fileMap = new Map<string, File>();
      presignedData.forEach((item, index) => {
        fileMap.set(item.mediaId, validFiles[index]);
        setUploads((prev) => {
          const updated = new Map(prev);
          updated.set(item.mediaId, {
            mediaId: item.mediaId,
            filename: validFiles[index].name,
            type: MediaType.VIDEO,
            uploadProgress: 0,
            status: 'pending',
          });
          return updated;
        });
      });

      // Upload all files in parallel
      const uploadPromises = presignedData.map(async (item) => {
        const file = fileMap.get(item.mediaId)!;

        // Mark as uploading
        setUploads((prev) => {
          const updated = new Map(prev);
          const upload = updated.get(item.mediaId);
          if (upload) {
            updated.set(item.mediaId, { ...upload, status: 'uploading' });
          }
          return updated;
        });

        try {
          // Upload to S3
          await MediaService.uploadToS3(item.uploadUrl, file, (progress) => {
            setUploads((prev) => {
              const updated = new Map(prev);
              const upload = updated.get(item.mediaId);
              if (upload) {
                updated.set(item.mediaId, {
                  ...upload,
                  uploadProgress: progress,
                });
              }
              return updated;
            });
          });

          // Mark upload complete (starts HLS processing)
          await MediaService.markVideoUploadComplete({ mediaId: item.mediaId });

          // Update status to processing (video needs HLS processing)
          setUploads((prev) => {
            const updated = new Map(prev);
            const upload = updated.get(item.mediaId);
            if (upload) {
              updated.set(item.mediaId, {
                ...upload,
                uploadProgress: 100,
                status: 'processing',
              });
            }
            return updated;
          });

          toast.info(`"${file.name}" uploaded, processing video...`);
          return { success: true, mediaId: item.mediaId };
        } catch (error) {
          setUploads((prev) => {
            const updated = new Map(prev);
            const upload = updated.get(item.mediaId);
            if (upload) {
              updated.set(item.mediaId, {
                ...upload,
                status: 'error',
                errorMessage: error instanceof Error ? error.message : 'Upload failed',
              });
            }
            return updated;
          });

          toast.error(`Failed to upload "${file.name}"`);
          return { success: false, mediaId: item.mediaId, error };
        }
      });

      await Promise.allSettled(uploadPromises);
      queryClient.invalidateQueries({ queryKey: mediaKeys.all });
    },
    [queryClient],
  );

  /**
   * Remove an upload from tracking
   */
  const removeUpload = useCallback((mediaId: string) => {
    setUploads((prev) => {
      const updated = new Map(prev);
      updated.delete(mediaId);
      return updated;
    });
  }, []);

  /**
   * Clear completed/errored uploads
   */
  const clearCompletedUploads = useCallback(() => {
    setUploads((prev) => {
      const updated = new Map(prev);
      for (const [id, upload] of updated) {
        if (upload.status === 'completed' || upload.status === 'error') {
          updated.delete(id);
        }
      }
      return updated;
    });
  }, []);

  /**
   * Clear all uploads
   */
  const clearAllUploads = useCallback(() => {
    setUploads(new Map());
  }, []);

  return {
    uploads: Array.from(uploads.values()),
    uploadImages,
    uploadVideos,
    removeUpload,
    clearCompletedUploads,
    clearAllUploads,
    isUploading: Array.from(uploads.values()).some(
      (u) => u.status === 'uploading' || u.status === 'pending',
    ),
    hasProcessing: Array.from(uploads.values()).some((u) => u.status === 'processing'),
  };
}

// ============================================================================
// Cache Helpers
// ============================================================================

/**
 * Helper to optimistically update media list cache
 */
export function useMediaCacheHelpers() {
  const queryClient = useQueryClient();

  const updateMediaInCache = useCallback(
    (mediaId: string, updates: Partial<IMedia>) => {
      queryClient.setQueriesData<ListResponse<IMedia>>({ queryKey: mediaKeys.lists() }, (old) => {
        if (!old) return old;
        return {
          ...old,
          result: old.result.map((item) => (item.id === mediaId ? { ...item, ...updates } : item)),
        };
      });

      queryClient.setQueryData<IMedia>(mediaKeys.detail(mediaId), (old) => {
        if (!old) return old;
        return { ...old, ...updates };
      });
    },
    [queryClient],
  );

  const removeMediaFromCache = useCallback(
    (mediaId: string) => {
      queryClient.setQueriesData<ListResponse<IMedia>>({ queryKey: mediaKeys.lists() }, (old) => {
        if (!old) return old;
        return {
          ...old,
          result: old.result.filter((item) => item.id !== mediaId),
          meta: {
            ...old.meta,
            totalItems: old.meta.totalItems - 1,
          },
        };
      });

      queryClient.removeQueries({ queryKey: mediaKeys.detail(mediaId) });
    },
    [queryClient],
  );

  const addMediaToCache = useCallback(
    (media: IMedia) => {
      queryClient.setQueriesData<ListResponse<IMedia>>({ queryKey: mediaKeys.lists() }, (old) => {
        if (!old) return old;
        return {
          ...old,
          result: [media, ...old.result],
          meta: {
            ...old.meta,
            totalItems: old.meta.totalItems + 1,
          },
        };
      });
    },
    [queryClient],
  );

  return {
    updateMediaInCache,
    removeMediaFromCache,
    addMediaToCache,
  };
}
