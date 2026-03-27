'use client';

import { Badge } from '@/components/ui/badge';
import { ROUTE_CONFIG } from '@/configs/routes';
import { DEFAULT_AVATAR, DEFAULT_THUMBNAIL } from '@/constants';
import { IPublicCourse } from '@/types/course';
import { getMediaDisplayUrl } from '@/types/media';
import { formatDuration } from '@/utils/format';
import { Calendar, ChevronLeft, Clock, Globe, Star, Users, ZoomIn } from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
// Import Swiper React components
import type { Swiper as SwiperType } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';

// Import required modules
import { FreeMode, Navigation, Thumbs } from 'swiper/modules';
const VideoModal = dynamic(() => import('./video-modal'), { ssr: false });
const ImageGalleryModal = dynamic(() => import('./image-gallery-modal'), {
  ssr: false,
});

interface CourseHeroProps {
  course: IPublicCourse;
}

const CourseHero = ({ course }: CourseHeroProps) => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isImageGalleryModalOpen, setIsImageGalleryModalOpen] = useState(false);
  const [galleryInitialIndex, setGalleryInitialIndex] = useState(0);
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);

  // Prepare all images for gallery (main image + preview images)
  // Always include main image first, even if it's DEFAULT_THUMBNAIL
  const mainImage = course.image;
  const previewImages = course.previewImages || [];

  // Build array: main image first, then preview images (excluding duplicates)
  const allImages = [];
  if (mainImage) {
    allImages.push(mainImage);
  }
  // Add preview images that are different from main image
  previewImages.forEach((previewImg) => {
    if (previewImg.id !== mainImage?.id) {
      allImages.push(previewImg);
    }
  });
  console.log('allImages', allImages);

  // If no images at all, use a placeholder
  const hasImages = allImages.length > 0;

  const formatStudentCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  // Check if course has a valid intro video URL
  const hasIntroVideo = course.introUrl && course.introUrl.trim() !== '';

  return (
    <>
      {/* Video Modal - Only render if video exists */}
      {hasIntroVideo && isVideoModalOpen && (
        <VideoModal
          isOpen={isVideoModalOpen}
          onClose={() => setIsVideoModalOpen(false)}
          videoUrl={course.introUrl}
          title={`${course.title} - Preview`}
        />
      )}

      {/* Image Gallery Modal */}
      {isImageGalleryModalOpen && (
        <ImageGalleryModal
          isOpen={isImageGalleryModalOpen}
          onClose={() => setIsImageGalleryModalOpen(false)}
          images={allImages}
          initialIndex={galleryInitialIndex}
          title={course.title}
        />
      )}

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gray-900 text-white">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-linear-to-br from-blue-900/20 to-purple-900/20"></div>
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>

        <div className="relative container mx-auto px-4 py-6 sm:px-6 sm:py-8">
          {/* Breadcrumb */}
          <div className="mb-4 sm:mb-6">
            <Link
              href={ROUTE_CONFIG.COURSES}
              className="inline-flex items-center text-sm text-gray-300 transition-colors hover:text-white sm:text-base"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Courses
            </Link>
          </div>

          <div className="grid items-center gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Left Content */}
            <div className="space-y-4 sm:space-y-6">
              {/* Category Badge */}
              <Badge variant="secondary" className="w-fit text-xs sm:text-sm">
                {course.category?.name || 'General'}
              </Badge>

              {/* Title */}
              <div>
                <h1 className="mb-3 text-2xl leading-tight font-bold sm:mb-4 sm:text-3xl md:text-4xl lg:text-5xl">
                  {course.title}
                </h1>
                <div className="prose prose-invert prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white prose-a:text-blue-400 max-w-none text-base leading-relaxed text-gray-300 sm:text-lg lg:text-xl">
                  {course.excerpt}
                </div>
              </div>

              {/* Course Stats */}
              <div className="flex flex-wrap items-center gap-3 text-xs sm:gap-4 sm:text-sm lg:gap-6">
                <div className="flex items-center space-x-1">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 sm:h-4 sm:w-4 ${
                          i < Math.floor(course.averageRating || 4.5)
                            ? 'fill-current text-yellow-400'
                            : 'text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-medium">{course.averageRating || 4.5}</span>
                  <span className="hidden text-gray-400 sm:inline">
                    ({formatStudentCount(course.totalReviews || 0)} reviews)
                  </span>
                </div>

                <div className="flex items-center space-x-1 text-gray-300">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>
                    {formatStudentCount(course.enrolledStudents || 0)}{' '}
                    <span className="hidden sm:inline">students</span>
                  </span>
                </div>

                <div className="flex items-center space-x-1 text-gray-300">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>{formatDuration(course.totalDuration || 0)}</span>
                </div>
              </div>

              {/* Instructor */}
              <div className="flex items-center space-x-3">
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-200 sm:h-12 sm:w-12">
                  <Image
                    src={course.author?.avatar || DEFAULT_AVATAR}
                    alt={course.author?.username || 'Instructor'}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 40px, 48px"
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-400 sm:text-sm">Created by</p>
                  <p className="text-sm font-medium sm:text-base">
                    {course.author?.username || 'Unknown Instructor'}
                  </p>
                </div>
              </div>

              {/* Course Details */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 sm:gap-4 sm:text-sm lg:gap-6">
                <div className="flex items-center space-x-1">
                  <Globe className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>English</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">
                    Last updated{' '}
                    {new Date(course.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                    })}
                  </span>
                  <span className="sm:hidden">
                    {new Date(course.updatedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className="border-gray-600 text-xs text-gray-300 sm:text-sm"
                >
                  {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                </Badge>
              </div>
            </div>

            {/* Right Content - Swiper Thumbs Gallery */}
            <div className="relative order-first lg:order-last">
              {hasImages ? (
                <div className="space-y-4">
                  {/* Main Swiper */}
                  <Swiper
                    spaceBetween={10}
                    navigation={true}
                    thumbs={{ swiper: thumbsSwiper }}
                    modules={[FreeMode, Navigation, Thumbs]}
                    className="mySwiper2 overflow-hidden rounded-xl shadow-2xl sm:rounded-2xl"
                  >
                    {allImages.map((media, index) => {
                      const imageUrl = getMediaDisplayUrl(media) || DEFAULT_THUMBNAIL;
                      return (
                        <SwiperSlide key={media.id || index}>
                          <div
                            className="group relative aspect-video cursor-pointer bg-gray-800"
                            onClick={() => {
                              setGalleryInitialIndex(index);
                              setIsImageGalleryModalOpen(true);
                            }}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setGalleryInitialIndex(index);
                                setIsImageGalleryModalOpen(true);
                              }
                            }}
                            aria-label="View image gallery"
                          >
                            <Image
                              src={imageUrl}
                              alt={`${course.title} ${index + 1}`}
                              fill
                              className="pointer-events-none object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            {/* Overlay - Show on hover */}
                            <div className="pointer-events-none absolute inset-0 bg-black/0 transition-all duration-300 group-hover:bg-black/40" />
                            {/* Zoom Icon - Centered, show on hover */}
                            <button
                              className="absolute top-1/2 left-1/2 z-10 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 scale-90 transform items-center justify-center rounded-full bg-white/90 opacity-0 shadow-lg transition-all duration-300 group-hover:scale-100 group-hover:opacity-100 hover:bg-white sm:h-16 sm:w-16"
                              onClick={(e) => {
                                e.stopPropagation();
                                setGalleryInitialIndex(index);
                                setIsImageGalleryModalOpen(true);
                              }}
                              aria-label="Zoom image"
                              type="button"
                            >
                              <ZoomIn className="h-6 w-6 text-gray-900 sm:h-8 sm:w-8" />
                            </button>
                          </div>
                        </SwiperSlide>
                      );
                    })}
                  </Swiper>

                  {/* Thumbs Swiper */}
                  {allImages.length > 1 && (
                    <Swiper
                      onSwiper={setThumbsSwiper}
                      spaceBetween={10}
                      slidesPerView={4}
                      freeMode={true}
                      watchSlidesProgress={true}
                      modules={[FreeMode, Navigation, Thumbs]}
                      className="mySwiper"
                      breakpoints={{
                        640: {
                          slidesPerView: 4,
                        },
                        1024: {
                          slidesPerView: 5,
                        },
                      }}
                    >
                      {allImages.map((media, index) => {
                        const imageUrl = getMediaDisplayUrl(media) || DEFAULT_THUMBNAIL;
                        return (
                          <SwiperSlide key={media.id || index}>
                            <div className="relative aspect-square cursor-pointer overflow-hidden rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10">
                              <Image
                                src={imageUrl}
                                alt={`${course.title} thumbnail ${index + 1}`}
                                fill
                                className="object-cover transition-transform duration-300 hover:scale-110"
                                sizes="(max-width: 640px) 25vw, (max-width: 1024px) 20vw, 20vw"
                              />
                              <div className="absolute inset-0 bg-black/0 transition-all hover:bg-black/30" />
                            </div>
                          </SwiperSlide>
                        );
                      })}
                    </Swiper>
                  )}
                </div>
              ) : (
                // Fallback if no images
                <div className="relative aspect-video overflow-hidden rounded-xl bg-gray-800 shadow-2xl sm:rounded-2xl">
                  <Image src={DEFAULT_THUMBNAIL} alt={course.title} fill className="object-cover" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseHero;
