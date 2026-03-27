'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Download } from 'lucide-react';
import {
  IMedia,
  MediaType,
  formatFileSize,
  formatDuration,
  getMediaStatusBadgeVariant,
  getMediaStatusLabel,
  getMediaTypeBadgeVariant,
  getMediaTypeLabel,
  getMediaDisplayUrl,
} from '@/types/media';
import { toast } from 'sonner';
import Image from 'next/image';
import dayjs from 'dayjs';

interface MediaPreviewDialogProps {
  media: IMedia | null;
  onClose: () => void;
}

export default function MediaPreviewDialog({ media, onClose }: MediaPreviewDialogProps) {
  if (!media) return null;

  const isVideo = media.type === MediaType.VIDEO;
  const displayUrl = getMediaDisplayUrl(media);
  // For basic video playback, use the storageKey (original video file)
  const videoUrl = isVideo ? displayUrl : null;

  const handleCopyUrl = (url: string, label: string) => {
    navigator.clipboard.writeText(url);
    toast.success(`${label} copied to clipboard`);
  };

  const handleDownload = () => {
    if (displayUrl) {
      window.open(displayUrl, '_blank');
    }
  };

  return (
    <Dialog open={!!media} onOpenChange={() => onClose()}>
      <DialogContent className="flex max-h-[90vh] max-w-5xl! flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="max-w-[400px] truncate">{media.filename}</span>
            <Badge variant={getMediaTypeBadgeVariant(media.type)}>
              {getMediaTypeLabel(media.type)}
            </Badge>
            <Badge variant={getMediaStatusBadgeVariant(media.status)}>
              {getMediaStatusLabel(media.status)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 space-y-6 overflow-y-auto pr-2">
          {/* Preview */}
          {isVideo ? (
            <div className="aspect-video overflow-hidden rounded-lg bg-black">
              {videoUrl ? (
                <video className="h-full w-full" controls preload="metadata" src={videoUrl}>
                  <source src={videoUrl} type={media.mimetype} />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="flex h-full items-center justify-center text-white">
                  Video not available
                </div>
              )}
            </div>
          ) : (
            <div className="bg-muted relative aspect-video overflow-hidden rounded-lg">
              {displayUrl ? (
                <Image
                  src={displayUrl}
                  alt={media.filename}
                  fill
                  className="object-contain"
                  priority
                />
              ) : (
                <div className="text-muted-foreground flex h-full items-center justify-center">
                  Image not available
                </div>
              )}
            </div>
          )}

          {/* Details */}
          <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
            <div>
              <p className="text-muted-foreground mb-1">Filename</p>
              <p className="font-medium break-words">{media.filename}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Type</p>
              <p className="font-medium">{media.mimetype}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Size</p>
              <p className="font-medium">{formatFileSize(media.size)}</p>
            </div>
            {isVideo && (
              <div>
                <p className="text-muted-foreground mb-1">Duration</p>
                <p className="font-medium">{formatDuration(media.duration)}</p>
              </div>
            )}
            <div>
              <p className="text-muted-foreground mb-1">Uploaded</p>
              <p className="font-medium">{dayjs(media.createdAt).format('MMM D, YYYY h:mm A')}</p>
            </div>
          </div>

          {/* URLs */}
          <div className="space-y-3">
            {/* Display URL (image or video) */}
            {displayUrl && (
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">
                  {isVideo ? 'Video URL' : 'Image URL'}
                </p>
                <div className="flex items-center gap-2">
                  <code className="bg-muted flex-1 truncate rounded-md px-3 py-2 text-xs">
                    {displayUrl}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopyUrl(displayUrl, isVideo ? 'Video URL' : 'Image URL')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 border-t pt-4">
            {displayUrl && (
              <Button variant="outline" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
