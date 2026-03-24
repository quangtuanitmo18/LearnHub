"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { getMediaDisplayUrl, type IMedia } from "@/types/media";
import { DEFAULT_THUMBNAIL } from "@/constants";

interface ImageGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: Array<IMedia | { id?: string; [key: string]: unknown }>;
  initialIndex?: number;
  title?: string;
}

function ImageGalleryModal({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
  title,
}: ImageGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Update currentIndex when initialIndex changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  if (!images || images.length === 0) return null;

  const currentImage = images[currentIndex];
  const imageUrl =
    ("cdnBaseUrl" in currentImage && "storageKey" in currentImage
      ? getMediaDisplayUrl(currentImage as IMedia)
      : null) || DEFAULT_THUMBNAIL;

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-6xl p-0 bg-black border-none overflow-hidden max-h-[90vh]">
        <DialogHeader className="sr-only">
          <DialogTitle>{title || "Image Gallery"}</DialogTitle>
        </DialogHeader>

        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-50 text-white hover:bg-white/20 rounded-full"
          onClick={onClose}
          aria-label="Close gallery"
        >
          <X className="h-5 w-5" />
        </Button>

        <div className="relative w-full bg-black">
          {/* Main Image Display */}
          <div className="relative aspect-video bg-gray-900">
            <Image
              src={imageUrl}
              alt={`${title || "Image"} ${currentIndex + 1}`}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 80vw"
            />

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20 rounded-full w-10 h-10 sm:w-12 sm:h-12"
                  onClick={goToPrevious}
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6 sm:h-8 sm:w-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20 rounded-full w-10 h-10 sm:w-12 sm:h-12"
                  onClick={goToNext}
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6 sm:h-8 sm:w-8" />
                </Button>
              </>
            )}

            {/* Image Counter */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm">
                {currentIndex + 1} / {images.length}
              </div>
            )}
          </div>

          {/* Thumbnail Navigation */}
          {images.length > 1 && (
            <div className="p-4 bg-black border-t border-gray-800">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide justify-center">
                {images.map((media, index) => {
                  const thumbUrl =
                    ("cdnBaseUrl" in media && "storageKey" in media
                      ? getMediaDisplayUrl(media as IMedia)
                      : null) || DEFAULT_THUMBNAIL;
                  return (
                    <button
                      key={media.id || index}
                      onClick={() => setCurrentIndex(index)}
                      className={`relative aspect-square w-16 sm:w-20 overflow-hidden rounded-lg border-2 transition-all shrink-0 ${
                        currentIndex === index
                          ? "border-white opacity-100"
                          : "border-transparent opacity-60 hover:opacity-100 hover:border-white/50"
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    >
                      <Image
                        src={thumbUrl}
                        alt={`${title || "Image"} thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 64px, 80px"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ImageGalleryModal;
