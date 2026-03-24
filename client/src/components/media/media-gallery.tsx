"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDebounce } from "@/hooks/use-debounce";
import { useMediaList } from "@/hooks/use-media";
import { cn } from "@/lib/utils";
import { IMedia, MediaStatus, MediaType, getThumbnailUrl } from "@/types/media";
import { Check, Film, Image as ImageIcon, Loader2, Search } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";

interface MediaGalleryProps {
  onSelect?: (media: IMedia) => void;
  onMultiSelect?: (media: IMedia[]) => void;
  selectedMediaId?: string | null;
  selectedMediaIds?: string[];
  typeFilter?: MediaType;
  allowUpload?: boolean;
  onUploadClick?: () => void;
  multiSelect?: boolean;
  maxSelection?: number;
}

interface MediaGridItemProps {
  media: IMedia;
  isSelected: boolean;
  onSelect: () => void;
  multiSelect?: boolean;
}

function MediaGridItem({
  media,
  isSelected,
  onSelect,
  multiSelect = false,
}: MediaGridItemProps) {
  const thumbnailUrl = getThumbnailUrl(media);
  const isVideo = media.type === MediaType.VIDEO;
  const isProcessing = media.status === MediaStatus.PROCESSING;
  const isCompleted = media.status === MediaStatus.COMPLETED;

  return (
    <div
      className={cn(
        "group relative aspect-square overflow-hidden rounded-lg border-2 transition-all",
        isSelected
          ? "border-blue-500  ring-blue-500 ring-offset-2"
          : "border-transparent hover:border-blue-300",
        !multiSelect && "cursor-pointer"
      )}
      onClick={multiSelect ? undefined : onSelect}
    >
      {/* Thumbnail/Image */}
      {thumbnailUrl && isCompleted ? (
        <div className="relative h-full w-full">
          <Image
            src={thumbnailUrl}
            alt={media.filename}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
          {isVideo && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <Film className="h-8 w-8 text-white drop-shadow-lg" />
            </div>
          )}
        </div>
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-muted">
          {isProcessing ? (
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          ) : isVideo ? (
            <Film className="h-8 w-8 text-muted-foreground" />
          ) : (
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          )}
        </div>
      )}

      {/* Selection Indicator - Checkbox for multi-select, Check icon for single select */}
      {multiSelect ? (
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => {
            console.log("Checkbox checked change:", checked);
            // This will be called by Radix, but we also handle click on wrapper
            if (checked !== isSelected) {
              onSelect();
            }
          }}
          className="absolute z-10 top-2 left-2 h-6 w-6 border-2 bg-white/95 shadow-md data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
        />
      ) : (
        isSelected && (
          <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg">
            <Check className="h-4 w-4" />
          </div>
        )
      )}

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-black/0 transition-all group-hover:bg-black/40">
        <div className="absolute bottom-0 left-0 right-0 translate-y-full p-2 text-white transition-transform group-hover:translate-y-0">
          <p className="truncate text-xs font-medium">{media.filename}</p>
          <p className="text-xs opacity-80">
            {isVideo ? "Video" : "Image"} •{" "}
            {new Date(media.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}

export function MediaGallery({
  onSelect,
  onMultiSelect,
  selectedMediaId,
  selectedMediaIds = [],
  typeFilter,
  allowUpload = false,
  onUploadClick,
  multiSelect = false,
  maxSelection,
}: MediaGalleryProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  // Track selected media objects for multi-select mode
  const [selectedMediaMap, setSelectedMediaMap] = useState<Map<string, IMedia>>(
    () => new Map()
  );
  const [activeTab, setActiveTab] = useState<"all" | "images" | "videos">(
    typeFilter === MediaType.IMAGE
      ? "images"
      : typeFilter === MediaType.VIDEO
      ? "videos"
      : "all"
  );
  const debouncedSearch = useDebounce(search, 300);

  // Reset selectedMediaMap when switching modes or when selection is cleared
  useEffect(() => {
    if (!multiSelect && !selectedMediaId) {
      setSelectedMediaMap(new Map());
    }
    if (multiSelect && selectedMediaIds.length === 0) {
      setSelectedMediaMap(new Map());
    }
  }, [multiSelect, selectedMediaId, selectedMediaIds]);

  // Convert tab to filter type
  const getTypeFilter = (): MediaType | undefined => {
    if (typeFilter) return typeFilter; // Use prop filter if provided
    switch (activeTab) {
      case "images":
        return MediaType.IMAGE;
      case "videos":
        return MediaType.VIDEO;
      default:
        return undefined;
    }
  };

  const { data, isLoading, isFetching } = useMediaList({
    page,
    limit: 24, // Show 24 items per page for grid
    search: debouncedSearch || undefined,
    type: getTypeFilter(),
  });

  const mediaItems = useMemo(() => data?.result || [], [data?.result]);
  const meta = data?.meta;

  // Sync selectedMediaMap with selectedMediaIds/selectedMediaId when mediaItems load
  useEffect(() => {
    if (multiSelect) {
      // Multi-select mode: sync with selectedMediaIds
      if (selectedMediaIds.length > 0 && mediaItems.length > 0) {
        setSelectedMediaMap((prevMap) => {
          const newMap = new Map(prevMap);
          // Add media objects from current page that match selectedMediaIds
          selectedMediaIds.forEach((id) => {
            if (!newMap.has(id)) {
              const media = mediaItems.find((m) => m.id === id);
              if (media) {
                newMap.set(id, media);
              }
            }
          });
          // Remove items no longer in selectedMediaIds
          for (const id of newMap.keys()) {
            if (!selectedMediaIds.includes(id)) {
              newMap.delete(id);
            }
          }
          return newMap;
        });
      } else if (selectedMediaIds.length === 0) {
        setSelectedMediaMap(new Map());
      }
    } else {
      // Single-select mode: sync with selectedMediaId
      if (selectedMediaId && mediaItems.length > 0) {
        const media = mediaItems.find((m) => m.id === selectedMediaId);
        if (media) {
          setSelectedMediaMap((prevMap) => {
            // Always sync when selectedMediaId changes or media is found
            const currentMedia = prevMap.get(selectedMediaId);
            if (currentMedia?.id === media.id) {
              return prevMap; // No change needed
            }
            // Clear and set new selection
            const newMap = new Map();
            newMap.set(selectedMediaId, media);
            return newMap;
          });
        }
      } else if (!selectedMediaId) {
        // Clear selection when selectedMediaId is null/undefined
        setSelectedMediaMap((prevMap) => {
          if (prevMap.size === 0) return prevMap;
          return new Map();
        });
      }
    }
  }, [multiSelect, selectedMediaIds, selectedMediaId, mediaItems]);

  // Reset page when search or filter changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, activeTab, typeFilter]);

  // Store onMultiSelect in a ref to avoid triggering effects when callback changes
  const onMultiSelectRef = useRef(onMultiSelect);
  useEffect(() => {
    onMultiSelectRef.current = onMultiSelect;
  }, [onMultiSelect]);

  const handleSelect = useCallback(
    (media: IMedia) => {
      if (media.status !== MediaStatus.COMPLETED) return;

      if (!multiSelect) {
        onSelect?.(media);
        return;
      }

      // Multi-select mode
      setSelectedMediaMap((prevMap) => {
        const newMap = new Map(prevMap);

        if (newMap.has(media.id)) {
          newMap.delete(media.id);
        } else {
          // Check max selection limit
          if (maxSelection && newMap.size >= maxSelection) {
            return prevMap;
          }
          newMap.set(media.id, media);
        }

        // Notify parent with updated selection
        const selectedMedia = Array.from(newMap.values());
        // Use setTimeout to avoid state update during render
        setTimeout(() => {
          onMultiSelectRef.current?.(selectedMedia);
        }, 0);

        return newMap;
      });
    },
    [multiSelect, maxSelection, onSelect]
  );

  const handleLoadMore = () => {
    if (meta && page < meta.totalPages && !isFetching) {
      setPage((p) => p + 1);
    }
  };

  return (
    <div className="flex h-full flex-col space-y-4">
      {/* Header with Search and Upload */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search media..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {allowUpload && onUploadClick && (
          <Button onClick={onUploadClick} size="sm">
            <ImageIcon className="mr-2 h-4 w-4" />
            Upload
          </Button>
        )}
      </div>

      {/* Tabs - Only show if no typeFilter prop */}
      {!typeFilter && (
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as typeof activeTab)}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="images" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Images
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center gap-2">
              <Film className="h-4 w-4" />
              Videos
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {/* Grid */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && page === 1 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        ) : mediaItems.length === 0 ? (
          <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-sm font-medium text-muted-foreground">
              No media found
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {debouncedSearch
                ? "Try a different search term"
                : allowUpload
                ? "Upload your first media file"
                : "No media available"}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {mediaItems.map((media) => {
                const isItemSelected = multiSelect
                  ? selectedMediaMap.has(media.id) ||
                    selectedMediaIds.includes(media.id)
                  : selectedMediaId === media.id;
                return (
                  <MediaGridItem
                    key={media.id}
                    media={media}
                    isSelected={isItemSelected}
                    onSelect={() => handleSelect(media)}
                    multiSelect={multiSelect}
                  />
                );
              })}
            </div>

            {/* Load More Button */}
            {meta && page < meta.totalPages && (
              <div className="mt-6 flex justify-center">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={isFetching}
                >
                  {isFetching ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load More"
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer Info */}
      {meta && (
        <div className="border-t pt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Showing {mediaItems.length} of {meta.total} items
          </span>
          {multiSelect && selectedMediaMap.size > 0 && (
            <span className="font-medium text-foreground">
              {selectedMediaMap.size} selected
              {maxSelection && ` / ${maxSelection} max`}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
