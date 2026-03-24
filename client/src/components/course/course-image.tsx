"use client";

import Image from "next/image";
import { DEFAULT_THUMBNAIL } from "@/constants";
import { IMedia, getMediaDisplayUrl } from "@/types/media";

interface CourseImageProps {
  image: IMedia | null | undefined;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

/**
 * Component to display course image using populated Media object
 */
export function CourseImage({
  image,
  alt,
  fill = true,
  className,
  sizes,
  priority,
}: CourseImageProps) {
  const imageUrl = image ? getMediaDisplayUrl(image) : null;

  if (fill) {
    return (
      <Image
        src={imageUrl || DEFAULT_THUMBNAIL}
        alt={alt}
        fill
        className={className}
        sizes={sizes}
        priority={priority}
      />
    );
  }

  return (
    <Image
      src={imageUrl || DEFAULT_THUMBNAIL}
      alt={alt}
      width={800}
      height={450}
      className={className}
      sizes={sizes}
      priority={priority}
    />
  );
}
