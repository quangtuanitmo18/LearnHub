'use client';

import { Button } from '@/components/ui/button';
import { ROUTE_CONFIG } from '@/configs/routes';
import { IBlog } from '@/types/blog';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { BlogUpvote } from './blog-upvote';

interface BlogContentProps {
  blog: IBlog;
}

// Blog content component (below-the-fold) - Arrow function
const BlogContent = ({ blog }: BlogContentProps) => {
  return (
    <>
      {/* Article Content */}
      <article className="mb-8 max-w-none sm:mb-10 md:mb-12">
        <div
          dangerouslySetInnerHTML={{ __html: blog.content }}
          className="tiptap ProseMirror rich-content"
        />
      </article>

      <BlogUpvote 
        blogId={blog.id} 
        authorId={blog.authorId || ''} 
        upvotesCount={blog.upvotesCount} 
      />

      {/* Article Footer */}
      <footer className="mt-10 border-t border-gray-200 pt-6 sm:mt-12 sm:pt-8 md:mt-16">
        <div className="flex justify-center">
          <Link href={ROUTE_CONFIG.BLOGS} aria-label="Back to all blog posts">
            <Button
              variant="outline"
              size="lg"
              className="h-10 px-6 text-sm sm:h-12 sm:px-8 sm:text-base"
            >
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />
              Back to All Articles
            </Button>
          </Link>
        </div>
      </footer>
    </>
  );
};

export default BlogContent;
