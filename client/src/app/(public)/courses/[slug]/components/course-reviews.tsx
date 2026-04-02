'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DEFAULT_AVATAR } from '@/constants';
import {
  useCourseReviewStats,
  useCourseReviewsWithLoadMore,
  useDeleteReview,
} from '@/hooks/use-reviews';
import { useUser } from '@/stores/auth-store';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Check, Edit, Filter, MoreHorizontal, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';
import WriteReviewDialog from './write-review-dialog';

dayjs.extend(relativeTime);

interface Review {
  id: string;
  userId: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
  star: number;
  createdAt: string;
  content: string;
}

interface CourseReviewsProps {
  courseTitle?: string;
  courseId: string;
  fallbackAverageRating?: number;
  fallbackTotalReviews?: number;
}

const CourseReviews = ({
  courseTitle,
  courseId,
  fallbackAverageRating = 0,
  fallbackTotalReviews = 0,
}: CourseReviewsProps) => {
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<number | null>(null);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const currentUser = useUser();

  const deleteReviewMutation = useDeleteReview();

  // Fetch review statistics separately
  const { data: statsData, isLoading: isLoadingStats } = useCourseReviewStats(courseId);

  // Fetch reviews data with load more functionality
  const {
    reviews = [],
    isLoading,
    isLoadingMore,
    hasNextPage,
    loadMore,
    reset,
  } = useCourseReviewsWithLoadMore(courseId, {
    limit: 5,
    minStar: selectedRatingFilter || undefined, // Use minStar for "star & up" filtering
  });

  // Use stats from dedicated endpoint, fallback to props if not available
  const averageRating = statsData?.averageRating ?? fallbackAverageRating ?? 0;
  const total = statsData?.total ?? fallbackTotalReviews ?? 0;
  const ratingDistribution = statsData?.ratingDistribution ?? {};

  // Calculate rating distribution from backend data
  const ratingDistributionArray = [5, 4, 3, 2, 1].map((stars) => {
    const count = parseInt(ratingDistribution[stars.toString()]?.toString() || '0');
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    return { stars, count, percentage };
  });

  // Display all loaded reviews (pagination handles the limit)
  const displayedReviews = reviews;

  const formatReviewCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const isOwner = (review: Review) => {
    return currentUser?.id === review.userId;
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setOpenDropdownId(null); // Close dropdown
  };

  const handleDeleteReview = async (reviewId: string) => {
    setOpenDropdownId(null); // Close dropdown immediately
    if (window.confirm('Are you sure you want to delete this review?')) {
      await deleteReviewMutation.mutateAsync({ reviewId, courseId });
    }
  };

  const handleFilterChange = (rating: number | null) => {
    setSelectedRatingFilter(rating);
    setOpenDropdownId(null); // Close any open dropdown
    reset(); // Reset pagination when filter changes
  };

  const getFilterLabel = () => {
    if (selectedRatingFilter === null) return 'Filter Reviews';
    return `${selectedRatingFilter} Star${selectedRatingFilter !== 1 ? 's' : ''} & Up`;
  };

  const isFilterActive = selectedRatingFilter !== null;

  // Show loading state if either reviews or stats are loading
  if (isLoading || isLoadingStats) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="animate-pulse">
          <div className="mb-3 h-5 w-1/2 rounded bg-gray-200 sm:mb-4 sm:h-6 sm:w-1/3"></div>
          <div className="space-y-3 sm:space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex space-x-3 sm:space-x-4">
                <div className="h-10 w-10 shrink-0 rounded-full bg-gray-200 sm:h-12 sm:w-12"></div>
                <div className="min-w-0 flex-1 space-y-1.5 sm:space-y-2">
                  <div className="h-3 w-1/3 rounded bg-gray-200 sm:h-4 sm:w-1/4"></div>
                  <div className="h-2.5 w-full rounded bg-gray-200 sm:h-3"></div>
                  <div className="h-2.5 w-4/5 rounded bg-gray-200 sm:h-3 sm:w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <h3 className="text-lg font-semibold text-gray-900 sm:text-xl">Student Reviews</h3>
          <div className="flex items-center gap-2">
            {currentUser && (
              <WriteReviewDialog courseTitle={courseTitle} courseId={courseId}>
                <Button size="sm" className="h-9 flex-1 text-xs sm:flex-none sm:text-sm">
                  Write a Review
                </Button>
              </WriteReviewDialog>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={isFilterActive ? 'default' : 'outline'}
                  size="sm"
                  className="h-9 flex-1 text-xs sm:flex-none sm:text-sm"
                >
                  <Filter className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">{getFilterLabel()}</span>
                  <span className="sm:hidden">Filter</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => handleFilterChange(null)}
                  className="flex items-center justify-between"
                >
                  <span>All Reviews</span>
                  {selectedRatingFilter === null && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {[5, 4, 3, 2, 1].map((rating) => (
                  <DropdownMenuItem
                    key={rating}
                    onClick={() => handleFilterChange(rating)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div className="mr-2 flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < rating ? 'fill-current text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span>
                        {rating} Star{rating !== 1 ? 's' : ''} & Up
                      </span>
                    </div>
                    {selectedRatingFilter === rating && <Check className="h-4 w-4" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Rating Overview */}
      <div className="border-b border-gray-200 p-4 sm:p-6">
        <div className="grid gap-6 sm:grid-cols-2 sm:gap-8">
          {/* Overall Rating */}
          <div className="text-center">
            <div className="mb-2 text-4xl font-bold text-gray-900 sm:text-5xl">
              {averageRating.toFixed(2)}
            </div>
            <div className="mb-2 flex items-center justify-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 sm:h-6 sm:w-6 ${
                    i < Math.floor(averageRating) ? 'fill-current text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-600 sm:text-sm">
              Course Rating • {formatReviewCount(total)} reviews
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-1.5 sm:space-y-2">
            {ratingDistributionArray.map((item) => (
              <div key={item.stars} className="flex items-center space-x-2 sm:space-x-3">
                <div className="flex items-center space-x-1 text-xs text-gray-600 sm:space-x-2 sm:text-sm">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 sm:h-4 sm:w-4 ${
                          i < item.stars ? 'fill-current text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="w-6 sm:w-8">{item.stars}</span>
                </div>
                <div className="h-1.5 flex-1 rounded-full bg-gray-200 sm:h-2">
                  <div
                    className="h-1.5 rounded-full bg-yellow-400 transition-all duration-300 sm:h-2"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
                <span className="w-10 text-right text-xs text-gray-600 sm:w-12 sm:text-sm">
                  {item.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="p-8 text-center sm:p-12">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 sm:mb-4 sm:h-16 sm:w-16">
            <Star className="h-7 w-7 text-gray-400 sm:h-8 sm:w-8" />
          </div>
          <h4 className="mb-2 text-base font-medium text-gray-900 sm:text-lg">No reviews yet</h4>
          <p className="mb-4 text-sm text-gray-600 sm:mb-6 sm:text-base">
            Be the first to share your experience with this course
          </p>
          {currentUser ? (
            <WriteReviewDialog courseTitle={courseTitle} courseId={courseId}>
              <Button className="h-10 text-sm sm:h-11 sm:text-base">Write the First Review</Button>
            </WriteReviewDialog>
          ) : (
            <p className="text-xs text-gray-500 sm:text-sm">Sign in to write a review</p>
          )}
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {displayedReviews.map((review) => (
            <div key={review.id} className="p-4 sm:p-6">
              <div className="flex space-x-3 sm:space-x-4">
                {/* User Avatar */}
                <div className="relative h-10 w-10 shrink-0">
                  <Avatar className="h-full w-full shadow-sm transition-all duration-200">
                    <AvatarImage
                      src={review?.user?.avatar || DEFAULT_AVATAR}
                      alt={review?.user?.username || 'User'}
                    />
                    <AvatarFallback className="bg-linear-to-br from-blue-600 to-purple-600 text-xs font-bold text-white sm:text-sm">
                      {review?.user?.username
                        ? review?.user?.username.slice(0, 2).toUpperCase()
                        : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Review Content */}
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h5 className="truncate text-sm font-medium text-gray-900 sm:text-base">
                        {review?.user?.username}
                      </h5>
                      <div className="mt-1 flex items-center space-x-1 sm:space-x-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 sm:h-4 sm:w-4 ${
                                i < review.star ? 'fill-current text-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs whitespace-nowrap text-gray-500 sm:text-sm">
                          {dayjs(review.createdAt).fromNow()}
                        </span>
                      </div>
                    </div>
                    {isOwner(review) && (
                      <DropdownMenu
                        open={openDropdownId === review.id}
                        onOpenChange={(isOpen) => setOpenDropdownId(isOpen ? review.id : null)}
                      >
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setOpenDropdownId(null);
                              handleEditReview(review);
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Review
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              handleDeleteReview(review.id);
                              setOpenDropdownId(null);
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Review
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed wrap-break-word text-gray-700 sm:text-sm">
                    {review.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {hasNextPage && (
        <div className="border-t border-gray-200 p-4 text-center sm:p-6">
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={isLoadingMore}
            className="h-10 w-full text-xs sm:h-11 sm:w-auto sm:text-sm"
          >
            {isLoadingMore ? (
              <>
                <div className="mr-2 h-3 w-3 animate-spin rounded-full border-b-2 border-gray-600 sm:h-4 sm:w-4"></div>
                Loading...
              </>
            ) : (
              <>
                <span className="hidden sm:inline">
                  Load More Reviews ({total - reviews.length} remaining)
                </span>
                <span className="sm:hidden">Load More ({total - reviews.length})</span>
              </>
            )}
          </Button>
        </div>
      )}

      {/* Edit Review Dialog */}
      {editingReview && (
        <WriteReviewDialog
          key={editingReview.id} // Force re-render when review changes
          courseTitle={courseTitle}
          courseId={courseId}
          editMode={{
            reviewId: editingReview.id,
            initialStar: editingReview.star,
            initialContent: editingReview.content,
          }}
          onClose={() => {
            setEditingReview(null);
            setOpenDropdownId(null);
          }}
        />
      )}
    </div>
  );
};

export default CourseReviews;
