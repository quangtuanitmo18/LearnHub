"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MediaService } from "@/services/media";
import { getMediaDisplayUrl } from "@/types/media";
import Image from "next/image";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { MdDelete, MdFileUpload } from "react-icons/md";
import { toast } from "sonner";

interface BackendImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  maxSize?: number; // in bytes
  accept?: Record<string, string[]>;
}

export function BackendImageUpload({
  value,
  onChange,
  disabled = false,
  maxSize = 4 * 1024 * 1024, // 4MB default
  accept = { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
}: BackendImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (disabled || acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];

      if (file.size > maxSize) {
        const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
        const error = `File size must be less than ${maxSizeMB}MB`;
        toast.error(error);
        return;
      }

      setIsUploading(true);

      try {
        // Step 1: Request presigned URL for image
        const presignedData = await MediaService.requestImagePresignedUrls({
          files: [
            {
              filename: file.name,
              mimetype: file.type,
              size: file.size,
            },
          ],
        });

        if (!presignedData || presignedData.length === 0) {
          throw new Error("Failed to get upload URL");
        }

        const { mediaId, uploadUrl } = presignedData[0];

        // Step 2: Upload to S3
        await MediaService.uploadToS3(uploadUrl, file);

        // Step 3: Mark image upload complete
        const media = await MediaService.markImageUploadComplete({ mediaId });

        // Get the display URL
        const fileUrl = getMediaDisplayUrl(media);
        if (fileUrl) {
          onChange(fileUrl);
          toast.success("File uploaded successfully!");
        } else {
          throw new Error("Upload failed - no file URL received");
        }
      } catch (error: any) {
        toast.error(
          `Upload failed: ${
            error?.response?.data?.message || error?.message || "Unknown error"
          }`
        );
      } finally {
        setIsUploading(false);
      }
    },
    [disabled, maxSize, onChange]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept,
      maxFiles: 1,
      maxSize,
      disabled: disabled || isUploading,
    });

  const handleRemove = () => {
    if (disabled || isUploading) return;
    onChange("");
  };

  if (value) {
    return (
      <div className="relative w-full max-w-sm mx-auto">
        <Image
          src={value}
          alt="Uploaded image"
          width={300}
          height={200}
          className="rounded-lg object-cover border w-full"
        />
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={handleRemove}
          disabled={disabled || isUploading}
          className="absolute top-2 right-2"
        >
          <MdDelete className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors",
          "hover:bg-muted/25",
          isDragActive && "border-primary bg-primary/5",
          isDragReject && "border-destructive bg-destructive/5",
          (disabled || isUploading) && "cursor-not-allowed opacity-60",
          !isDragActive && !isDragReject && "border-muted-foreground/25"
        )}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center justify-center text-center space-y-3">
          <div className="p-3 rounded-full bg-muted">
            <MdFileUpload className="h-6 w-6 text-muted-foreground" />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">
              {isUploading
                ? "Uploading..."
                : isDragActive
                ? "Drop your image here"
                : "Click to upload or drag and drop"}
            </p>

            <p className="text-xs text-muted-foreground">
              PNG, JPG, JPEG, WebP up to {(maxSize / (1024 * 1024)).toFixed(1)}
              MB
            </p>
          </div>

          {isUploading && (
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div className="bg-primary h-full w-1/3 animate-pulse" />
            </div>
          )}
        </div>

        {isDragReject && (
          <div className="absolute inset-0 flex items-center justify-center bg-destructive/10 rounded-lg">
            <p className="text-sm text-destructive font-medium">
              Invalid file type
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
