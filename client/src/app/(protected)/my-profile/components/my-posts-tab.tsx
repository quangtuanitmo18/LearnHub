'use client';

import { Button } from '@/components/ui/button';
import { MdAdd, MdArticle } from 'react-icons/md';

// My posts tab component - Arrow function
const MyPostsTab = () => {
  // Mock data - replace with real data from your API
  const posts = [];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div>
          <h1 className="mb-1 text-xl font-bold sm:mb-2 sm:text-2xl">My Posts</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage your posts and content you&apos;ve created
          </p>
        </div>
        <Button className="flex h-9 w-full items-center gap-1.5 text-xs sm:h-10 sm:w-auto sm:gap-2 sm:text-sm">
          <MdAdd className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          Create New Post
        </Button>
      </div>

      {/* Posts Content */}
      {posts.length > 0 ? (
        <div className="grid gap-4 sm:gap-6">{/* Posts will be rendered here */}</div>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-gray-300 bg-linear-to-br from-gray-50 to-gray-100 px-4 py-12 text-center sm:rounded-2xl sm:py-16 lg:py-20 dark:border-gray-600 dark:from-gray-800 dark:to-gray-900">
          <div className="mb-6 sm:mb-8">
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-br from-blue-100 to-blue-200 sm:mb-6 sm:h-28 sm:w-28 lg:h-32 lg:w-32 dark:from-blue-900 dark:to-blue-800">
              <MdArticle className="h-12 w-12 text-blue-600 sm:h-14 sm:w-14 lg:h-16 lg:w-16 dark:text-blue-400" />
            </div>
          </div>
          <h3 className="mb-3 text-lg font-bold text-gray-900 sm:mb-4 sm:text-xl lg:text-2xl dark:text-gray-100">
            ✍️ No Posts Yet
          </h3>
          <p className="mx-auto mb-6 max-w-lg text-sm leading-relaxed text-gray-600 sm:mb-8 sm:text-base lg:text-lg dark:text-gray-400">
            You haven&apos;t created any posts yet. Start sharing your knowledge and experience with
            the community!
          </p>
          <div className="flex justify-center">
            <Button className="flex w-full items-center gap-1.5 bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-sm font-semibold shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl sm:w-auto sm:gap-2 sm:px-6 sm:py-3 sm:text-base lg:text-lg">
              <MdAdd className="h-4 w-4 sm:h-5 sm:w-5" />
              Create Your First Post
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPostsTab;
