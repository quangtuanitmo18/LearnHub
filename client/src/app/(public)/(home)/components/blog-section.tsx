import Link from 'next/link';
import { BlogCard } from '../../../../components/blog/blog-card';
import { ArrowRight, BookOpen } from 'lucide-react';
import { ROUTE_CONFIG } from '@/configs/routes';
import type { BlogsListResponse } from '@/types/blog';

interface BlogSectionProps {
  blogsData: BlogsListResponse;
}

// Blog section component - Arrow function
const BlogSection = ({ blogsData }: BlogSectionProps) => {
  const blogs = blogsData?.blogs || [];

  return (
    <section className="bg-white py-12 sm:py-16 md:py-20 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="mb-10 text-center sm:mb-12 md:mb-16">
          {/* Badge */}
          <div className="mb-3 inline-flex items-center space-x-2 rounded-full bg-green-100 px-3 py-2 text-green-700 sm:mb-4 sm:px-4">
            <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="text-xs font-medium sm:text-sm">Latest Articles</span>
          </div>

          {/* Main Title */}
          <h2 className="mb-3 px-4 text-2xl font-bold text-gray-900 sm:mb-4 sm:text-3xl md:text-4xl lg:text-5xl">
            From Our Blog
          </h2>
          <p className="mx-auto max-w-3xl px-4 text-base leading-relaxed text-gray-600 sm:text-lg md:text-xl">
            Stay updated with the latest insights, tutorials, and industry news from our team of
            experts.
          </p>

          {/* Quick Stats */}
          <div className="mx-auto mt-6 grid max-w-lg grid-cols-3 gap-4 sm:mt-8 sm:flex sm:max-w-none sm:items-center sm:justify-center sm:gap-0 sm:space-x-8">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600 sm:text-xl md:text-2xl">9,000+</div>
              <div className="text-xs leading-tight text-gray-500 sm:text-sm">
                Articles Published
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600 sm:text-xl md:text-2xl">5,000+</div>
              <div className="text-xs leading-tight text-gray-500 sm:text-sm">Monthly Readers</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600 sm:text-xl md:text-2xl">12</div>
              <div className="text-xs leading-tight text-gray-500 sm:text-sm">Expert Authors</div>
            </div>
          </div>
        </div>

        {/* View All Link */}
        <div className="mb-4 flex justify-center px-4 sm:mb-6 sm:justify-end sm:px-0">
          <Link
            href={ROUTE_CONFIG.BLOGS}
            className="group inline-flex items-center text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 sm:text-base"
          >
            View All Posts
            <ArrowRight className="ml-2 h-3 w-3 transition-transform duration-300 group-hover:translate-x-1 sm:h-4 sm:w-4" />
          </Link>
        </div>

        {/* Blog Grid */}
        {blogs.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:gap-8 lg:grid-cols-3 2xl:grid-cols-4">
            {blogs.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="px-4 py-8 text-center sm:py-12">
            <div className="mx-auto max-w-md">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 sm:h-20 sm:w-20">
                <BookOpen className="h-6 w-6 text-gray-400 sm:h-8 sm:w-8" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-700 sm:text-xl">
                No Blog Posts Available
              </h3>
              <p className="text-sm text-gray-600 sm:text-base">
                Check back later for new articles and insights from our team of experts.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogSection;
