"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROUTE_CONFIG, getRoutes } from "@/configs/routes";
import { useAddToCart } from "@/hooks/use-cart";
import { useEnrollFree } from "@/hooks/use-courses";
import { useUser } from "@/stores/auth-store";
import { IPublicCourse } from "@/types/course";
import { IChapter } from "@/types/chapter";
import { formatDuration } from "@/utils/format";
import { getLastLessonForCourse } from "@/utils/last-course-lesson";
import { usePublishedLessonsByChapter } from "@/hooks/use-lessons";
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
} from "lucide-react";
import { CourseImage } from "@/components/course/course-image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import dynamic from "next/dynamic";

const VideoModal = dynamic(() => import("./video-modal"), { ssr: false });

interface EnrollmentCardProps {
  course: IPublicCourse;
  chapters?: IChapter[];
}

const EnrollmentCard = ({ course, chapters = [] }: EnrollmentCardProps) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const router = useRouter();
  const user = useUser();

  const hasIntroVideo = course.introUrl && course.introUrl.trim() !== "";

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
    firstChapterId || "",
    shouldFetchLessons // Only fetch if we don't have localStorage data and have a chapter
  );
  const firstLessonId = firstChapterLessons[0]?.id || "";

  // Check if user has an active membership subscription
  const hasActiveMembership =
    user?.membership?.isActive && user?.membership?.isMembership;

  // Check if user is already enrolled in the course or has active membership
  const isEnrolled =
    user?.courses?.includes(course.id) || hasActiveMembership || false;

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
      toast.warning("Please login to enroll in the course");
      return;
    }
    enrollFreeMutation.mutate(course.id, {
      onSuccess: () => {
        toast.success("Successfully enrolled in the course!");
        router.push(getRoutes.learning(course.slug, getLessonIdToUse()));
      },
      onError: (error: Error) => {
        toast.error(error.message || "Failed to enroll in the course");
      },
    });
  };

  const handleContinueLearning = () => {
    const url = getRoutes.learning(course.slug, getLessonIdToUse());
    router.push(url);
  };

  const handleAddToCart = () => {
    if (!user) {
      toast.warning("Please login to add course to cart");
      return;
    }
    addToCartMutation.mutate(
      {
        courseId: course.id,
      },
      {
        onSuccess: () => {
          toast.success("Course successfully added to cart!");
        },
        onError: (error: Error) => {
          toast.error(error.message || "Failed to add course to cart");
        },
      }
    );
  };

  const handleBuyNow = () => {
    if (!user) {
      toast.warning("Please login to add course to cart");
      return;
    }
    addToCartMutation.mutate(
      {
        courseId: course.id,
      },
      {
        onSuccess: () => {
          toast.success("Course added to cart! Redirecting to checkout...");
          router.push(ROUTE_CONFIG.CART);
        },
        onError: (error: Error) => {
          toast.error(error.message || "Failed to add course to cart");
        },
      }
    );
  };

  const discountPercentage = course.oldPrice
    ? Math.round(((course.oldPrice - course.price) / course.oldPrice) * 100)
    : 0;

  // Calculate days remaining until milestone date
  const calculateDaysRemaining = () => {
    const today = new Date();
    const milestoneDate = new Date("2026-02-20"); // Set your milestone date (YYYY-MM-DD)

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
    "on-demand video": Clock,
    "downloadable resources": Download,
    "Full lifetime access": Infinity,
    "Access on mobile and TV": Smartphone,
    "Certificate of completion": Award,
  };

  const features = [
    `${formatDuration(course.totalDuration || 0)} of on-demand video`,
    `${course.totalLessons || 25} lessons`,
    "Full lifetime access",
    "Access on mobile and TV",
    "Certificate of completion",
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
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
        className={`relative aspect-video bg-gray-900 group ${
          hasIntroVideo ? "cursor-pointer" : ""
        }`}
        onClick={() => {
          if (hasIntroVideo) setIsVideoModalOpen(true);
        }}
        role={hasIntroVideo ? "button" : undefined}
        tabIndex={hasIntroVideo ? 0 : undefined}
        onKeyDown={(e) => {
          if (!hasIntroVideo) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsVideoModalOpen(true);
          }
        }}
        aria-label={hasIntroVideo ? "Play course preview video" : undefined}
      >
        <CourseImage
          image={course.image}
          alt={course.title}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {hasIntroVideo && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform duration-300 shadow-lg">
              <Play className="h-6 w-6 sm:h-8 sm:w-8 text-gray-900 ml-1 fill-current" />
            </div>
          </div>
        )}
      </div>

      {/* Pricing */}
      <div className="p-4 sm:p-6 ">
        <div className="mb-4 sm:mb-6">
          {course.isFree ? (
            <div className="text-2xl sm:text-3xl font-bold text-green-400">
              Free
            </div>
          ) : (
            <div className="relative">
              {/* Label */}
              <div className="text-xs sm:text-sm text-green-600 mb-3 font-medium">
                GIÁ BÁN ƯU ĐÃI
              </div>

              {/* Price Container */}
              <div className="relative flex items-baseline gap-3 sm:gap-4">
                {/* Discounted Price with Gradient */}
                <div className="flex items-baseline gap-0.5">
                  <span className="text-3xl sm:text-4xl lg:text-5xl font-bold  tracking-tight">
                    {new Intl.NumberFormat("vi-VN").format(course.price)}
                  </span>
                  <span className="text-2xl sm:text-3xl  font-bold  decoration-2">
                    đ
                  </span>
                </div>

                {/* Original Price with Strikethrough */}
                {course.oldPrice && (
                  <span className="text-base sm:text-lg text-gray-400 line-through">
                    {new Intl.NumberFormat("vi-VN").format(course.oldPrice)} đ
                  </span>
                )}

                {/* Discount Badge - Top Right */}
                {course.oldPrice && discountPercentage > 0 && (
                  <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2">
                    <Badge className="bg-red-600 text-white hover:bg-red-600 text-xs sm:text-sm font-bold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-lg">
                      -{discountPercentage}%
                    </Badge>
                  </div>
                )}
              </div>

              {/* Days Remaining */}
              {daysRemaining > 0 && (
                <div className="flex items-center gap-1.5 mt-3 text-red-400">
                  <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm font-medium">
                    {daysRemaining} {daysRemaining === 1 ? "day" : "days"} left
                    at this price!
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
          {isEnrolled ? (
            // User is already enrolled - show continue learning button
            <Button
              size="lg"
              className="w-full bg-green-600 hover:bg-green-700 h-12 text-sm sm:text-base"
              onClick={handleContinueLearning}
            >
              <PlayCircle className="h-4 w-4 mr-2" />
              Continue Learning
            </Button>
          ) : course.isFree ? (
            // Course is free and user is not enrolled - show enroll button
            <Button
              size="lg"
              className="w-full bg-green-600 hover:bg-green-700 h-12 text-sm sm:text-base"
              onClick={handleEnrollNow}
              disabled={enrollFreeMutation.isPending}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {enrollFreeMutation.isPending ? "Enrolling..." : "Enroll Now"}
            </Button>
          ) : (
            // Course is paid and user is not enrolled - show purchase options
            <>
              <Button
                size="lg"
                className="w-full bg-purple-600 hover:bg-purple-700 h-12 text-sm sm:text-base"
                onClick={handleAddToCart}
                disabled={addToCartMutation.isPending}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full h-12 text-sm sm:text-base"
                onClick={handleBuyNow}
                disabled={addToCartMutation.isPending}
              >
                {addToCartMutation.isPending ? "Processing..." : "Buy Now"}
              </Button>
            </>
          )}
        </div>

        {/* Secondary Actions */}
        <div className="grid grid-cols-3 gap-1 sm:gap-2 mb-4 sm:mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsWishlisted(!isWishlisted)}
            className={`flex flex-col sm:flex-row items-center justify-center h-auto py-2 text-xs sm:text-sm ${
              isWishlisted ? "text-red-600" : "text-gray-600"
            }`}
          >
            <Heart
              className={`h-3 w-3 sm:h-4 sm:w-4 sm:mr-1 ${
                isWishlisted ? "fill-current" : ""
              }`}
            />
            <span className="hidden sm:inline">
              {isWishlisted ? "Wishlisted" : "Wishlist"}
            </span>
            <span className="sm:hidden mt-1">Wish</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col sm:flex-row items-center justify-center h-auto py-2 text-xs sm:text-sm text-gray-600"
          >
            <Share2 className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
            <span className="hidden sm:inline">Share</span>
            <span className="sm:hidden mt-1">Share</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col sm:flex-row items-center justify-center h-auto py-2 text-xs sm:text-sm text-gray-600"
          >
            <Gift className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
            <span className="hidden sm:inline">Gift</span>
            <span className="sm:hidden mt-1">Gift</span>
          </Button>
        </div>

        {/* Money-back Guarantee */}
        {!course.isFree && (
          <div className="text-center mb-4 sm:mb-6 p-2.5 sm:p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-xs sm:text-sm text-green-800 font-medium">
              30-Day Money-Back Guarantee
            </p>
          </div>
        )}

        {/* Course Includes */}
        <div>
          <h4 className="font-medium text-sm sm:text-base text-gray-900 mb-2 sm:mb-3">
            This course includes:
          </h4>
          <div className="space-y-1.5 sm:space-y-2">
            {features.map((feature, index) => {
              const getIcon = (feature: string) => {
                const lowerFeature = feature.toLowerCase();
                for (const [key, IconComponent] of Object.entries(
                  featureIcons
                )) {
                  if (lowerFeature.includes(key.toLowerCase())) {
                    return IconComponent;
                  }
                }
                return Award; // Default icon
              };

              const IconComponent = getIcon(feature);

              return (
                <div
                  key={index}
                  className="flex items-center space-x-2 text-xs sm:text-sm"
                >
                  <IconComponent className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 shrink-0" />
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
