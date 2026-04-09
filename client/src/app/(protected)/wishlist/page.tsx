'use client';

import { CourseCard } from '@/components/course/course-card';
import Loader from '@/components/loader';
import { Button } from '@/components/ui/button';
import { useMyWishlist, useToggleWishlist } from '@/hooks/use-wishlist';
import { Heart, SearchX } from 'lucide-react';
import Link from 'next/link';

const WishlistPage = () => {
  const { data: wishlist, isLoading } = useMyWishlist({ limit: 100 });
  const toggleWishlistMutation = useToggleWishlist();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Loader />
      </div>
    );
  }

  const items = wishlist?.items || [];

  return (
    <div className="min-h-screen bg-gray-50/30 pb-16">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="flex items-center gap-3 text-2xl font-bold text-gray-900 sm:text-3xl">
            <Heart className="h-8 w-8 fill-current text-red-500" />
            My Wishlist
          </h1>
          <p className="mt-2 text-gray-500">
            You have {items.length} {items.length === 1 ? 'course' : 'courses'} saved for later
          </p>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border-8 border-white bg-gray-50 shadow-sm">
              <SearchX className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="mb-3 text-2xl font-bold text-gray-900">Your wishlist is empty</h3>
            <p className="mb-8 text-gray-500">
              You haven&apos;t saved any courses yet. Browse our catalog and click the heart icon on
              any course to save it for later.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-blue-600 font-semibold text-white shadow-md hover:bg-blue-700"
            >
              <Link href="/courses">Explore Courses</Link>
            </Button>
          </div>
        ) : (
          <div className="grid auto-rows-fr grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((course: any) => (
              <div key={course.id} className="group/item relative flex h-full">
                {/* 
                    Render the standard CourseCard exactly as it appears in Courses grid.
                    Wrapped in flex-1 so it spans full height.
                  */}
                <div className="flex-1">
                  <CourseCard course={course} />
                </div>

                {/* Remove Button Overlay - shifted down and to the right to avoid badges */}
                <div className="absolute top-[3.5rem] right-3 z-20">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleWishlistMutation.mutate(course.id);
                    }}
                    disabled={toggleWishlistMutation.isPending}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-red-500 shadow-md backdrop-blur transition-all hover:scale-110 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    title="Remove from wishlist"
                    aria-label="Remove from wishlist"
                  >
                    <Heart className="h-4 w-4 fill-current" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
