'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import slugify from 'slugify';

import Editor from '@/components/tiptap/editor';
import Toolbar from '@/components/tiptap/toolbar';
import { MediaPickerDialog } from '@/components/media/media-picker-dialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useCreateBlog, useUpdateBlog } from '@/hooks/use-blogs';
import { useCategories } from '@/hooks/use-categories';
import { cn } from '@/lib/utils';
import { BlogStatus, IBlog } from '@/types/blog';
import { blogSchema, BlogSchema } from '@/validators/blog.validator';
import dayjs from 'dayjs';
import { Calendar as CalendarIcon, Image as ImageIcon, Trash2 } from 'lucide-react';
import { MdAdd, MdEdit } from 'react-icons/md';
import { toast } from 'sonner';
import { IMedia, MediaType } from '@/types/media';
import { getMediaDisplayUrl } from '@/types/media';
import { useState } from 'react';
import Image from 'next/image';

interface BlogsActionDialogProps {
  mode?: 'create' | 'edit';
  blog?: IBlog;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BlogsActionDialog = ({
  mode = 'create',
  blog,
  open,
  onOpenChange,
}: BlogsActionDialogProps) => {
  const createBlogMutation = useCreateBlog();
  const updateBlogMutation = useUpdateBlog();
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  // Fetch all categories from API (for dropdown)
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories({
    page: 1,
    limit: 100,
  });

  // Track if slug was manually edited
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = React.useState(false);

  const defaultValues = React.useMemo(
    () => ({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      thumbnail: '',
      status: BlogStatus.DRAFT,
      publishedAt: new Date(),
      categoryId: '',
    }),
    [],
  );

  const form = useForm<BlogSchema>({
    resolver: yupResolver(blogSchema),
    defaultValues,
    mode: 'onChange',
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    reset,
    watch,
    setValue,
  } = form;

  // Watch title field for auto-slug generation
  const titleValue = watch('title');
  const statusValue = watch('status');

  // Auto-generate slug from title
  React.useEffect(() => {
    if (titleValue && !isSlugManuallyEdited) {
      const generatedSlug = slugify(titleValue, {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g,
      });
      setValue('slug', generatedSlug, { shouldValidate: true });
    }
  }, [titleValue, isSlugManuallyEdited, setValue]);

  // Reset slug manual edit state when dialog opens
  React.useEffect(() => {
    if (open) {
      setIsSlugManuallyEdited(mode === 'edit' && !!blog?.slug);
    }
  }, [open, mode, blog?.slug]);

  React.useEffect(() => {
    if (open && blog) {
      const formDefaults = {
        title: blog?.title || '',
        slug: blog?.slug || '',
        content: blog?.content || '',
        excerpt: blog?.excerpt || '',
        thumbnail: blog?.thumbnail || '',
        status: blog?.status || BlogStatus.DRAFT,
        publishedAt: blog?.publishedAt ? new Date(blog.publishedAt) : new Date(), // Default to current date if not set
        categoryId: blog?.category?.id || blog?.categoryIds?.[0] || '', // Use new structure or fallback to old
      };

      reset(formDefaults);
    }
  }, [open, blog, reset]);

  const onSubmit = async (data: BlogSchema) => {
    const blogData = {
      ...data,
      publishedAt: data.publishedAt.toISOString(), // Always include publishedAt since it's now required
      // Convert empty string to undefined for thumbnail
      thumbnail: data.thumbnail && data.thumbnail !== '' ? data.thumbnail : undefined,
    };

    if (mode === 'create') {
      await createBlogMutation.mutateAsync(blogData);
      toast.success('Blog created successfully!');
    } else if (blog) {
      await updateBlogMutation.mutateAsync({
        id: blog.id,
        ...blogData,
      });
      toast.success('Blog updated successfully!');
    }

    onOpenChange(false);
  };

  const handleCategoryChange = (categoryId: string) => {
    setValue('categoryId', categoryId, { shouldValidate: true });
  };

  const title = mode === 'create' ? 'Create Blog' : 'Edit Blog';
  const description =
    mode === 'create'
      ? 'Add a new blog post to the platform.'
      : 'Update blog post information and content.';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[90vh] flex-col p-0 sm:max-w-[1200px]">
        <DialogHeader className="shrink-0 border-b px-6 pt-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            {mode === 'create' ? <MdAdd className="h-5 w-5" /> : <MdEdit className="h-5 w-5" />}
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-6">
                {/* Basic Information Section */}
                <div className="space-y-4">
                  <h3 className="border-b pb-2 text-lg font-semibold text-gray-900">
                    Basic Information
                  </h3>

                  <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Title <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Blog title" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Slug <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="blog-slug"
                              onChange={(e) => {
                                field.onChange(e);
                                setIsSlugManuallyEdited(true);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Status <span className="text-red-500">*</span>
                          </FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={BlogStatus.DRAFT}>Draft</SelectItem>
                              <SelectItem value={BlogStatus.PUBLISHED}>Published</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Category Section */}
                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Category <span className="text-red-500">*</span>
                          </FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={(value) => {
                              field.onChange(value);
                              handleCategoryChange(value);
                            }}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categoriesLoading ? (
                                <SelectItem value="__loading__" disabled>
                                  Loading categories...
                                </SelectItem>
                              ) : categoriesData?.result?.length ? (
                                categoriesData.result.map((category) => (
                                  <SelectItem key={category.id} value={category.id}>
                                    {category.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="__no_categories__" disabled>
                                  No categories available
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Publishing Date - Required for both DRAFT and PUBLISHED */}
                  <FormField
                    control={form.control}
                    name="publishedAt"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>
                          {statusValue === BlogStatus.PUBLISHED
                            ? 'Published Date'
                            : 'Scheduled Publish Date'}{' '}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <Popover modal={true}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground',
                                )}
                              >
                                {field.value ? (
                                  dayjs(field.value).format('MMM D, YYYY')
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={field.value || undefined}
                              onSelect={(date) => {
                                if (date) {
                                  // If selecting a new date, keep current time or set to now
                                  const newDate = field.value
                                    ? new Date(
                                        date.getFullYear(),
                                        date.getMonth(),
                                        date.getDate(),
                                        field.value.getHours(),
                                        field.value.getMinutes(),
                                      )
                                    : new Date(
                                        date.getFullYear(),
                                        date.getMonth(),
                                        date.getDate(),
                                        new Date().getHours(),
                                        new Date().getMinutes(),
                                      );
                                  field.onChange(newDate);
                                } else {
                                  field.onChange(null);
                                }
                              }}
                              // Remove date restrictions to allow past and future dates
                              // This accommodates both published content and scheduled drafts
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <div className="text-muted-foreground text-xs">
                          {statusValue === BlogStatus.PUBLISHED
                            ? 'When this blog post was published'
                            : 'When this blog post should be published'}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                            placeholder="Brief description of the blog post"
                            className="min-h-[100px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Thumbnail Field */}
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
                              <div className="group border-border bg-muted/50 hover:border-primary/50 relative w-full max-w-md overflow-hidden rounded-lg border-2 transition-all">
                                <div className="relative aspect-video w-full">
                                  <Image
                                    src={field.value}
                                    alt="Thumbnail preview"
                                    fill
                                    className="object-cover transition-transform group-hover:scale-105"
                                  />
                                  {/* Overlay on hover */}
                                  <div className="absolute inset-0 bg-black/0 transition-all group-hover:bg-black/50" />
                                  {/* Action buttons - positioned at top right */}
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
                                      title="Change Thumbnail"
                                    >
                                      <ImageIcon className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        field.onChange('');
                                      }}
                                      className="text-destructive bg-white/95 shadow-md backdrop-blur-sm hover:bg-white"
                                      title="Remove Thumbnail"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div
                                onClick={() => setMediaPickerOpen(true)}
                                className="group border-muted-foreground/25 bg-muted/30 hover:border-primary/50 hover:bg-muted/50 relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-all"
                              >
                                <div className="flex flex-col items-center gap-4">
                                  <div className="bg-primary/10 group-hover:bg-primary/20 flex h-16 w-16 items-center justify-center rounded-full transition-all">
                                    <ImageIcon className="text-primary h-8 w-8" />
                                  </div>
                                  <div className="text-center">
                                    <p className="text-foreground text-sm font-medium">
                                      Select Thumbnail Image
                                    </p>
                                    <p className="text-muted-foreground mt-1 text-xs">
                                      Choose from your media library or upload a new image
                                    </p>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="default"
                                    size="sm"
                                    className="mt-2"
                                  >
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
                          <p className="text-muted-foreground text-xs">
                            Recommended: 16:9 aspect ratio, minimum 1200x675px
                          </p>
                        )}
                      </FormItem>
                    )}
                  />
                </div>

                {/* Content Field */}
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
            </div>

            {/* Fixed Footer */}
            <DialogFooter className="shrink-0 border-t px-6 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  isSubmitting || createBlogMutation.isPending || updateBlogMutation.isPending
                }
              >
                {isSubmitting || createBlogMutation.isPending || updateBlogMutation.isPending
                  ? 'Saving...'
                  : mode === 'create'
                    ? 'Create Blog'
                    : 'Update Blog'}
              </Button>
            </DialogFooter>
          </form>
        </Form>

        {/* Media Picker Dialog */}
        <MediaPickerDialog
          open={mediaPickerOpen}
          onOpenChange={setMediaPickerOpen}
          onSelect={(media: IMedia) => {
            const mediaUrl = getMediaDisplayUrl(media);
            if (mediaUrl) {
              form.setValue('thumbnail', mediaUrl, {
                shouldValidate: true,
              });
            }
          }}
          typeFilter={MediaType.IMAGE}
          title="Select Thumbnail Image"
          description="Choose an image from your media library or upload a new one"
        />
      </DialogContent>
    </Dialog>
  );
};

export default BlogsActionDialog;
