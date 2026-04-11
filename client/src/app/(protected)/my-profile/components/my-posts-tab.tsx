'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useMyPosts, useDeleteCommunityPost } from '@/hooks/use-blogs';
import { IBlog, BlogStatus } from '@/types/blog';
import { format } from 'date-fns';
import {
  Plus,
  FileEdit,
  Trash2,
  Eye,
  ThumbsUp,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Loader2,
  BookOpen,
} from 'lucide-react';

const STATUS_CONFIG = {
  [BlogStatus.DRAFT]: {
    label: 'Draft',
    icon: FileText,
    className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  },
  [BlogStatus.PENDING]: {
    label: 'Pending Review',
    icon: Clock,
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  },
  [BlogStatus.PUBLISHED]: {
    label: 'Published',
    icon: CheckCircle2,
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
  [BlogStatus.REJECTED]: {
    label: 'Rejected',
    icon: XCircle,
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
};

const TABS = [
  { key: 'all', label: 'All' },
  { key: BlogStatus.DRAFT, label: 'Drafts' },
  { key: BlogStatus.PENDING, label: 'Pending' },
  { key: BlogStatus.PUBLISHED, label: 'Published' },
  { key: BlogStatus.REJECTED, label: 'Rejected' },
];

function PostCard({ post, onDelete }: { post: IBlog; onDelete: (id: string) => void }) {
  const statusConfig = STATUS_CONFIG[post.status];
  const StatusIcon = statusConfig.icon;
  const canEdit = [BlogStatus.DRAFT, BlogStatus.PENDING, BlogStatus.REJECTED].includes(post.status);
  const canDelete = [BlogStatus.DRAFT, BlogStatus.PENDING].includes(post.status);

  return (
    <article className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-300 hover:border-gray-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
      {/* Thumbnail */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100 dark:bg-gray-800">
        <img
          src={
            post.thumbnail ||
            'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2015&q=80'
          }
          alt={post.title || 'Post thumbnail'}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Status Badge */}
        <div className="absolute top-4 left-4">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium shadow-sm ${statusConfig.className}`}
          >
            <StatusIcon className="h-3 w-3" />
            {statusConfig.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col space-y-3 p-5">
        {/* Meta Info */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {format(new Date(post.createdAt), 'MMM dd, yyyy')}
            </span>
          </div>

          {post.status === BlogStatus.PUBLISHED && (
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <ThumbsUp className="h-3.5 w-3.5" />
                {post.upvotesCount || 0}
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5" />
                {post.viewsCount || 0}
              </span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="line-clamp-2 text-lg leading-tight font-bold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
          {post.title || 'Untitled Post'}
        </h3>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="line-clamp-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            {post.excerpt}
          </p>
        )}

        {/* Rejected notice */}
        {post.status === BlogStatus.REJECTED && (
          <div className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400">
            Your post was not approved. Please edit and resubmit.
          </div>
        )}

        {/* Actions Footer */}
        <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4 dark:border-gray-700/50">
          {canEdit && (
            <Link href={`/my-profile/posts/${post.id}/edit`}>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 bg-transparent text-xs text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
              >
                <FileEdit className="h-3.5 w-3.5" />
                Edit
              </Button>
            </Link>
          )}

          {post.status === BlogStatus.PUBLISHED && post.slug && (
            <Link href={`/blogs/${post.slug}`} target="_blank">
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 bg-transparent text-xs text-gray-700 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400"
              >
                <Eye className="h-3.5 w-3.5" />
                Read
              </Button>
            </Link>
          )}

          {canDelete && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 border-red-200 bg-transparent text-xs text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-900/20"
              onClick={() => onDelete(post.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

// Loading skeleton
function PostCardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="aspect-[16/10] bg-gray-200 dark:bg-gray-700" />
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className="mb-2 h-6 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="mb-4 h-4 w-full rounded bg-gray-200 dark:bg-gray-700" />
        <div className="mb-4 h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />

        <div className="mt-auto flex gap-2 border-t border-gray-100 pt-4 dark:border-gray-700/50">
          <div className="h-8 w-16 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-8 w-16 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    </div>
  );
}

const MyPostsTab = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useMyPosts({ page, limit: 12 });
  const deleteMutation = useDeleteCommunityPost();

  const posts = data?.result || [];
  const filteredPosts = activeTab === 'all' ? posts : posts.filter((p) => p.status === activeTab);
  const pagination = data?.meta;

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="mb-1 text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
            My Posts
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Share your knowledge and experience with the community
          </p>
        </div>
        <Link href="/my-profile/posts/new">
          <Button className="flex h-9 w-full items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-xs text-white shadow-md transition-all hover:from-blue-700 hover:to-indigo-700 sm:w-auto sm:text-sm">
            <Plus className="h-4 w-4" />
            Create New Post
          </Button>
        </Link>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setPage(1);
            }}
            className={`rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all sm:text-sm ${
              activeTab === tab.key
                ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Posts grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredPosts.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} onDelete={handleDelete} />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-500">
                Page {page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasNextPage}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100/50 px-4 py-16 text-center dark:border-gray-600 dark:from-gray-800/50 dark:to-gray-900/50">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30">
            <BookOpen className="h-10 w-10 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
            {activeTab === 'all'
              ? '✍️ No Posts Yet'
              : `No ${TABS.find((t) => t.key === activeTab)?.label} Posts`}
          </h3>
          <p className="mx-auto mb-6 max-w-md text-sm text-gray-600 dark:text-gray-400">
            {activeTab === 'all'
              ? 'Start sharing your knowledge and experience with the community!'
              : 'No posts in this category yet.'}
          </p>
          {activeTab === 'all' && (
            <Link href="/my-profile/posts/new">
              <Button className="gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:from-blue-700 hover:to-indigo-700">
                <Plus className="h-4 w-4" />
                Create Your First Post
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* Deletion loading overlay */}
      {deleteMutation.isPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Deleting post...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPostsTab;
