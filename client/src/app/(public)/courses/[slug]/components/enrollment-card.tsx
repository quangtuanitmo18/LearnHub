'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ROUTE_CONFIG, getRoutes } from '@/configs/routes';
import { useAddToCart } from '@/hooks/use-cart';
import { useEnrollFree } from '@/hooks/use-courses';
import { useUser } from '@/stores/auth-store';
import { IPublicCourse } from '@/types/course';
import { IChapter } from '@/types/chapter';
import { formatDuration, formatPrice } from '@/utils/format';
import { getLastLessonForCourse } from '@/utils/last-course-lesson';
import { usePublishedLessonsByChapter } from '@/hooks/use-lessons';
import {
  Award,
  Clock,
  Download,
  Gift,
  Heart,
  Infinity,
  Play,
  PlayCircle,
  Share2,
  ShoppingCart,
  Smartphone,
} from 'lucide-react';
import { CourseImage } from '@/components/course/course-image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';

const VideoModal = dynamic(() => import('./video-modal'), { ssr: false });

interface EnrollmentCardProps {
  course: IPublicCourse;
  chapters?: IChapter[];
}

const EnrollmentCard = ({ course, chapters = [] }: EnrollmentCardProps) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const router = useRouter();
  const user = useUser();

  const hasIntroVideo = course.introUrl && course.introUrl.trim() !== '';

  // Get last lesson from localStorage for current course
  const getLastLessonId = (): string | null => {
    return getLastLessonForCourse(course.slug);
  };

  const lastLessonFromStorage = getLastLessonId();

  // Get the first chapter ID from passed chapters
  const firstChapterId = chapters[0]?.id;

  // Only fetch first chapter's lessons if we don't have a lesson in localStorage
  const shouldFetchLessons = !lastLessonFromStorage && !!firstChapterId;

  // Fetch first chapter's lessons to get the first lesson ID (only if needed)
  const { data: firstChapterLessons = [] } = usePublishedLessonsByChapter(
    firstChapterId || '',
    shouldFetchLessons, // Only fetch if we don't have localStorage data and have a chapter
  );
  const firstLessonId = firstChapterLessons[0]?.id || '';

  // Check if user has an active membership subscription
  const hasActiveMembership = user?.membership?.isActive && user?.membership?.isMembership;

  // Check if user is already enrolled in the course or has active membership
  const isEnrolled = user?.courses?.includes(course.id) || hasActiveMembership || false;

  // Free enrollment mutation using the custom hook
  const enrollFreeMutation = useEnrollFree();

  // Add to cart mutation using the custom hook
  const addToCartMutation = useAddToCart();

  // Get the lesson ID to use (localStorage first, then first lesson, then undefined)
  const getLessonIdToUse = (): string | undefined => {
    return lastLessonFromStorage || firstLessonId || undefined;
  };

  const handleEnrollNow = () => {
    if (!user) {
      toast.warning('Please login to enroll in the course');
      return;
    }
    enrollFreeMutation.mutate(course.id, {
      onSuccess: () => {
        toast.success('Successfully enrolled in the course!');
        router.push(getRoutes.learning(course.slug, getLessonIdToUse()));
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to enroll in the course');
      },
    });
  };

  const handleContinueLearning = () => {
    const url = getRoutes.learning(course.slug, getLessonIdToUse());
    router.push(url);
  };

  const handleAddToCart = () => {
    if (!user) {
      toast.warning('Please login to add course to cart');
      return;
    }
    addToCartMutation.mutate(
      {
        courseId: course.id,
      },
      {
        onSuccess: () => {
          toast.success('Course successfully added to cart!');
        },
        onError: (error: Error) => {
          toast.error(error.message || 'Failed to add course to cart');
        },
      },
    );
  };

  const handleBuyNow = () => {
    if (!user) {
      toast.warning('Please login to add course to cart');
      return;
    }
    addToCartMutation.mutate(
      {
        courseId: course.id,
      },
      {
        onSuccess: () => {
          toast.success('Course added to cart! Redirecting to checkout...');
          router.push(ROUTE_CONFIG.CART);
        },
        onError: (error: Error) => {
          toast.error(error.message || 'Failed to add course to cart');
        },
      },
    );
  };

  const discountPercentage = course.oldPrice
    ? Math.round(((course.oldPrice - course.price) / course.oldPrice) * 100)
    : 0;

  // Calculate days remaining until milestone date
  const calculateDaysRemaining = () => {
    const today = new Date();
    const milestoneDate = new Date('2026-02-20'); // Set your milestone date (YYYY-MM-DD)

    // If milestone has passed, return 0
    if (today > milestoneDate) return 0;

    // Calculate difference in milliseconds
    const diffTime = milestoneDate.getTime() - today.getTime();
    // Convert to days and round down
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const daysRemaining = calculateDaysRemaining();

  const featureIcons = {
    'on-demand video': Clock,
    'downloadable resources': Download,
    'Full lifetime access': Infinity,
    'Access on mobile and TV': Smartphone,
    'Certificate of completion': Award,
  };

  const features = [
    `${formatDuration(course.totalDuration || 0)} of on-demand video`,
    `${course.totalLessons || 25} lessons`,
    'Full lifetime access',
    'Access on mobile and TV',
    'Certificate of completion',
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
      {hasIntroVideo && isVideoModalOpen && (
        <VideoModal
          isOpen={isVideoModalOpen}
          onClose={() => setIsVideoModalOpen(false)}
          videoUrl={course.introUrl}
          title={`${course.title} - Preview`}
        />
      )}

      {/* Video Preview */}
      <div
        className={`group relative aspect-video bg-gray-900 ${
          hasIntroVideo ? 'cursor-pointer' : ''
        }`}
        onClick={() => {
          if (hasIntroVideo) setIsVideoModalOpen(true);
        }}
        role={hasIntroVideo ? 'button' : undefined}
        tabIndex={hasIntroVideo ? 0 : undefined}
        onKeyDown={(e) => {
          if (!hasIntroVideo) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsVideoModalOpen(true);
          }
        }}
        aria-label={hasIntroVideo ? 'Play course preview video' : undefined}
      >
        <CourseImage
          image={course.image}
          alt={course.title}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {hasIntroVideo && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="flex h-16 w-16 scale-90 transform items-center justify-center rounded-full bg-white shadow-lg transition-transform duration-300 group-hover:scale-100 sm:h-20 sm:w-20">
              <Play className="ml-1 h-6 w-6 fill-current text-gray-900 sm:h-8 sm:w-8" />
            </div>
          </div>
        )}
      </div>

      {/* Pricing */}
      <div className="p-4 sm:p-6">
        <div className="mb-4 sm:mb-6">
          {course.isFree ? (
            <div className="text-2xl font-bold text-green-400 sm:text-3xl">Free</div>
          ) : (
            <div className="relative">
              {/* Label */}
              <div className="mb-3 text-xs font-medium text-green-600 sm:text-sm">
                SPECIAL OFFER
              </div>

              {/* Price Container */}
              <div className="relative flex items-baseline gap-3 sm:gap-4">
                {/* Discounted Price with Gradient */}
                <div className="flex items-baseline gap-0.5">
                  <span className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                    {formatPrice(course.price)}
                  </span>
                </div>

                {/* Original Price with Strikethrough */}
                {course.oldPrice && (
                  <span className="text-base text-gray-400 line-through sm:text-lg">
                    {formatPrice(course.oldPrice)}
                  </span>
                )}

                {/* Discount Badge - Top Right */}
                {course.oldPrice && discountPercentage > 0 && (
                  <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2">
                    <Badge className="rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-bold text-white shadow-lg hover:bg-red-600 sm:px-3 sm:py-1 sm:text-sm">
                      -{discountPercentage}%
                    </Badge>
                  </div>
                )}
              </div>

              {/* Days Remaining */}
              {daysRemaining > 0 && (
                <div className="mt-3 flex items-center gap-1.5 text-red-400">
                  <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="text-xs font-medium sm:text-sm">
                    {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left at this price!
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mb-4 space-y-2 sm:mb-6 sm:space-y-3">
          {isEnrolled ? (
            // User is already enrolled - show continue learning button
            <Button
              size="lg"
              className="h-12 w-full bg-green-600 text-sm hover:bg-green-700 sm:text-base"
              onClick={handleContinueLearning}
            >
              <PlayCircle className="mr-2 h-4 w-4" />
              Continue Learning
            </Button>
          ) : course.isFree ? (
            // Course is free and user is not enrolled - show enroll button
            <Button
              size="lg"
              className="h-12 w-full bg-green-600 text-sm hover:bg-green-700 sm:text-base"
              onClick={handleEnrollNow}
              disabled={enrollFreeMutation.isPending}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {enrollFreeMutation.isPending ? 'Enrolling...' : 'Enroll Now'}
            </Button>
          ) : (
            // Course is paid and user is not enrolled - show purchase options
            <>
              <Button
                size="lg"
                className="h-12 w-full bg-purple-600 text-sm hover:bg-purple-700 sm:text-base"
                onClick={handleAddToCart}
                disabled={addToCartMutation.isPending}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {addToCartMutation.isPending ? 'Adding...' : 'Add to Cart'}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 w-full text-sm sm:text-base"
                onClick={handleBuyNow}
                disabled={addToCartMutation.isPending}
              >
                {addToCartMutation.isPending ? 'Processing...' : 'Buy Now'}
              </Button>
            </>
          )}
        </div>

        {/* Secondary Actions */}
        <div className="mb-4 grid grid-cols-3 gap-1 sm:mb-6 sm:gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsWishlisted(!isWishlisted)}
            className={`flex h-auto flex-col items-center justify-center py-2 text-xs sm:flex-row sm:text-sm ${
              isWishlisted ? 'text-red-600' : 'text-gray-600'
            }`}
          >
            <Heart
              className={`h-3 w-3 sm:mr-1 sm:h-4 sm:w-4 ${isWishlisted ? 'fill-current' : ''}`}
            />
            <span className="hidden sm:inline">{isWishlisted ? 'Wishlisted' : 'Wishlist'}</span>
            <span className="mt-1 sm:hidden">Wish</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex h-auto flex-col items-center justify-center py-2 text-xs text-gray-600 sm:flex-row sm:text-sm"
          >
            <Share2 className="h-3 w-3 sm:mr-1 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Share</span>
            <span className="mt-1 sm:hidden">Share</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex h-auto flex-col items-center justify-center py-2 text-xs text-gray-600 sm:flex-row sm:text-sm"
          >
            <Gift className="h-3 w-3 sm:mr-1 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Gift</span>
            <span className="mt-1 sm:hidden">Gift</span>
          </Button>
        </div>

        {/* Money-back Guarantee */}
        {!course.isFree && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-2.5 text-center sm:mb-6 sm:p-3">
            <p className="text-xs font-medium text-green-800 sm:text-sm">
              30-Day Money-Back Guarantee
            </p>
          </div>
        )}

        {/* Course Includes */}
        <div>
          <h4 className="mb-2 text-sm font-medium text-gray-900 sm:mb-3 sm:text-base">
            This course includes:
          </h4>
          <div className="space-y-1.5 sm:space-y-2">
            {features.map((feature, index) => {
              const getIcon = (feature: string) => {
                const lowerFeature = feature.toLowerCase();
                for (const [key, IconComponent] of Object.entries(featureIcons)) {
                  if (lowerFeature.includes(key.toLowerCase())) {
                    return IconComponent;
                  }
                }
                return Award; // Default icon
              };

              const IconComponent = getIcon(feature);

              return (
                <div key={index} className="flex items-center space-x-2 text-xs sm:text-sm">
                  <IconComponent className="h-3 w-3 shrink-0 text-gray-500 sm:h-4 sm:w-4" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentCard;
