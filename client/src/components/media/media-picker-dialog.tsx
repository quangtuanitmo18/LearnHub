"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MediaGallery } from "@/components/media/media-gallery";
import { IMedia, MediaType } from "@/types/media";
import { Image as ImageIcon, Plus, Upload } from "lucide-react";
import { useState, useEffect } from "react";
import MediaUploadDialog from "@/app/admin/media/components/media-upload-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { mediaKeys } from "@/hooks/use-media";

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
  title = "Select Media",
  description = "Choose an image or video from your media library",
  multiSelect = false,
  maxSelection,
}: MediaPickerDialogProps) {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"library" | "upload">("library");
  const queryClient = useQueryClient();

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setActiveTab("library");
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
    setActiveTab("library");
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-7xl! h-[90vh] flex flex-col p-0">
          <DialogHeader className="shrink-0 px-6 pt-6 pb-2 border-b">
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              {title}
            </DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <div className="flex-1 min-h-0 flex flex-col px-6 py-4">
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as typeof activeTab)}
              className="flex-1 flex flex-col min-h-0"
            >
              <TabsList className="shrink-0 mb-4">
                <TabsTrigger
                  value="library"
                  className="flex items-center gap-2"
                >
                  <ImageIcon className="h-4 w-4" />
                  Media Library
                </TabsTrigger>
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload New
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="library"
                className="flex-1 flex flex-col min-h-0 mt-0"
              >
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

              <TabsContent
                value="upload"
                className="flex-1 flex flex-col min-h-0 mt-0"
              >
                <div className="flex-1 overflow-y-auto">
                  {!uploadDialogOpen && (
                    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                      <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        Upload New Media
                      </h3>
                      <p className="text-sm text-muted-foreground mb-6 max-w-md">
                        Click the button below to upload new images or videos to
                        your media library. Once uploaded, you can select them
                        from the Media Library tab.
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
            <div className="flex items-center justify-between w-full">
              {multiSelect && (
                <div className="text-sm text-muted-foreground">
                  {selectedMediaIds.length > 0
                    ? `${selectedMediaIds.length} item${
                        selectedMediaIds.length !== 1 ? "s" : ""
                      } selected`
                    : "No items selected"}
                </div>
              )}
              <div className="flex gap-2 ml-auto">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                {multiSelect && (
                  <Button
                    onClick={handleConfirm}
                    disabled={selectedMediaIds.length === 0}
                  >
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
