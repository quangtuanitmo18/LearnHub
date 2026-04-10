'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import slugify from 'slugify';
import { useImmer } from 'use-immer';

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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { CourseInfo, CourseLevel, CourseStatus, ICourse } from '@/types/course';

import Editor from '@/components/tiptap/editor';
import Toolbar from '@/components/tiptap/toolbar';
import { MediaPickerDialog } from '@/components/media/media-picker-dialog';
import { useCategories } from '@/hooks/use-categories';
import { useCreateCourse, useUpdateCourse } from '@/hooks/use-courses';
import { CourseSchema, courseFormSchema } from '@/validators/course.validator';
import { MdAdd } from 'react-icons/md';
import { NumericFormat } from 'react-number-format';
import { toast } from 'sonner';
import { Image as ImageIcon, Trash2, Film } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { IMedia, MediaType } from '@/types/media';
import { getMediaDisplayUrl } from '@/types/media';

export const createEmptyCourseInfo = (): CourseInfo => ({
  requirements: [],
  benefits: [],
  techniques: [],
  documents: [],
  qa: [],
});

// Simplified course validation schema for forms (without info field)

interface CoursesActionDialogProps {
  mode?: 'create' | 'edit';
  course?: ICourse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CoursesActionDialog = ({
  mode = 'create',
  course,
  open,
  onOpenChange,
}: CoursesActionDialogProps) => {
  const createCourseMutation = useCreateCourse();
  const updateCourseMutation = useUpdateCourse();
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [videoPickerOpen, setVideoPickerOpen] = useState(false);
  const [previewImagesPickerOpen, setPreviewImagesPickerOpen] = useState(false);

  // Store selected media objects temporarily for display (when creating new or changing image)
  const [selectedImageMedia, setSelectedImageMedia] = useState<IMedia | null>(null);
  const [selectedPreviewMedia, setSelectedPreviewMedia] = useState<IMedia[]>([]);

  // Fetch all categories from API (for dropdown)
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories({
    page: 1,
    limit: 100,
  });

  const defaultValues = React.useMemo(
    () => ({
      title: '',
      slug: '',
      excerpt: '',
      description: '',
      imageId: null as string | null,
      previewImageIds: [] as string[],
      introUrl: '',
      price: 0,
      oldPrice: 0,
      isFree: false,
      status: CourseStatus.DRAFT,
      categoryId: '',
      level: CourseLevel.BEGINNER,
    }),
    [],
  );

  // Separate state for course info using useImmer
  const [courseInfo, setCourseInfo] = useImmer<CourseInfo>(
    () => course?.info || createEmptyCourseInfo(),
  );

  // Track if slug was manually edited
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = React.useState(false);

  const form = useForm<CourseSchema>({
    resolver: yupResolver(courseFormSchema),
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

  // Watch form values for image IDs (used for form submission)
  const imageId = watch('imageId');
  const previewImageIds = watch('previewImageIds') || [];

  // Watch title field for auto-slug generation
  const titleValue = watch('title');
  const isFreeValue = watch('isFree');

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

  // Handle free course toggle - reset prices when course is marked as free
  React.useEffect(() => {
    if (isFreeValue) {
      setValue('price', 0, { shouldValidate: true });
      setValue('oldPrice', 0, { shouldValidate: true });
    }
  }, [isFreeValue, setValue]);

  // Reset slug manual edit state when dialog opens
  React.useEffect(() => {
    if (open) {
      setIsSlugManuallyEdited(mode === 'edit' && !!course?.slug);
    }
  }, [open, mode, course?.slug]);

  // Track if this is the first time dialog opens to avoid resetting selected media
  const isFirstOpen = React.useRef(true);

  React.useEffect(() => {
    if (open) {
      // Only reset selected media on first open, not when user has already selected new images
      if (isFirstOpen.current) {
        setSelectedImageMedia(course?.image || null);
        setSelectedPreviewMedia(course?.previewImages || []);
        isFirstOpen.current = false;
      }

      const formDefaults = {
        title: course?.title || '',
        slug: course?.slug || '',
        excerpt: course?.excerpt || '',
        description: course?.description || '',
        imageId: course?.image?.id || null,
        previewImageIds: course?.previewImages?.map((img) => img.id) || [],
        introUrl: course?.introUrl || '',
        price: course?.price || 0,
        oldPrice: course?.oldPrice || 0,
        isFree: course?.isFree || false,
        status: course?.status || CourseStatus.DRAFT,
        categoryId: course?.category?.id || '',
        level: course?.level || CourseLevel.BEGINNER,
      };

      reset(formDefaults);
      setCourseInfo(course?.info || createEmptyCourseInfo());
    } else {
      // Reset flag and selected media when dialog closes completely
      isFirstOpen.current = true;
      setSelectedImageMedia(null);
      setSelectedPreviewMedia([]);
    }
  }, [open, course, reset, setCourseInfo]);

  const onSubmit = async (data: CourseSchema) => {
    const courseData = {
      ...data,
      info: courseInfo,
    };

    if (mode === 'create') {
      await createCourseMutation.mutateAsync(courseData);
      toast.success('Course created successfully!');
    } else if (course) {
      await updateCourseMutation.mutateAsync({
        id: course.id,
        ...courseData,
      });
      toast.success('Course updated successfully!');
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[90vh] flex-col p-0 sm:max-w-[900px]">
        <DialogHeader className="shrink-0 border-b px-6 pt-6 pb-2">
          <DialogTitle>{mode === 'create' ? 'Create New Course' : 'Edit Course'}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Add a new course to the platform.'
              : 'Update course information and settings.'}
          </DialogDescription>
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
                            <Input {...field} placeholder="Course title" />
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
                              placeholder="course-slug"
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
                              <SelectItem value={CourseStatus.DRAFT}>Draft</SelectItem>
                              <SelectItem value={CourseStatus.PUBLISHED}>Published</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
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
                                <SelectValue placeholder="Select category" />
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

                    <FormField
                      control={form.control}
                      name="level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Level <span className="text-red-500">*</span>
                          </FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.values(CourseLevel).map((level) => (
                                <SelectItem key={level} value={level}>
                                  {level}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Excerpt Field */}
                  <FormField
                    control={form.control}
                    name="excerpt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Excerpt{' '}
                          <span className="text-xs font-normal text-gray-500">
                            (Short summary, max 300 characters)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <textarea
                            {...field}
                            placeholder="Brief course summary for preview cards and listings..."
                            className="min-h-20 w-full resize-y rounded-md border border-gray-300 px-3 py-2 text-sm"
                            maxLength={300}
                          />
                        </FormControl>
                        <div className="flex items-center justify-between">
                          <FormMessage />
                          <span className="text-xs text-gray-500">
                            {field.value?.length || 0}/300
                          </span>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Image and Video Fields - Side by Side */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* Course Image Field */}
                  <FormField
                    control={form.control}
                    name="imageId"
                    render={({ field }) => {
                      // Priority: selectedImageMedia (newly selected) > course?.image (existing)
                      // This ensures UI updates immediately when user selects a new image
                      const displayImage = selectedImageMedia || course?.image;
                      const imageUrl = displayImage ? getMediaDisplayUrl(displayImage) : null;

                      return (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">Course Image</FormLabel>
                          <FormControl>
                            <div className="space-y-3">
                              {displayImage && imageUrl ? (
                                <div className="group border-border bg-muted/50 hover:border-primary/50 relative w-full overflow-hidden rounded-lg border-2 transition-all">
                                  <div className="relative aspect-video w-full">
                                    <Image
                                      src={imageUrl}
                                      alt="Course image preview"
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
                                        title="Change Image"
                                      >
                                        <ImageIcon className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          field.onChange(null);
                                          // Clear selected image media
                                          setSelectedImageMedia(null);
                                        }}
                                        className="text-destructive bg-white/95 shadow-md backdrop-blur-sm hover:bg-white"
                                        title="Remove Image"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div
                                  onClick={() => setMediaPickerOpen(true)}
                                  className="group border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50 relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-all"
                                >
                                  <div className="flex flex-col items-center gap-3">
                                    <div className="bg-primary/10 group-hover:bg-primary/20 flex h-12 w-12 items-center justify-center rounded-full transition-all">
                                      <ImageIcon className="text-primary h-6 w-6" />
                                    </div>
                                    <div className="text-center">
                                      <p className="text-foreground text-sm font-medium">
                                        Select Course Image
                                      </p>
                                      <p className="text-muted-foreground mt-1 text-xs">
                                        Choose from media library
                                      </p>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="default"
                                      size="sm"
                                      className="mt-1"
                                    >
                                      <ImageIcon className="mr-2 h-4 w-4" />
                                      Browse
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                          {!field.value && (
                            <p className="text-muted-foreground text-xs">
                              Recommended: 16:9 aspect ratio
                            </p>
                          )}
                        </FormItem>
                      );
                    }}
                  />

                  {/* Intro Video Field */}
                  <FormField
                    control={form.control}
                    name="introUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Intro Video</FormLabel>
                        <FormControl>
                          <div className="space-y-3">
                            {field.value ? (
                              <div className="group border-border bg-muted/50 hover:border-primary/50 relative w-full overflow-hidden rounded-lg border-2 transition-all">
                                <div className="relative aspect-video w-full">
                                  {/* Video thumbnail preview */}
                                  <div className="relative h-full w-full bg-black">
                                    <video
                                      src={field.value}
                                      className="h-full w-full object-cover"
                                      preload="metadata"
                                      muted
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                      <Film className="h-12 w-12 text-white drop-shadow-lg" />
                                    </div>
                                  </div>
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
                                        setVideoPickerOpen(true);
                                      }}
                                      className="bg-white/95 text-gray-900 shadow-md backdrop-blur-sm hover:bg-white"
                                      title="Change Video"
                                    >
                                      <Film className="h-4 w-4" />
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
                                      title="Remove Video"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div
                                onClick={() => setVideoPickerOpen(true)}
                                className="group border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50 relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-all"
                              >
                                <div className="flex flex-col items-center gap-3">
                                  <div className="bg-primary/10 group-hover:bg-primary/20 flex h-12 w-12 items-center justify-center rounded-full transition-all">
                                    <Film className="text-primary h-6 w-6" />
                                  </div>
                                  <div className="text-center">
                                    <p className="text-foreground text-sm font-medium">
                                      Select Intro Video
                                    </p>
                                    <p className="text-muted-foreground mt-1 text-xs">
                                      Choose from media library
                                    </p>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="default"
                                    size="sm"
                                    className="mt-1"
                                  >
                                    <Film className="mr-2 h-4 w-4" />
                                    Browse
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                        {!field.value && (
                          <p className="text-muted-foreground text-xs">Recommended: MP4 format</p>
                        )}
                      </FormItem>
                    )}
                  />
                </div>

                {/* Preview Images Field */}
                <FormField
                  control={form.control}
                  name="previewImageIds"
                  render={({ field }) => {
                    // Priority: selectedPreviewMedia (newly selected) > course?.previewImages (existing)
                    // This ensures UI updates immediately when user selects new preview images
                    const displayImages =
                      selectedPreviewMedia.length > 0
                        ? selectedPreviewMedia
                        : course?.previewImages || [];
                    const displayItems = displayImages.map((img, idx) => ({
                      id: img.id,
                      url: getMediaDisplayUrl(img),
                      index: idx,
                    }));

                    return (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Preview Images</FormLabel>
                        <FormControl>
                          <div className="space-y-4">
                            {/* Image Grid */}
                            {displayItems && displayItems.length > 0 && (
                              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                                {displayItems.map((item) => {
                                  if (!item.url) return null;
                                  return (
                                    <div
                                      key={item.id}
                                      className="group border-border bg-muted/50 hover:border-primary/50 relative aspect-video overflow-hidden rounded-lg border-2 transition-all"
                                    >
                                      <Image
                                        src={item.url}
                                        alt={`Preview ${item.index + 1}`}
                                        fill
                                        className="object-cover transition-transform group-hover:scale-105"
                                      />
                                      <div className="absolute inset-0 bg-black/0 transition-all group-hover:bg-black/50" />
                                      <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => {
                                          const newIds = field.value.filter((id) => id !== item.id);
                                          field.onChange(newIds);
                                          // Update selected preview media
                                          setSelectedPreviewMedia((prev) =>
                                            prev.filter((img) => img.id !== item.id),
                                          );
                                        }}
                                        className="text-destructive absolute top-2 right-2 bg-white/95 opacity-0 shadow-md backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-white"
                                        title="Remove Image"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Add Image Button */}
                            <div
                              onClick={() => setPreviewImagesPickerOpen(true)}
                              className="group border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50 relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-all"
                            >
                              <div className="flex flex-col items-center gap-3">
                                <div className="bg-primary/10 group-hover:bg-primary/20 flex h-10 w-10 items-center justify-center rounded-full transition-all">
                                  <ImageIcon className="text-primary h-5 w-5" />
                                </div>
                                <div className="text-center">
                                  <p className="text-foreground text-sm font-medium">
                                    {field.value && field.value.length > 0
                                      ? 'Add More Preview Images'
                                      : 'Add Preview Images'}
                                  </p>
                                  <p className="text-muted-foreground mt-1 text-xs">
                                    Select images from media library
                                  </p>
                                </div>
                                <Button type="button" variant="default" size="sm" className="mt-1">
                                  <ImageIcon className="mr-2 h-4 w-4" />
                                  Browse
                                </Button>
                              </div>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                        {field.value && field.value.length > 0 && (
                          <p className="text-muted-foreground text-xs">
                            {field.value.length} image
                            {field.value.length !== 1 ? 's' : ''} selected
                            {field.value.length >= 10 ? ' (maximum reached)' : ` (max 10)`}
                          </p>
                        )}
                      </FormItem>
                    );
                  }}
                />

                {/* Description Field */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <div className="overflow-hidden rounded-md border">
                            <Toolbar />
                            <Editor
                              content={field.value}
                              onChange={(content) => field.onChange(content)}
                              className="min-h-[200px]"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Pricing Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="text-lg font-semibold text-gray-900">Pricing</h3>
                    <div className="flex items-center space-x-6">
                      <FormField
                        control={form.control}
                        name="isFree"
                        render={({ field }) => (
                          <FormItem className="m-0 flex items-center space-x-2">
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel className="m-0 text-sm font-medium">Free Course</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field: { onChange, onBlur, name, value, ref } }) => (
                        <FormItem>
                          <FormLabel>
                            Price {!form.watch('isFree') && <span className="text-red-500">*</span>}
                          </FormLabel>
                          <FormControl>
                            <NumericFormat
                              name={name}
                              value={value}
                              onBlur={onBlur}
                              getInputRef={ref}
                              customInput={Input}
                              thousandSeparator=","
                              decimalSeparator="."
                              prefix="$"
                              allowNegative={false}
                              placeholder="$0"
                              disabled={form.watch('isFree')}
                              onValueChange={(values) => onChange(values.floatValue)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="oldPrice"
                      render={({ field: { onChange, onBlur, name, value, ref } }) => (
                        <FormItem>
                          <FormLabel>Old Price </FormLabel>
                          <FormControl>
                            <NumericFormat
                              name={name}
                              value={value}
                              onBlur={onBlur}
                              getInputRef={ref}
                              customInput={Input}
                              thousandSeparator=","
                              decimalSeparator="."
                              prefix="$"
                              allowNegative={false}
                              placeholder="$0"
                              disabled={form.watch('isFree')}
                              onValueChange={(values) => onChange(values.floatValue)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                {/* Course Details Section */}
                <div className="space-y-4">
                  <h3 className="border-b pb-2 text-lg font-semibold text-gray-900">
                    Course Details
                  </h3>

                  {/* Requirements and Benefits */}
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Requirements */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-gray-700">Requirements</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 border-dashed p-0 hover:border-solid"
                          onClick={() =>
                            setCourseInfo((draft) => {
                              draft.requirements.push('');
                            })
                          }
                        >
                          <MdAdd className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {courseInfo.requirements.map((requirement, index) => (
                          <div key={index} className="flex w-full gap-2">
                            <Input
                              value={requirement}
                              onChange={(e) =>
                                setCourseInfo((draft) => {
                                  draft.requirements[index] = e.target.value;
                                })
                              }
                              placeholder={`Requirement ${index + 1}`}
                              className="text-sm"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-700"
                              onClick={() =>
                                setCourseInfo((draft) => {
                                  draft.requirements.splice(index, 1);
                                })
                              }
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                        {courseInfo.requirements.length === 0 && (
                          <p className="py-4 text-center text-sm text-gray-500 italic">
                            No requirements added yet
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Benefits */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-gray-700">Benefits</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 border-dashed p-0 hover:border-solid"
                          onClick={() =>
                            setCourseInfo((draft) => {
                              draft.benefits.push('');
                            })
                          }
                        >
                          <MdAdd className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {courseInfo.benefits.map((benefit, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={benefit}
                              onChange={(e) =>
                                setCourseInfo((draft) => {
                                  draft.benefits[index] = e.target.value;
                                })
                              }
                              placeholder={`Benefit ${index + 1}`}
                              className="flex-1 text-sm"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-700"
                              onClick={() =>
                                setCourseInfo((draft) => {
                                  draft.benefits.splice(index, 1);
                                })
                              }
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                        {courseInfo.benefits.length === 0 && (
                          <p className="py-4 text-center text-sm text-gray-500 italic">
                            No benefits added yet
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Techniques and Documents */}
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Techniques */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-gray-700">Techniques</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 border-dashed p-0 hover:border-solid"
                          onClick={() =>
                            setCourseInfo((draft) => {
                              draft.techniques.push('');
                            })
                          }
                        >
                          <MdAdd className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {courseInfo.techniques.map((technique, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={technique}
                              onChange={(e) =>
                                setCourseInfo((draft) => {
                                  draft.techniques[index] = e.target.value;
                                })
                              }
                              placeholder={`Technique ${index + 1}`}
                              className="flex-1 text-sm"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-700"
                              onClick={() =>
                                setCourseInfo((draft) => {
                                  draft.techniques.splice(index, 1);
                                })
                              }
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                        {courseInfo.techniques.length === 0 && (
                          <p className="py-4 text-center text-sm text-gray-500 italic">
                            No techniques added yet
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Documents */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-gray-700">Documents</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 border-dashed p-0 hover:border-solid"
                          onClick={() =>
                            setCourseInfo((draft) => {
                              draft.documents.push('');
                            })
                          }
                        >
                          <MdAdd className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {courseInfo.documents.map((document, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={typeof document === string ? document : (document?.title || ")}
                              onChange={(e) =>
                                setCourseInfo((draft) => {
                                  draft.documents[index] = e.target.value;
                                })
                              }
                              placeholder={`Document ${index + 1}`}
                              className="flex-1 text-sm"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-700"
                              onClick={() =>
                                setCourseInfo((draft) => {
                                  draft.documents.splice(index, 1);
                                })
                              }
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                        {courseInfo.documents.length === 0 && (
                          <p className="py-4 text-center text-sm text-gray-500 italic">
                            No documents added yet
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Q&A Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-9 border-dashed px-3 hover:border-solid"
                      onClick={() =>
                        setCourseInfo((draft) => {
                          draft.qa.push({ question: '', answer: '' });
                        })
                      }
                    >
                      <MdAdd className="mr-2 h-4 w-4" />
                      Add Q&A
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {courseInfo.qa.map((qaItem, index) => (
                      <div key={index} className="space-y-3 rounded-lg border bg-gray-50/50 p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">
                            Q&A #{index + 1}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-700"
                            onClick={() =>
                              setCourseInfo((draft) => {
                                draft.qa.splice(index, 1);
                              })
                            }
                          >
                            ×
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          <div className="space-y-1">
                            <Label className="text-xs text-gray-500">Question</Label>
                            <Input
                              value={qaItem.question}
                              onChange={(e) =>
                                setCourseInfo((draft) => {
                                  draft.qa[index].question = e.target.value;
                                })
                              }
                              placeholder="Enter question"
                              className="text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-gray-500">Answer</Label>
                            <Input
                              value={qaItem.answer}
                              onChange={(e) =>
                                setCourseInfo((draft) => {
                                  draft.qa[index].answer = e.target.value;
                                })
                              }
                              placeholder="Enter answer"
                              className="text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {courseInfo.qa.length === 0 && (
                      <div className="rounded-lg border-2 border-dashed border-gray-200 py-8 text-center">
                        <p className="text-sm text-gray-500">No Q&A items added yet</p>
                        <p className="mt-1 text-xs text-gray-400">
                          Click &ldquo;Add Q&A&rdquo; to get started
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Fixed Footer */}
            <DialogFooter className="shrink-0 border-t px-6 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  // Reset selected media when canceling
                  setSelectedImageMedia(course?.image || null);
                  setSelectedPreviewMedia(course?.previewImages || []);
                  onOpenChange(false);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  isSubmitting || createCourseMutation.isPending || updateCourseMutation.isPending
                }
              >
                {isSubmitting || createCourseMutation.isPending || updateCourseMutation.isPending
                  ? 'Saving...'
                  : mode === 'create'
                    ? 'Create Course'
                    : 'Update Course'}
              </Button>
            </DialogFooter>
          </form>
        </Form>

        {/* Media Picker Dialog for Image */}
        <MediaPickerDialog
          open={mediaPickerOpen}
          onOpenChange={(open) => {
            setMediaPickerOpen(open);
            // When dialog closes, don't reset selectedImageMedia
            // It should persist until form is reset or dialog is closed completely
          }}
          onSelect={(media: IMedia) => {
            form.setValue('imageId', media.id, {
              shouldValidate: true,
            });
            // Store media object for immediate display - this will override course?.image
            setSelectedImageMedia(media);
          }}
          selectedMediaId={imageId || undefined}
          typeFilter={MediaType.IMAGE}
          title="Select Course Image"
          description="Choose an image from your media library or upload a new one"
        />

        {/* Media Picker Dialog for Video */}
        <MediaPickerDialog
          open={videoPickerOpen}
          onOpenChange={setVideoPickerOpen}
          onSelect={(media: IMedia) => {
            // Use display URL (baseUrl + storageKey)
            const videoUrl = getMediaDisplayUrl(media);
            if (videoUrl) {
              form.setValue('introUrl', videoUrl, {
                shouldValidate: true,
              });
            }
          }}
          typeFilter={MediaType.VIDEO}
          title="Select Intro Video"
          description="Choose a video from your media library or upload a new one"
        />

        {/* Media Picker Dialog for Preview Images */}
        <MediaPickerDialog
          open={previewImagesPickerOpen}
          onOpenChange={setPreviewImagesPickerOpen}
          onMultiSelect={(mediaItems: IMedia[]) => {
            // Update form with media IDs
            const mediaIds = mediaItems.map((media) => media.id);
            form.setValue('previewImageIds', mediaIds, {
              shouldValidate: true,
            });
            // Store media objects for immediate display
            setSelectedPreviewMedia(mediaItems);

            if (mediaIds.length >= 10) {
              toast.info('Maximum 10 preview images reached');
            }
          }}
          selectedMediaIds={previewImageIds}
          typeFilter={MediaType.IMAGE}
          title="Select Preview Images"
          description="Choose multiple images from your media library or upload new ones"
          multiSelect={true}
          maxSelection={10}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CoursesActionDialog;
