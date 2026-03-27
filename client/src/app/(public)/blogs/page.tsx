'use client';

import dynamic from 'next/dynamic';
import { BookOpen } from 'lucide-react';

// Dynamic import for below-the-fold content (progressive loading)
const BlogsContent = dynamic(() => import('./components/blogs-content'));

// Header component (above-the-fold, critical) - Arrow function
const BlogsHeader = () => (
  <div className="mb-10 text-center sm:mb-12 md:mb-16">
    <div className="mb-3 inline-flex items-center space-x-1.5 rounded-full bg-blue-100 px-3 py-1.5 text-blue-700 sm:mb-4 sm:space-x-2 sm:px-4 sm:py-2">
      <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      <span className="text-xs font-medium sm:text-sm">Our Blog</span>
    </div>
    <h1 className="mb-3 px-4 text-3xl font-bold text-gray-900 sm:mb-4 sm:text-4xl md:text-5xl">
      Latest Articles & Insights
    </h1>
    <p className="mx-auto max-w-3xl px-4 text-base leading-relaxed text-gray-600 sm:text-lg md:text-xl">
      Discover insights, tutorials, and industry news from our team of experts. Stay updated with
      the latest trends and best practices.
    </p>
  </div>
);

// Main page component - Arrow function
const BlogPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 sm:px-6 sm:py-16 md:py-20">
        {/* Critical above-the-fold content - loads immediately */}
        <BlogsHeader />

        {/* Below-the-fold content - progressive loading with SEO */}
        <BlogsContent />
      </div>
    </div>
  );
};

export default BlogPage;
