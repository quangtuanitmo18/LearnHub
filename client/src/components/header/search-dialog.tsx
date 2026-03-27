'use client';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { getRoutes, ROUTE_CONFIG } from '@/configs/routes';
import { useSearch } from '@/hooks/use-search';
import { Search } from 'lucide-react';
import Image from 'next/image';
import { CourseImage } from '@/components/course/course-image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  // Use real search functionality with TanStack Query
  const {
    data: searchData,
    isLoading: searchLoading,
    isFetching: searchFetching,
    isError: searchError,
  } = useSearch(searchQuery);

  const courses = searchData?.courses || [];
  const blogs = searchData?.blogs || [];

  // Handle search submission
  function handleSearchSubmit(query: string) {
    if (query.trim()) {
      setOpen(false);
      setSearchQuery('');
      router.push(getRoutes.searchWithQuery(query.trim()));
    }
  }

  // Handle item selection
  function handleItemSelect(type: 'course' | 'blog', slug: string) {
    setOpen(false);
    setSearchQuery('');
    if (type === 'course') {
      router.push(getRoutes.courseDetail(slug));
    } else {
      router.push(getRoutes.blogDetail(slug));
    }
  }

  // Handle "View more" button clicks
  function handleViewMore(type: 'course' | 'blog') {
    setOpen(false);
    setSearchQuery('');
    if (type === 'course') {
      router.push(ROUTE_CONFIG.COURSES);
    } else {
      router.push(ROUTE_CONFIG.BLOGS);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="group relative h-8 w-8 rounded-full border border-transparent p-0 text-gray-500 transition-all duration-300 hover:border-blue-100 hover:bg-linear-to-br hover:from-blue-50 hover:via-blue-100/50 hover:to-purple-50 hover:text-blue-600 hover:shadow-lg hover:shadow-blue-200/20 focus:outline-none sm:h-10 sm:w-10"
          aria-label="Open search dialog"
          aria-expanded={open}
          aria-haspopup="dialog"
        >
          <div className="absolute inset-0 rounded-full bg-linear-to-br from-blue-500/0 to-purple-500/0 transition-all duration-300 group-hover:from-blue-500/8 group-hover:to-purple-500/8"></div>
          <Search
            size={16}
            className="relative z-10 transition-transform duration-300 group-hover:scale-110 sm:h-[18px] sm:w-[18px]"
          />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Search Courses & Tutorials</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search courses, tutorials..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="h-10 text-base sm:h-12"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearchSubmit(searchQuery);
                }
              }}
            />
            <CommandList className="max-h-72 sm:max-h-96">
              {(searchLoading || searchFetching) && searchQuery.length >= 2 && (
                <div className="flex items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Searching...</span>
                </div>
              )}

              {searchError && searchQuery.length >= 2 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Search className="mb-3 h-12 w-12 text-red-400" />
                  <p className="text-lg font-medium text-red-600">An error occurred</p>
                  <p className="text-sm text-gray-500">Please try again later</p>
                </div>
              )}

              {!searchLoading &&
                !searchFetching &&
                !searchError &&
                searchQuery.length >= 2 &&
                courses.length === 0 &&
                blogs.length === 0 && (
                  <CommandEmpty>
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Search className="text-muted-foreground mb-3 h-12 w-12" />
                      <p className="text-lg font-medium">No results found</p>
                      <p className="text-muted-foreground text-sm">
                        Try searching with different keywords
                      </p>
                      <button
                        onClick={() => handleSearchSubmit(searchQuery)}
                        className="mt-3 text-sm text-blue-600 underline hover:text-blue-800"
                        aria-label={`View all search results for "${searchQuery}"`}
                      >
                        View all search results
                      </button>
                    </div>
                  </CommandEmpty>
                )}

              {searchQuery.length < 2 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Search className="text-muted-foreground mb-3 h-12 w-12" />
                  <p className="text-lg font-medium">Search courses and tutorials</p>
                  <p className="text-muted-foreground text-sm">
                    Enter at least 2 characters to start searching
                  </p>
                </div>
              )}

              {/* Courses Group */}
              {!searchLoading && !searchFetching && courses.length > 0 && (
                <CommandGroup>
                  <div className="mb-2 flex items-center justify-between border-b px-2 py-3 sm:py-4">
                    <h3 className="text-sm font-semibold tracking-wide text-gray-900 uppercase">
                      COURSES
                    </h3>
                    <button
                      onClick={() => handleViewMore('course')}
                      className="min-h-[44px] px-2 text-sm text-gray-500 transition-colors hover:text-blue-600"
                      aria-label="View more courses"
                    >
                      View more
                    </button>
                  </div>
                  {courses.slice(0, 3).map((course) => (
                    <CommandItem
                      key={course.id}
                      value={course.title}
                      onSelect={() => handleItemSelect('course', course.slug)}
                      className="flex min-h-[60px] cursor-pointer items-center gap-3 border-none p-3 hover:bg-gray-50 sm:min-h-[auto] sm:p-2"
                    >
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-linear-to-br from-blue-500 to-purple-600">
                        {course?.image ? (
                          <CourseImage
                            image={course.image}
                            alt={course?.title || 'Course'}
                            sizes="48px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <span className="text-lg font-semibold text-white">
                              {course.title?.charAt(0)?.toUpperCase() || 'C'}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-gray-900">
                          {course?.title}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* Blogs Group */}
              {!searchLoading && !searchFetching && blogs.length > 0 && (
                <CommandGroup>
                  <div className="flex items-center justify-between border-b px-2 py-3 sm:p-4">
                    <h3 className="text-sm font-semibold tracking-wide text-gray-900 uppercase">
                      TUTORIALS
                    </h3>
                    <button
                      onClick={() => handleViewMore('blog')}
                      className="min-h-[44px] px-2 text-sm text-gray-500 transition-colors hover:text-blue-600"
                      aria-label="View more blog posts"
                    >
                      View more
                    </button>
                  </div>
                  {blogs.slice(0, 3).map((blog) => (
                    <CommandItem
                      key={blog.id}
                      value={blog.title}
                      onSelect={() => handleItemSelect('blog', blog.slug)}
                      className="flex min-h-[60px] cursor-pointer items-center gap-3 border-none p-3 hover:bg-gray-50 sm:min-h-[auto] sm:p-4"
                    >
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-linear-to-br from-pink-500 to-orange-400">
                        {blog?.thumbnail ? (
                          <Image
                            src={blog.thumbnail}
                            alt={blog?.title || 'Blog'}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <span className="text-lg font-semibold text-white">
                              {blog.title?.charAt(0)?.toUpperCase() || 'B'}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="line-clamp-2 text-sm leading-relaxed font-medium text-gray-900">
                          {blog?.title}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </div>
      </DialogContent>
    </Dialog>
  );
}
