'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMediaUpload } from '@/hooks/use-media';
import { cn } from '@/lib/utils';
import {
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
  MediaType,
  MediaUploadProgress,
  formatFileSize,
} from '@/types/media';
import {
  AlertCircle,
  CheckCircle2,
  CloudUpload,
  FileImage,
  Film,
  Loader2,
  Upload,
  X,
  XCircle,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';

interface MediaUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Single upload item component
const UploadItem = ({
  upload,
  onRemove,
}: {
  upload: MediaUploadProgress;
  onRemove: () => void;
}) => {
  const isUploading = upload.status === 'uploading';
  const isPending = upload.status === 'pending';
  const isProcessing = upload.status === 'processing';
  const isCompleted = upload.status === 'completed';
  const isError = upload.status === 'error';
  const isVideo = upload.type === MediaType.VIDEO;

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border p-3',
        isError && 'border-destructive bg-destructive/5',
        isCompleted && 'border-green-500 bg-green-50 dark:bg-green-950/20',
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-lg',
          isVideo
            ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
            : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
        )}
      >
        {isVideo ? <Film className="h-5 w-5" /> : <FileImage className="h-5 w-5" />}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">{upload.filename}</p>
          <Badge variant={isVideo ? 'secondary' : 'default'} className="text-xs">
            {isVideo ? 'Video' : 'Image'}
          </Badge>
        </div>
        <div className="text-muted-foreground mt-1 flex items-center gap-2 text-xs">
          {isPending && (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Pending...</span>
            </>
          )}
          {isUploading && (
            <>
              <Upload className="h-3 w-3" />
              <span>Uploading... {upload.uploadProgress}%</span>
            </>
          )}
          {isProcessing && (
            <>
              <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
              <span className="text-blue-600">Processing video...</span>
            </>
          )}
          {isCompleted && (
            <>
              <CheckCircle2 className="h-3 w-3 text-green-600" />
              <span className="text-green-600">Complete</span>
            </>
          )}
          {isError && (
            <>
              <XCircle className="text-destructive h-3 w-3" />
              <span className="text-destructive">{upload.errorMessage || 'Failed'}</span>
            </>
          )}
        </div>
        {(isUploading || isPending) && (
          <Progress
            value={upload.uploadProgress}
            className="mt-2 h-1.5 transition-all duration-300"
          />
        )}
      </div>

      {/* Remove button */}
      {(isCompleted || isError) && (
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onRemove}>
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

// Pending file item component
const PendingFileItem = ({
  file,
  onRemove,
  type,
}: {
  file: File;
  onRemove: () => void;
  type: 'image' | 'video';
}) => {
  const isVideo = type === 'video';

  return (
    <div className="bg-muted/50 flex items-center gap-3 rounded-lg border p-3">
      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-lg',
          isVideo
            ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
            : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
        )}
      >
        {isVideo ? <Film className="h-5 w-5" /> : <FileImage className="h-5 w-5" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{file.name}</p>
        <p className="text-muted-foreground mt-1 text-xs">{formatFileSize(file.size)}</p>
      </div>
      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onRemove}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

// Image Upload Tab
const ImageUploadTab = ({
  pendingFiles,
  setPendingFiles,
  onUpload,
  isUploading,
}: {
  pendingFiles: File[];
  setPendingFiles: React.Dispatch<React.SetStateAction<File[]>>;
  onUpload: (files: File[]) => Promise<void>;
  isUploading: boolean;
}) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setPendingFiles((prev) => [...prev, ...acceptedFiles]);
    },
    [setPendingFiles],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'image/webp': ['.webp'],
    },
    maxSize: MAX_IMAGE_SIZE,
    multiple: true,
  });

  const handleUpload = async () => {
    if (pendingFiles.length === 0) return;
    const files = [...pendingFiles];
    setPendingFiles([]);
    await onUpload(files);
  };

  const removePendingFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          'cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors',
          isDragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
            : 'border-muted-foreground/25 hover:border-blue-500/50',
          isUploading && 'pointer-events-none opacity-50',
        )}
      >
        <input {...getInputProps()} />
        <FileImage className="mx-auto mb-4 h-12 w-12 text-blue-500" />
        {isDragActive ? (
          <p className="font-medium text-blue-600">Drop images here...</p>
        ) : (
          <>
            <p className="font-medium">Drag & drop images here</p>
            <p className="text-muted-foreground mt-1 text-sm">
              JPG, PNG, GIF, WebP (max {formatFileSize(MAX_IMAGE_SIZE)})
            </p>
          </>
        )}
      </div>

      {/* Pending Files */}
      {pendingFiles.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Selected Images ({pendingFiles.length})</h4>
            <Button variant="ghost" size="sm" onClick={() => setPendingFiles([])}>
              Clear All
            </Button>
          </div>
          <div className="max-h-[200px] space-y-2 overflow-y-auto">
            {pendingFiles.map((file, index) => (
              <PendingFileItem
                key={`${file.name}-${index}`}
                file={file}
                onRemove={() => removePendingFile(index)}
                type="image"
              />
            ))}
          </div>
          <Button
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload {pendingFiles.length} Image
                {pendingFiles.length > 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

// Video Upload Tab
const VideoUploadTab = ({
  pendingFiles,
  setPendingFiles,
  onUpload,
  isUploading,
}: {
  pendingFiles: File[];
  setPendingFiles: React.Dispatch<React.SetStateAction<File[]>>;
  onUpload: (files: File[]) => Promise<void>;
  isUploading: boolean;
}) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setPendingFiles((prev) => [...prev, ...acceptedFiles]);
    },
    [setPendingFiles],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/mp4': ['.mp4', '.m4v'],
      'video/quicktime': ['.mov'],
      'video/x-msvideo': ['.avi'],
      'video/x-matroska': ['.mkv'],
      'video/webm': ['.webm'],
    },
    maxSize: MAX_VIDEO_SIZE,
    multiple: true,
  });

  const handleUpload = async () => {
    if (pendingFiles.length === 0) return;
    const files = [...pendingFiles];
    setPendingFiles([]);
    await onUpload(files);
  };

  const removePendingFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          'cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors',
          isDragActive
            ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20'
            : 'border-muted-foreground/25 hover:border-purple-500/50',
          isUploading && 'pointer-events-none opacity-50',
        )}
      >
        <input {...getInputProps()} />
        <Film className="mx-auto mb-4 h-12 w-12 text-purple-500" />
        {isDragActive ? (
          <p className="font-medium text-purple-600">Drop videos here...</p>
        ) : (
          <>
            <p className="font-medium">Drag & drop videos here</p>
            <p className="text-muted-foreground mt-1 text-sm">
              MP4, MOV, AVI, MKV, WebM (max {formatFileSize(MAX_VIDEO_SIZE)})
            </p>
          </>
        )}
      </div>

      {/* Pending Files */}
      {pendingFiles.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Selected Videos ({pendingFiles.length})</h4>
            <Button variant="ghost" size="sm" onClick={() => setPendingFiles([])}>
              Clear All
            </Button>
          </div>
          <div className="max-h-[200px] space-y-2 overflow-y-auto">
            {pendingFiles.map((file, index) => (
              <PendingFileItem
                key={`${file.name}-${index}`}
                file={file}
                onRemove={() => removePendingFile(index)}
                type="video"
              />
            ))}
          </div>
          <Button
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload {pendingFiles.length} Video
                {pendingFiles.length > 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default function MediaUploadDialog({ open, onOpenChange }: MediaUploadDialogProps) {
  const {
    uploads,
    uploadImages,
    uploadVideos,
    removeUpload,
    clearCompletedUploads,
    isUploading,
    hasProcessing,
  } = useMediaUpload();

  const [pendingImages, setPendingImages] = useState<File[]>([]);
  const [pendingVideos, setPendingVideos] = useState<File[]>([]);

  const handleClose = () => {
    if (isUploading) {
      toast.error('Please wait for uploads to complete');
      return;
    }
    clearCompletedUploads();
    setPendingImages([]);
    setPendingVideos([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="flex max-h-[85vh] max-w-2xl flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CloudUpload className="h-5 w-5" />
            Upload Media
          </DialogTitle>
          <DialogDescription>
            Upload images and videos to your media library. Videos will be automatically processed
            to HLS format.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto py-4">
          {/* Upload Tabs */}
          <Tabs defaultValue="images" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="images" className="flex items-center gap-2">
                <FileImage className="h-4 w-4" />
                Images
              </TabsTrigger>
              <TabsTrigger value="videos" className="flex items-center gap-2">
                <Film className="h-4 w-4" />
                Videos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="images" className="mt-4">
              <ImageUploadTab
                pendingFiles={pendingImages}
                setPendingFiles={setPendingImages}
                onUpload={uploadImages}
                isUploading={isUploading}
              />
            </TabsContent>

            <TabsContent value="videos" className="mt-4">
              <VideoUploadTab
                pendingFiles={pendingVideos}
                setPendingFiles={setPendingVideos}
                onUpload={uploadVideos}
                isUploading={isUploading}
              />
            </TabsContent>
          </Tabs>

          {/* Active Uploads */}
          {uploads.length > 0 && (
            <div className="space-y-2 border-t pt-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Upload Progress ({uploads.length})</h4>
                {!isUploading && !hasProcessing && (
                  <Button variant="ghost" size="sm" onClick={clearCompletedUploads}>
                    Clear Completed
                  </Button>
                )}
              </div>
              <div className="max-h-[250px] space-y-2 overflow-y-auto">
                {uploads.map((upload) => (
                  <UploadItem
                    key={upload.mediaId}
                    upload={upload}
                    onRemove={() => removeUpload(upload.mediaId)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Processing Info */}
          {hasProcessing && (
            <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-blue-700 dark:bg-blue-950/20 dark:text-blue-300">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm">
                Videos are being processed to HLS format. This may take a few minutes.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
