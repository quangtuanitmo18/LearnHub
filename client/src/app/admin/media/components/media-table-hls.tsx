'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useDebounce } from '@/hooks/use-debounce';
import { useDeleteManyMedia, useDeleteMedia, useMediaList } from '@/hooks/use-media';
import {
  IMedia,
  MediaStatus,
  MediaType,
  formatDuration,
  formatFileSize,
  getHlsUrl,
  getMediaDisplayUrl,
  getMediaStatusBadgeVariant,
  getMediaStatusLabel,
  getMediaTypeBadgeVariant,
  getMediaTypeLabel,
  getThumbnailUrl,
} from '@/types/media';
import dayjs from 'dayjs';
import {
  Copy,
  Eye,
  Film,
  Image as ImageIcon,
  Loader2,
  MoreHorizontal,
  Search,
  Trash2,
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'sonner';
import MediaPreviewDialog from './media-preview-dialog';

interface MediaTableProps {
  typeFilter?: MediaType;
}

export default function MediaTable({ typeFilter }: MediaTableProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<IMedia | null>(null);

  const { data, isLoading } = useMediaList({
    page,
    limit: 10,
    search: debouncedSearch || undefined,
    type: typeFilter,
  });

  const deleteMedia = useDeleteMedia();
  const deleteManyMedia = useDeleteManyMedia();

  const mediaItems = data?.result || [];
  const meta = data?.meta;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(mediaItems.map((item: IMedia) => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard');
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMedia.mutateAsync(deleteId);
      setDeleteId(null);
    } catch {
      // Error handled in mutation
    }
  };

  const handleBulkDelete = async () => {
    try {
      await deleteManyMedia.mutateAsync(selectedIds);
      setSelectedIds([]);
      setShowBulkDelete(false);
    } catch {
      // Error handled in mutation
    }
  };

  const renderThumbnail = (media: IMedia) => {
    const thumbnailUrl = getThumbnailUrl(media);
    const isProcessing = media.status === MediaStatus.PROCESSING;
    const isVideo = media.type === MediaType.VIDEO;

    if (thumbnailUrl && !isProcessing) {
      return (
        <div
          className="relative h-12 w-16 cursor-pointer overflow-hidden rounded transition-opacity hover:opacity-80"
          onClick={() => media.status === MediaStatus.COMPLETED && setPreviewMedia(media)}
        >
          <Image src={thumbnailUrl} alt={media.filename} fill className="object-cover" />
          {isVideo && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <Film className="h-4 w-4 text-white" />
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="bg-muted flex h-12 w-16 items-center justify-center rounded">
        {isProcessing ? (
          <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
        ) : isVideo ? (
          <Film className="text-muted-foreground h-5 w-5" />
        ) : (
          <ImageIcon className="text-muted-foreground h-5 w-5" />
        )}
      </div>
    );
  };

  const renderStatus = (media: IMedia) => {
    return (
      <Badge variant={getMediaStatusBadgeVariant(media.status)}>
        {getMediaStatusLabel(media.status)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search media..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-[250px] pl-9"
            />
          </div>
        </div>
        {selectedIds.length > 0 && (
          <Button variant="destructive" size="sm" onClick={() => setShowBulkDelete(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete ({selectedIds.length})
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={mediaItems.length > 0 && selectedIds.length === mediaItems.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="w-[80px]">Preview</TableHead>
              <TableHead>Filename</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mediaItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center">
                  No media found.
                </TableCell>
              </TableRow>
            ) : (
              mediaItems.map((media) => (
                <TableRow key={media.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(media.id)}
                      onCheckedChange={(checked) => handleSelectOne(media.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell>{renderThumbnail(media)}</TableCell>
                  <TableCell className="max-w-[200px] truncate font-medium">
                    {media.filename}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getMediaTypeBadgeVariant(media.type)}>
                      {getMediaTypeLabel(media.type)}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatFileSize(media.size)}</TableCell>
                  <TableCell>
                    {media.type === MediaType.VIDEO ? formatDuration(media.duration) : '-'}
                  </TableCell>
                  <TableCell>{renderStatus(media)}</TableCell>
                  <TableCell>{dayjs(media.createdAt).format('MMM D, YYYY')}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setPreviewMedia(media)}
                          disabled={media.status !== MediaStatus.COMPLETED}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            const url =
                              media.type === MediaType.VIDEO
                                ? getHlsUrl(media)
                                : getMediaDisplayUrl(media);
                            if (url) handleCopyUrl(url);
                          }}
                          disabled={media.status !== MediaStatus.COMPLETED}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy URL
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteId(media.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, meta.totalItems)} of{' '}
            {meta.totalItems} items
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              disabled={page === meta.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Media</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this media? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={showBulkDelete} onOpenChange={setShowBulkDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.length} Items</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedIds.length} media items? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Preview Dialog */}
      <MediaPreviewDialog media={previewMedia} onClose={() => setPreviewMedia(null)} />
    </div>
  );
}
