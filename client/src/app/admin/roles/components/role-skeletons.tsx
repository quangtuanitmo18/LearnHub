import { Skeleton } from '@/components/ui/skeleton';

export const RoleCardSkeleton = () => (
  <div className="bg-card rounded-lg border shadow-sm">
    <div className="p-6 pb-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-1 items-start gap-3">
          <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-32" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-14" />
              <div className="bg-muted-foreground/40 h-1 w-1 rounded-full" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </div>
        <Skeleton className="h-8 w-8 shrink-0 rounded" />
      </div>
    </div>

    <div className="space-y-4 px-6 pb-6">
      {/* Description */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      {/* Permissions */}
      <div className="bg-muted/50 flex items-center justify-between rounded-lg px-3 py-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-5 w-8 rounded-full" />
      </div>
    </div>
  </div>
);

export const RoleListSkeleton = () => (
  <div className="rounded-lg border p-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="space-y-1">
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-8 w-8 rounded" />
      </div>
    </div>
  </div>
);

interface RolesSkeletonProps {
  view: 'grid' | 'list';
  count?: number;
}

const RolesSkeleton = ({ view, count }: RolesSkeletonProps) => {
  const gridCount = count || 6;
  const listCount = count || 5;

  if (view === 'grid') {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: gridCount }).map((_, i) => (
          <RoleCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Array.from({ length: listCount }).map((_, i) => (
        <RoleListSkeleton key={i} />
      ))}
    </div>
  );
};

export default RolesSkeleton;
