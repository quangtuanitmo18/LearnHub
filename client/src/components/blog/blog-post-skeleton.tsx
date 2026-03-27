import { Skeleton } from '@/components/ui/skeleton';

export function BlogPostSkeleton() {
  return (
    <div className="container mx-auto px-6 py-20">
      <div className="mx-auto max-w-4xl">
        {/* Header Skeleton */}
        <div className="mb-16">
          {/* Category Badge */}
          <div className="mb-4 flex justify-center">
            <Skeleton className="h-6 w-32 rounded-full" />
          </div>

          {/* Title */}
          <div className="mb-8 space-y-4 text-center">
            <Skeleton className="mx-auto h-12 w-3/4" />
            <Skeleton className="mx-auto h-12 w-1/2" />
          </div>

          {/* Meta Info */}
          <div className="mb-8 flex items-center justify-center space-x-6 text-gray-500">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>

          {/* Author Info */}
          <div className="flex items-center justify-center space-x-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>

        {/* Featured Image */}
        <div className="mb-12">
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>

        {/* Content Skeleton */}
        <div className="prose max-w-none space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-full" />
          <br />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <br />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    </div>
  );
}
