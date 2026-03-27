'use client';

import Image from 'next/image';
import Link from 'next/link';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { CalendarDays, Clock, User, ArrowLeft } from 'lucide-react';

// Extend dayjs with relativeTime plugin
dayjs.extend(relativeTime);
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ROUTE_CONFIG } from '@/configs/routes';
import { IBlog } from '@/types/blog';
import { DEFAULT_AVATAR } from '@/constants';

interface BlogHeaderProps {
  blog: IBlog;
}

// Blog header component (above-the-fold, critical) - Arrow function
const BlogHeader = ({ blog }: BlogHeaderProps) => {
  const formatDate = (dateString: string) => {
    const date = dayjs(dateString);
    const now = dayjs();
    const diffDays = now.diff(date, 'day');

    // Show relative time for recent posts (within 7 days)
    if (diffDays < 7) {
      return date.fromNow();
    }

    // Show formatted date for older posts
    return date.format('MMMM D, YYYY');
  };

  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.replace(/<[^>]*>/g, '').split(' ').length;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    return `${readTime} min`;
  };

  return (
    <>
      {/* Back to Blog */}
      <div className="mb-6 sm:mb-8">
        <Link href={ROUTE_CONFIG.BLOGS} aria-label="Back to all blog posts">
          <Button variant="ghost" className="h-9 pl-0 text-sm sm:h-10 sm:text-base">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />
            Back to Blog
          </Button>
        </Link>
      </div>

      {/* Article Header */}
      <header
        className="mb-8 sm:mb-10 md:mb-12"
        itemScope
        itemType="https://schema.org/BlogPosting"
      >
        {/* Category */}
        <div className="mb-4 flex justify-center sm:mb-6">
          <Badge
            className="bg-blue-100 px-2.5 py-1 text-xs text-blue-700 hover:bg-blue-200 sm:px-3 sm:text-sm"
            itemProp="articleSection"
          >
            {blog.category?.name || 'Uncategorized'}
          </Badge>
        </div>

        {/* Title */}
        <h1
          className="mb-4 px-4 text-center text-2xl leading-tight font-bold text-gray-900 sm:mb-6 sm:text-3xl md:text-4xl lg:text-5xl"
          itemProp="headline"
        >
          {blog.title}
        </h1>

        {/* Excerpt */}
        {blog.excerpt && (
          <p
            className="mb-6 px-4 text-center text-base leading-relaxed text-gray-600 sm:mb-8 sm:text-lg md:text-xl"
            itemProp="description"
          >
            {blog.excerpt}
          </p>
        )}

        {/* Meta Information */}
        <div className="mb-6 flex flex-wrap items-center justify-center gap-3 px-4 text-xs text-gray-500 sm:mb-8 sm:gap-4 sm:text-sm md:gap-6">
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <CalendarDays className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
            <time dateTime={blog.publishedAt || blog.createdAt} itemProp="datePublished">
              {formatDate(blog.publishedAt || blog.createdAt)}
            </time>
          </div>
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
            <span itemProp="timeRequired">{calculateReadTime(blog.content)} read</span>
          </div>
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
            <span itemProp="author" itemScope itemType="https://schema.org/Person">
              <span itemProp="name">
                {blog.author?.username || blog.author?.name || 'Anonymous'}
              </span>
            </span>
          </div>
        </div>

        {/* Author Info */}
        <div
          className="mb-6 flex items-center justify-center space-x-3 sm:mb-8 sm:space-x-4"
          itemProp="author"
          itemScope
          itemType="https://schema.org/Person"
        >
          <div className="relative h-10 w-10 overflow-hidden rounded-full sm:h-12 sm:w-12">
            <Image
              src={blog.author?.avatar || DEFAULT_AVATAR}
              alt={blog.author?.username || 'Author'}
              fill
              className="object-cover"
              itemProp="image"
            />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-900 sm:text-base" itemProp="name">
              {blog.author?.username || blog.author?.name || 'Anonymous'}
            </p>
            <p className="text-xs text-gray-500 sm:text-sm">Author</p>
          </div>
        </div>
      </header>
    </>
  );
};

export default BlogHeader;
