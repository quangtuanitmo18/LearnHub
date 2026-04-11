'use client';

import { Button } from '@/components/ui/button';
import { ROUTE_CONFIG } from '@/configs/routes';
import { useCommunityBlogsByCourse } from '@/hooks/use-blogs';
import { ArrowRight, BookOpen, Calendar } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface CourseCommunityArticlesProps {
  courseId: string;
}

const CourseCommunityArticles = ({ courseId }: CourseCommunityArticlesProps) => {
  const { data: response, isLoading } = useCommunityBlogsByCourse(courseId, { page: 1, limit: 3 });

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <BookOpen className="text-primary h-6 w-6" />
          <h2 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
            Community Articles
          </h2>
        </div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex animate-pulse gap-4">
              <div className="h-24 w-32 rounded-lg bg-gray-200"></div>
              <div className="flex-1 space-y-2">
                <div className="h-5 w-3/4 rounded bg-gray-200"></div>
                <div className="h-4 w-full rounded bg-gray-200"></div>
                <div className="h-4 w-1/4 rounded bg-gray-200"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const articles = response?.result || [];

  if (articles.length === 0) {
    return null; // Don't show the section if there are no articles
  }

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
            <BookOpen className="text-primary h-5 w-5" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
            Community Knowledge
          </h2>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={`${ROUTE_CONFIG.BLOGS}/${article.slug}`}
            className="group hover:border-primary/20 flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white transition-all hover:shadow-md"
          >
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100">
              {article.thumbnail ? (
                <Image
                  src={article.thumbnail}
                  alt={article.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="text-primary flex h-full w-full items-center justify-center">
                  <BookOpen className="h-8 w-8 opacity-50" />
                </div>
              )}
            </div>

            <div className="flex flex-1 flex-col p-4 sm:p-5">
              <h3 className="group-hover:text-primary mb-2 line-clamp-2 text-lg font-bold text-gray-900 transition-colors">
                {article.title}
              </h3>

              <p className="mb-4 line-clamp-2 flex-1 text-sm text-gray-600">{article.excerpt}</p>

              <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="h-3.5 w-3.5" />
                  <time dateTime={article.publishedAt || article.createdAt}>
                    {new Date(article.publishedAt || article.createdAt).toLocaleDateString()}
                  </time>
                </div>

                <span className="text-primary flex items-center text-xs font-semibold">
                  Read{' '}
                  <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {(response?.meta?.totalItems ?? 0) > 3 && (
        <div className="mt-6 flex justify-center">
          <Link href={`${ROUTE_CONFIG.BLOGS}?courseId=${courseId}`}>
            <Button variant="outline" className="w-full sm:w-auto">
              View all articles
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default CourseCommunityArticles;
