'use client';

import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';
import * as React from 'react';
import { useState } from 'react';

import { BlogCard } from '@/components/blog/blog-card';
import { BlogCardSkeleton } from '@/components/blog/blog-card-skeleton';
import { usePublishedBlogs } from '@/hooks/use-blogs';
import { IBlog } from '@/types/blog';

// Blogs content component - Arrow function
const BlogsContent = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [allBlogs, setAllBlogs] = useState<IBlog[]>([]);

  // Fetch blogs
  const { data: blogsData, isLoading } = usePublishedBlogs({
    page: currentPage,
    limit: 12,
  });
<<<<<<< HEAD
=======

>>>>>>> auth-cookie
  const pagination = blogsData?.meta;

  // Update allBlogs when new data comes in
  React.useEffect(() => {
    if (blogsData?.result) {
      if (currentPage === 1) {
        // Reset for first load
        setAllBlogs(blogsData.result);
      } else {
        // Append for load more
        setAllBlogs((prev) => [...prev, ...blogsData.result]);
      }
    }
  }, [blogsData, currentPage]);

  // Handle load more - Arrow function
  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  return (
    <>
      {/* Blog Grid/List */}
      {isLoading && currentPage === 1 ? (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 12 }, (_, i) => (
            <BlogCardSkeleton key={i} />
          ))}
        </div>
      ) : allBlogs.length > 0 ? (
        <>
          {/* Blog Grid */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {allBlogs.map((blog) => (
              <BlogCard key={blog.id} post={blog} />
            ))}

            {/* Load More Skeletons */}
            {isLoading &&
              currentPage > 1 &&
              Array.from({ length: 12 }, (_, i) => <BlogCardSkeleton key={`loading-${i}`} />)}
          </div>

          {/* Load More Button */}
          {pagination && pagination.hasNextPage && !isLoading && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="lg"
                onClick={handleLoadMore}
                className="h-10 px-6 py-2.5 text-sm sm:h-12 sm:px-8 sm:py-3 sm:text-base"
              >
                Load More Articles
              </Button>
            </div>
          )}

          {/* End of Results Message */}
          {pagination && !pagination.hasNextPage && allBlogs.length > 0 && (
            <div className="py-6 text-center sm:py-8">
              <p className="text-xs text-gray-500 sm:text-sm">
                You&apos;ve reached the end of all articles
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="px-4 py-12 text-center sm:py-16 md:py-20">
          <BookOpen className="mx-auto mb-3 h-10 w-10 text-gray-400 sm:mb-4 sm:h-12 sm:w-12" />
          <h3 className="mb-1.5 text-base font-medium text-gray-900 sm:mb-2 sm:text-lg">
            No articles found
          </h3>
          <p className="text-sm text-gray-600 sm:text-base">
            Check back later for new articles and insights.
          </p>
        </div>
      )}
    </>
  );
};

export default BlogsContent;
