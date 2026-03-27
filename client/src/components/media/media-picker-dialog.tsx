'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MediaGallery } from '@/components/media/media-gallery';
import { IMedia, MediaType } from '@/types/media';
import { Image as ImageIcon, Plus, Upload } from 'lucide-react';
import { useState, useEffect } from 'react';
import MediaUploadDialog from '@/app/admin/media/components/media-upload-dialog';
import { useQueryClient } from '@tanstack/react-query';
import { mediaKeys } from '@/hooks/use-media';

interface MediaPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect?: (media: IMedia) => void;
  onMultiSelect?: (media: IMedia[]) => void;
  typeFilter?: MediaType; // Filter by image or video only
  selectedMediaId?: string | null;
  selectedMediaIds?: string[];
  title?: string;
  description?: string;
  multiSelect?: boolean;
  maxSelection?: number;
}

export function MediaPickerDialog({
  open,
  onOpenChange,
  onSelect,
  onMultiSelect,
  typeFilter,
  selectedMediaId,
  selectedMediaIds = [],
  title = 'Select Media',
  description = 'Choose an image or video from your media library',
  multiSelect = false,
  maxSelection,
}: MediaPickerDialogProps) {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library');
  const queryClient = useQueryClient();

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setActiveTab('library');
    }
  }, [open]);

  const handleSelect = (media: IMedia) => {
    if (multiSelect) {
      // For multi-select, don't close dialog immediately
      // Parent will handle closing when done
      return;
    } else {
      onSelect?.(media);
      onOpenChange(false);
    }
  };

  const handleMultiSelect = (media: IMedia[]) => {
    // Directly call parent callback - no need for local state
    onMultiSelect?.(media);
  };

  const handleConfirm = () => {
    // This will be handled by MediaGallery's onMultiSelect callback
    // which already has the selected media
    onOpenChange(false);
  };

  const handleUploadComplete = () => {
    // Refresh media list when upload completes
    queryClient.invalidateQueries({ queryKey: mediaKeys.all });
    setUploadDialogOpen(false);
    setActiveTab('library');
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="flex h-[90vh] max-w-7xl! flex-col p-0">
          <DialogHeader className="shrink-0 border-b px-6 pt-6 pb-2">
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              {title}
            </DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <div className="flex min-h-0 flex-1 flex-col px-6 py-4">
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as typeof activeTab)}
              className="flex min-h-0 flex-1 flex-col"
            >
              <TabsList className="mb-4 shrink-0">
                <TabsTrigger value="library" className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Media Library
                </TabsTrigger>
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload New
                </TabsTrigger>
              </TabsList>

              <TabsContent value="library" className="mt-0 flex min-h-0 flex-1 flex-col">
                <MediaGallery
                  onSelect={handleSelect}
                  onMultiSelect={handleMultiSelect}
                  selectedMediaId={selectedMediaId}
                  selectedMediaIds={selectedMediaIds}
                  typeFilter={typeFilter}
                  allowUpload={false}
                  multiSelect={multiSelect}
                  maxSelection={maxSelection}
                />
              </TabsContent>

              <TabsContent value="upload" className="mt-0 flex min-h-0 flex-1 flex-col">
                <div className="flex-1 overflow-y-auto">
                  {!uploadDialogOpen && (
                    <div className="flex h-full min-h-[400px] flex-col items-center justify-center text-center">
                      <Upload className="text-muted-foreground mb-4 h-12 w-12" />
                      <h3 className="mb-2 text-lg font-semibold">Upload New Media</h3>
                      <p className="text-muted-foreground mb-6 max-w-md text-sm">
                        Click the button below to upload new images or videos to your media library.
                        Once uploaded, you can select them from the Media Library tab.
                      </p>
                      <Button onClick={() => setUploadDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Open Upload Dialog
                      </Button>
                    </div>
                  )}
                  <MediaUploadDialog
                    open={uploadDialogOpen}
                    onOpenChange={(open) => {
                      setUploadDialogOpen(open);
                      if (!open) {
                        handleUploadComplete();
                      }
                    }}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter className="shrink-0 border-t px-6 py-4">
            <div className="flex w-full items-center justify-between">
              {multiSelect && (
                <div className="text-muted-foreground text-sm">
                  {selectedMediaIds.length > 0
                    ? `${selectedMediaIds.length} item${
                        selectedMediaIds.length !== 1 ? 's' : ''
                      } selected`
                    : 'No items selected'}
                </div>
              )}
              <div className="ml-auto flex gap-2">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                {multiSelect && (
                  <Button onClick={handleConfirm} disabled={selectedMediaIds.length === 0}>
                    Confirm ({selectedMediaIds.length})
                  </Button>
                )}
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
