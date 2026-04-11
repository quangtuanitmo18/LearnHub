'use client';

import * as React from 'react';
import { useState, useMemo, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import Editor from '@/components/tiptap/editor';
import Toolbar from '@/components/tiptap/toolbar';
import { MediaPickerDialog } from '@/components/media/media-picker-dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import { useAllCategories } from '@/hooks/use-categories';
import { useMyCourses } from '@/hooks/use-courses';
import { useBlog, useUpdateCommunityPost } from '@/hooks/use-blogs';
import { BlogStatus } from '@/types/blog';
import { IMedia, MediaType, getMediaDisplayUrl } from '@/types/media';
import {
  ArrowLeft,
  Save,
  Send,
  Loader2,
  AlertTriangle,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react';

// Validation schema for community post
const communityPostSchema = yup
  .object({
    title: yup.string().required('Title is required').min(10, 'Title must be at least 10 characters').max(200),
    content: yup.string().required('Content is required').min(50, 'Content must be at least 50 characters'),
    excerpt: yup.string().required('Excerpt is required').min(10, 'Excerpt must be at least 10 characters').max(300),
    thumbnail: yup.string().optional().default(''),
    categoryId: yup.string().required('Category is required'),
    courseId: yup.string().optional().default(''),
  })
  .required();

type CommunityPostSchema = yup.InferType<typeof communityPostSchema>;

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

const EditPostPage = ({ params }: EditPostPageProps) => {
  const resolvedParams = use(params);
  const router = useRouter();
  const { data: post, isLoading: postLoading } = useBlog(resolvedParams.id);
  const { data: categories } = useAllCategories();
  const { data: myCourses } = useMyCourses();
  const updateMutation = useUpdateCommunityPost();
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  const defaultValues = useMemo(
    () => ({
      title: '',
      content: '',
      excerpt: '',
      thumbnail: '',
      categoryId: '',
      courseId: '',
    }),
    [],
  );

  const form = useForm<CommunityPostSchema>({
    resolver: yupResolver(communityPostSchema),
    defaultValues,
    mode: 'onChange',
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    reset,
    watch,
  } = form;

  // Populate form when data arrives
  useEffect(() => {
    if (post) {
      reset({
        title: post.title || '',
        content: post.content || '',
        excerpt: post.excerpt || '',
        thumbnail: post.thumbnail || '',
        categoryId: post.categoryId || '',
        courseId: post.courseId || '',
      });
    }
  }, [post, reset]);

  const onSubmit = (status: BlogStatus.DRAFT | BlogStatus.PENDING) => {
    return handleSubmit(async (data) => {
      updateMutation.mutate(
        {
          id: resolvedParams.id,
          data: {
            title: data.title.trim(),
            content: data.content,
            excerpt: data.excerpt,
            categoryId: data.categoryId,
            courseId: data.courseId || undefined,
            thumbnail: data.thumbnail || undefined,
            status,
          },
        },
        {
          onSuccess: () => {
            router.push('/my-profile?tab=posts');
          },
        },
      );
    })();
  };

  if (postLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Post not found</h1>
        <Link href="/my-profile?tab=posts">
          <Button className="mt-4">Back to My Posts</Button>
        </Link>
      </div>
    );
  }

  // Guard: cannot edit published posts
  if (post.status === BlogStatus.PUBLISHED) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Cannot Edit Published Post
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Contact admin if you need to make changes to a published post.
        </p>
        <Link href="/my-profile?tab=posts">
          <Button className="mt-4">Back to My Posts</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1000px] space-y-6 px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/my-profile?tab=posts">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Post</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Update your post content
          </p>
        </div>
      </div>

      {/* Rejected banner */}
      {post.status === BlogStatus.REJECTED && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/30 dark:bg-red-900/10">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
          <div>
            <p className="text-sm font-medium text-red-800 dark:text-red-300">
              This post was rejected
            </p>
            <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">
              Please review and edit your content, then submit again for review.
            </p>
          </div>
        </div>
      )}

      {/* Form */}
      <Form {...form}>
        <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="border-b pb-2 text-lg font-semibold text-gray-900 dark:text-white">
              Basic Information
            </h3>

            <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Title <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter a descriptive title..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category */}
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Category <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(categories || []).map((cat: { id: string; name: string }) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Linked Course */}
            <FormField
              control={form.control}
              name="courseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Linked Course (Optional)</FormLabel>
                  <Select value={field.value || ''} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="No course linked" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No course linked</SelectItem>
                      {(myCourses || []).map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="text-xs text-muted-foreground">
                    Link your post to a course you&apos;re enrolled in
                  </div>
                </FormItem>
              )}
            />

            {/* Excerpt */}
            <FormField
              control={form.control}
              name="excerpt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Excerpt <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Brief description of your post"
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Thumbnail */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="thumbnail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">Thumbnail Image</FormLabel>
                  <FormControl>
                    <div className="space-y-3">
                      {field.value ? (
                        <div className="group relative w-full max-w-md overflow-hidden rounded-lg border-2 border-gray-200 bg-gray-50 transition-all hover:border-blue-400 dark:border-gray-600 dark:bg-gray-700">
                          <div className="relative aspect-video w-full">
                            <Image
                              src={field.value}
                              alt="Thumbnail preview"
                              fill
                              className="object-cover transition-transform group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/0 transition-all group-hover:bg-black/50" />
                            <div className="absolute top-3 right-3 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMediaPickerOpen(true);
                                }}
                                className="bg-white/95 text-gray-900 shadow-md backdrop-blur-sm hover:bg-white"
                              >
                                <ImageIcon className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  field.onChange('');
                                }}
                                className="bg-white/95 text-red-600 shadow-md backdrop-blur-sm hover:bg-white"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => setMediaPickerOpen(true)}
                          className="group flex w-full max-w-md cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50/30 p-12 transition-all hover:border-blue-400 hover:bg-blue-50/50 dark:border-gray-600 dark:bg-gray-700/30 dark:hover:border-blue-500 dark:hover:bg-blue-900/10"
                        >
                          <div className="flex flex-col items-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 transition-all group-hover:bg-blue-200 dark:bg-blue-900/30">
                              <ImageIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Select Thumbnail Image
                              </p>
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Choose from your media library or upload a new image
                              </p>
                            </div>
                            <Button type="button" variant="default" size="sm" className="mt-2">
                              <ImageIcon className="mr-2 h-4 w-4" />
                              Browse Media Library
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                  {!field.value && (
                    <p className="text-xs text-muted-foreground">
                      Recommended: 16:9 aspect ratio, minimum 1200x675px
                    </p>
                  )}
                </FormItem>
              )}
            />
          </div>

          {/* Content Editor */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Content <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="overflow-hidden rounded-md border">
                      <Toolbar />
                      <Editor
                        content={field.value}
                        onChange={(content) => field.onChange(content)}
                        className="min-h-[400px]"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link href="/my-profile?tab=posts">
            <Button variant="outline" className="w-full sm:w-auto">
              Cancel
            </Button>
          </Link>
          <Button
            variant="outline"
            disabled={isSubmitting || updateMutation.isPending}
            onClick={() => onSubmit(BlogStatus.DRAFT)}
            className="w-full gap-1.5 sm:w-auto"
          >
            {updateMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Draft
          </Button>
          <Button
            disabled={isSubmitting || updateMutation.isPending}
            onClick={() => onSubmit(BlogStatus.PENDING)}
            className="w-full gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 sm:w-auto"
          >
            {updateMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Submit for Review
          </Button>
        </div>
      </Form>

      {/* Media Picker */}
      <MediaPickerDialog
        open={mediaPickerOpen}
        onOpenChange={setMediaPickerOpen}
        onSelect={(media: IMedia) => {
          const mediaUrl = getMediaDisplayUrl(media);
          if (mediaUrl) {
            form.setValue('thumbnail', mediaUrl, { shouldValidate: true });
          }
        }}
        typeFilter={MediaType.IMAGE}
        title="Select Thumbnail Image"
        description="Choose an image from your media library or upload a new one"
      />
    </div>
  );
};

export default EditPostPage;
