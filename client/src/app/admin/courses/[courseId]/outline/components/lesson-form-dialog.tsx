'use client';

import Editor from '@/components/tiptap/editor';
import Toolbar from '@/components/tiptap/toolbar';
import {
  QuestionEditor as SharedQuestionEditor,
  QuestionForm,
} from '@/components/admin/question-editor';
import { useCreateLesson, useLesson, useUpdateLesson } from '@/hooks/use-lessons';
import {
  BackendQuizQuestion,
  CreateLessonRequest,
  ILesson,
  LessonType,
  QuizQuestionForm,
  UpdateLessonRequest,
} from '@/types/lesson';
import { QuestionType } from '@/types/quiz';
import { yupResolver } from '@hookform/resolvers/yup';
import { format } from 'date-fns';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  MdAdd,
  MdDelete,
  MdDescription,
  MdEdit,
  MdHelpOutline,
  MdOutlineSlowMotionVideo,
} from 'react-icons/md';
import { toast } from 'sonner';
import * as yup from 'yup';

import { MediaPickerDialog } from '@/components/media/media-picker-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { SimpleTimePicker } from '@/components/ui/simple-time-picker';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { IMedia, MediaType, getHlsUrl, getMediaDisplayUrl } from '@/types/media';
import { secondsToTimeString, timeStringToSeconds } from '@/utils/format';
import { Film, Trash2 } from 'lucide-react';

interface LessonFormData {
  title: string;
  slug?: string;
  contentType: LessonType;
  published: boolean;
  description?: string | null;
  duration?: string; // Time string in HH:MM:SS format
  // Video specific
  videoUrl?: string;
  // Article specific
  articleContent?: string;
  // Quiz specific
  passScore?: number;
  maxAttempts?: number | null;
  isContest?: boolean;
  startTime?: string | null;
  endTime?: string | null;
  showResultDate?: string | null;
  // Quiz questions - managed separately from validation schema
  questions?: QuizQuestionForm[];
}

const lessonFormSchema: yup.ObjectSchema<LessonFormData> = yup.object({
  title: yup.string().required('Title is required').min(1, 'Title cannot be empty'),
  slug: yup.string().optional(),
  contentType: yup
    .mixed<LessonType>()
    .oneOf([LessonType.VIDEO, LessonType.ARTICLE, LessonType.QUIZ] as const)
    .required('Content type is required'),
  published: yup.boolean().default(false),
  description: yup.string().nullable().optional(),
  // General duration field for all lessons
  duration: yup
    .string()
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, 'Invalid time format'),
  // Video specific
  videoUrl: yup.string().when('contentType', {
    is: LessonType.VIDEO,
    then: (schema) => schema.url('Please enter a valid URL').required('Video URL is required'),
    otherwise: (schema) => schema.optional(),
  }),
  // Article specific
  articleContent: yup.string().when('contentType', {
    is: LessonType.ARTICLE,
    then: (schema) => schema.required('Article content is required'),
    otherwise: (schema) => schema.optional(),
  }),
  // Quiz specific
  passScore: yup.number().when('contentType', {
    is: LessonType.QUIZ,
    then: (schema) =>
      schema
        .min(1, 'Passing score must be at least 1%')
        .max(100, 'Passing score cannot exceed 100%')
        .required('Passing score is required'),
    otherwise: (schema) => schema.optional(),
  }),
  maxAttempts: yup
    .number()
    .nullable()
    .when('contentType', {
      is: LessonType.QUIZ,
      then: (schema) =>
        schema
          .min(1, 'Must allow at least 1 attempt')
          .max(10, 'Cannot exceed 10 attempts')
          .nullable(),
      otherwise: (schema) => schema.optional(),
    }),
  isContest: yup.boolean().default(false),
  startTime: yup
    .string()
    .nullable()
    .when('isContest', {
      is: true,
      then: (schema) => schema.required('Start time is required for contests'),
      otherwise: (schema) => schema.optional(),
    }),
  endTime: yup
    .string()
    .nullable()
    .when('isContest', {
      is: true,
      then: (schema) => schema.required('End time is required for contests'),
      otherwise: (schema) => schema.optional(),
    }),
  showResultDate: yup
    .string()
    .nullable()
    .when('isContest', {
      is: true,
      then: (schema) => schema.required('Show result date is required for contests'),
      otherwise: (schema) => schema.optional(),
    }),
  // Questions are managed separately, not validated here
  questions: yup.array().optional(),
});

interface LessonFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lessonId?: string;
  chapterId: string;
  courseId: string;
  onSuccess?: () => void;
}

const getContentTypeIcon = (type: LessonType) => {
  switch (type) {
    case LessonType.VIDEO:
      return <MdOutlineSlowMotionVideo className="h-4 w-4" />;
    case LessonType.ARTICLE:
      return <MdDescription className="h-4 w-4" />;
    case LessonType.QUIZ:
      return <MdHelpOutline className="h-4 w-4" />;
    default:
      return <MdDescription className="h-4 w-4" />;
  }
};

// Question Editor Component - delegates to shared component
interface QuestionEditorProps {
  question: QuizQuestionForm;
  onSave: (question: QuizQuestionForm) => void;
  onCancel: () => void;
}

function QuestionEditor({ question, onSave, onCancel }: QuestionEditorProps) {
  return (
    <SharedQuestionEditor
      question={question as QuestionForm}
      onSave={(q) => onSave(q as QuizQuestionForm)}
      onCancel={onCancel}
    />
  );
}

const LessonFormDialog = ({
  open,
  onOpenChange,
  lessonId,
  chapterId,
  courseId,
  onSuccess,
}: LessonFormDialogProps) => {
  const isEditing = !!lessonId;

  // Fetch lesson data when editing (include questions for quiz lessons)
  const { data: lesson, isLoading: isLessonLoading } = useLesson(lessonId || '', {
    includeQuestions: true,
  });

  // Quiz questions state (managed separately from form)
  const [questions, setQuestions] = useState<QuizQuestionForm[]>([]);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
  const [videoPickerOpen, setVideoPickerOpen] = useState(false);

  // Use mutations directly
  const createLessonMutation = useCreateLesson();
  const updateLessonMutation = useUpdateLesson();
  const isLoading =
    createLessonMutation.isPending || updateLessonMutation.isPending || isLessonLoading;

  const form = useForm<LessonFormData>({
    resolver: yupResolver(lessonFormSchema),
    defaultValues: {
      title: '',
      slug: '',
      contentType: LessonType.VIDEO,
      published: false,
      description: null,
      duration: '00:00:00',
      videoUrl: '',
      articleContent: '',
      passScore: 70,
      maxAttempts: null,
      isContest: false,
      startTime: null,
      endTime: null,
      showResultDate: null,
      questions: [],
    },
  });

  const {
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting },
  } = form;
  const selectedContentType = watch('contentType');

  // Helper function to convert backend lesson response to form data
  const mapBackendToFormData = (lessonData: ILesson) => {
    const baseFormData: LessonFormData = {
      title: lessonData.title,
      slug: lessonData.slug,
      contentType: lessonData.type,
      published: lessonData.published,
      description: lessonData.description,
      duration: secondsToTimeString(lessonData.durationSec || 0),
    };

    // Map content-specific fields
    if (lessonData.type === LessonType.VIDEO && lessonData.video) {
      baseFormData.videoUrl = lessonData.video.url;
    } else if (lessonData.type === LessonType.ARTICLE && lessonData.article) {
      baseFormData.articleContent = lessonData.article.content;
    } else if (lessonData.type === LessonType.QUIZ && lessonData.quiz) {
      baseFormData.passScore = lessonData.quiz.passScore;
      baseFormData.maxAttempts = lessonData.quiz.maxAttempts;
      baseFormData.isContest = lessonData.quiz.isContest;
      baseFormData.startTime = lessonData.quiz.startTime
        ? format(new Date(lessonData.quiz.startTime), "yyyy-MM-dd'T'HH:mm")
        : null;
      baseFormData.endTime = lessonData.quiz.endTime
        ? format(new Date(lessonData.quiz.endTime), "yyyy-MM-dd'T'HH:mm")
        : null;
      baseFormData.showResultDate = lessonData.quiz.showResultDate
        ? format(new Date(lessonData.quiz.showResultDate), "yyyy-MM-dd'T'HH:mm")
        : null;
    }

    return baseFormData;
  };

  // Helper function to convert backend quiz questions to form questions
  const mapBackendQuestionsToForm = (
    backendQuestions: BackendQuizQuestion[],
  ): QuizQuestionForm[] => {
    return backendQuestions.map((q) => ({
      id: q.id,
      text: q.text,
      explanation: q.explanation || undefined,
      type: q.type as QuestionType,
      order: q.order,
      points: q.points,
      options: q.options.map((opt) => ({
        id: opt.id,
        text: opt.text,
        order: opt.order,
        isCorrect: opt.isCorrect,
      })),
    }));
  };

  React.useEffect(() => {
    if (open) {
      if (isEditing && lesson && !isLessonLoading) {
        // Convert backend response to form data
        const backendLesson = lesson;
        const formData = mapBackendToFormData(backendLesson);
        reset(formData);

        // Load existing questions if quiz type
        if (backendLesson.type === LessonType.QUIZ && backendLesson.quiz) {
          const formQuestions = mapBackendQuestionsToForm(backendLesson.quiz.questions);
          setQuestions(formQuestions);
        } else {
          setQuestions([]);
        }
        setEditingQuestionIndex(null);
      } else if (!isEditing) {
        // Create mode
        reset({
          title: '',
          slug: '',
          contentType: LessonType.VIDEO,
          published: false,
          description: null,
          duration: '00:00:00',
          videoUrl: '',
          articleContent: '',
          passScore: 70,
          maxAttempts: null,
          questions: [],
        });
        // Reset questions state
        setQuestions([]);
        setEditingQuestionIndex(null);
      }
      // Don't reset if we're in editing mode but still loading lesson data
    }
  }, [open, isEditing, lesson, isLessonLoading, reset]);

  // Quiz questions management functions
  const addNewQuestion = () => {
    const newQuestion: QuizQuestionForm = {
      text: '',
      explanation: '',
      type: QuestionType.MULTIPLE_CHOICE,
      order: questions.length + 1,
      points: 1,
      options: Array.from({ length: 4 }, (_, i) => ({
        text: `Option ${String.fromCharCode(65 + i)}`,
        order: i + 1,
        isCorrect: i === 0, // First option is correct by default
      })),
    };
    setQuestions([...questions, newQuestion]);
    setEditingQuestionIndex(questions.length);
  };

  const editQuestion = (index: number) => {
    setEditingQuestionIndex(index);
  };

  const deleteQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
    if (editingQuestionIndex === index) {
      setEditingQuestionIndex(null);
    }
  };

  const updateQuestion = (index: number, updatedQuestion: QuizQuestionForm) => {
    const newQuestions = [...questions];
    newQuestions[index] = updatedQuestion;
    setQuestions(newQuestions);
  };

  const handleFormSubmit = (data: LessonFormData) => {
    // Convert duration from HH:MM:SS to seconds for backend
    const durationInSeconds = timeStringToSeconds(data.duration || '00:00:00');

    // Transform form data to new backend structure
    const requestData: CreateLessonRequest | UpdateLessonRequest = {
      courseId,
      chapterId,
      lesson: {
        type: data.contentType,
        title: data.title,
        slug: data.slug || undefined,
        description: data.description || null,
        published: data.published,
        ...(isEditing &&
          lesson && {
            order: lesson.order,
          }),
      },
      content: (() => {
        if (data.contentType === LessonType.VIDEO) {
          return {
            url: data.videoUrl!,
            durationSec: durationInSeconds,
          };
        } else if (data.contentType === LessonType.ARTICLE) {
          return {
            content: data.articleContent!,
            durationSec: durationInSeconds,
          };
        } else {
          // QUIZ
          return {
            durationSec: durationInSeconds,
            passScore: data.passScore!,
            maxAttempts: data.maxAttempts || null,
            isContest: data.isContest,
            startTime:
              data.isContest && data.startTime ? new Date(data.startTime).toISOString() : null,
            endTime: data.isContest && data.endTime ? new Date(data.endTime).toISOString() : null,
            showResultDate:
              data.isContest && data.showResultDate
                ? new Date(data.showResultDate).toISOString()
                : null,
            questions: questions.map((q) => ({
              ...(q.id && { id: q.id }),
              type: q.type,
              text: q.text,
              order: q.order,
              points: q.points,
              explanation: q.explanation || null,
              options: q.options.map((opt) => ({
                ...(opt.id && { id: opt.id }),
                text: opt.text,
                order: opt.order,
                isCorrect: opt.isCorrect,
              })),
            })),
          };
        }
      })(),
    };

    if (isEditing && lesson) {
      (requestData as UpdateLessonRequest).id = lesson.id!;

      updateLessonMutation.mutate(requestData as UpdateLessonRequest, {
        onSuccess: () => {
          toast.success('Lesson updated successfully!');
          onOpenChange(false);
          onSuccess?.();
        },
        onError: (error) => {
          console.error('Error updating lesson:', error);
          toast.error('Failed to update lesson');
        },
      });
    } else {
      createLessonMutation.mutate(requestData as CreateLessonRequest, {
        onSuccess: () => {
          toast.success('Lesson created successfully!');
          onOpenChange(false);
          onSuccess?.();
        },
        onError: (error) => {
          console.error('Error creating lesson:', error);
          toast.error('Failed to create lesson');
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditing ? (
              <>
                <MdEdit className="h-5 w-5" />
                Edit Lesson
              </>
            ) : (
              <>
                <MdAdd className="h-5 w-5" />
                Add New Lesson
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the lesson information below.'
              : 'Create a new lesson for this chapter.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="space-y-4">
              {/* Basic Information */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Title <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter lesson title"
                        disabled={isLoading || isSubmitting}
                      />
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
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="lesson-slug"
                        disabled={isLoading || isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="contentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Content Type <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isLoading || isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select content type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[LessonType.VIDEO, LessonType.ARTICLE, LessonType.QUIZ].map((type) => (
                            <SelectItem key={type} value={type}>
                              <div className="flex items-center gap-2">
                                {getContentTypeIcon(type)}
                                <span className="capitalize">{type}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Duration */}
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel>Duration</FormLabel>
                        <FormControl>
                          <SimpleTimePicker
                            value={field.value || '00:00:00'}
                            onChange={field.onChange}
                            disabled={isLoading || isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>

              {/* Resource Fields */}
              <div className="space-y-4">
                {/* Video specific fields */}
                {selectedContentType === LessonType.VIDEO && (
                  <FormField
                    control={form.control}
                    name="videoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">
                          Lesson Video <span className="text-red-500">*</span>
                        </FormLabel>
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
                                      disabled={isLoading || isSubmitting}
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
                                      disabled={isLoading || isSubmitting}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div
                                onClick={() =>
                                  !isLoading && !isSubmitting && setVideoPickerOpen(true)
                                }
                                className={`group border-muted-foreground/25 bg-muted/30 hover:border-primary/50 hover:bg-muted/50 relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-all ${
                                  isLoading || isSubmitting ? 'cursor-not-allowed opacity-50' : ''
                                }`}
                              >
                                <div className="flex flex-col items-center gap-3">
                                  <div className="bg-primary/10 group-hover:bg-primary/20 flex h-12 w-12 items-center justify-center rounded-full transition-all">
                                    <Film className="text-primary h-6 w-6" />
                                  </div>
                                  <div className="text-center">
                                    <p className="text-foreground text-sm font-medium">
                                      Select Lesson Video
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
                                    disabled={isLoading || isSubmitting}
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
                          <p className="text-muted-foreground text-xs">
                            Recommended: MP4 format, HLS supported
                          </p>
                        )}
                      </FormItem>
                    )}
                  />
                )}

                {/* Article specific fields */}
                {selectedContentType === LessonType.ARTICLE && (
                  <FormField
                    control={form.control}
                    name="articleContent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Article Content <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="overflow-hidden rounded-md border">
                            <Toolbar />
                            <Editor
                              content={field.value || ''}
                              onChange={(content) => field.onChange(content)}
                              className="min-h-[400px]"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Quiz specific fields */}
                {selectedContentType === LessonType.QUIZ && (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="maxAttempts"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Attempts</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min="1"
                              max="10"
                              disabled={isLoading || isSubmitting}
                              value={field.value ?? ''}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value === '' ? null : parseInt(e.target.value, 10),
                                )
                              }
                              placeholder="Leave empty for unlimited"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="passScore"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Passing Score (%) <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min="1"
                              max="100"
                              disabled={isLoading || isSubmitting}
                              onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {selectedContentType === LessonType.QUIZ && (
                  <div className="space-y-4 rounded-md border p-4">
                    <FormField
                      control={form.control}
                      name="isContest"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Make this Quiz a Contest</FormLabel>
                            <div className="text-muted-foreground text-sm">
                              Enable strict time limits and hide results until a specific date.
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isLoading || isSubmitting}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {form.watch('isContest') && (
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <FormField
                          control={form.control}
                          name="startTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Start Time <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="datetime-local"
                                  value={field.value || ''}
                                  disabled={isLoading || isSubmitting}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="endTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                End Time <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="datetime-local"
                                  value={field.value || ''}
                                  disabled={isLoading || isSubmitting}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="showResultDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Show Result Date <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="datetime-local"
                                  value={field.value || ''}
                                  disabled={isLoading || isSubmitting}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Description field (for all types) */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value || ''}
                          placeholder="Enter lesson description"
                          rows={3}
                          disabled={isLoading || isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Quiz Questions Section */}
                {selectedContentType === LessonType.QUIZ && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium">Questions ({questions.length})</h3>
                        <p className="text-sm text-gray-500">Add questions for your quiz</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addNewQuestion}
                        disabled={isLoading || isSubmitting}
                      >
                        <MdAdd className="mr-2 h-4 w-4" />
                        Add Question
                      </Button>
                    </div>

                    {questions.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-gray-300 py-8 text-center text-gray-500">
                        <p>No questions yet. Add your first question!</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {questions.map((question, index) => (
                          <Card key={question.id || `question-${index}`} className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="flex-1">
                                <div className="mb-2 flex items-center gap-2">
                                  <Badge variant="outline">Question {index + 1}</Badge>
                                  <Badge variant="secondary" className="capitalize">
                                    {question.type.replace('_', ' ')}
                                  </Badge>
                                  <Badge variant="outline">Order: {question.order}</Badge>
                                </div>
                                <p className="mb-2 line-clamp-2 font-medium text-gray-900">
                                  {question.text || 'No content yet'}
                                </p>
                                <div className="text-sm text-gray-600">
                                  {question.options.length} options,{' '}
                                  {question.options.filter((opt) => opt.isCorrect).length} correct
                                  answers
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => editQuestion(index)}
                                  disabled={isLoading || isSubmitting}
                                >
                                  <MdEdit className="h-3 w-3" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deleteQuestion(index)}
                                  disabled={isLoading || isSubmitting}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <MdDelete className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}

                    {/* Question Editor */}
                    {editingQuestionIndex !== null && (
                      <QuestionEditor
                        question={questions[editingQuestionIndex]}
                        onSave={(updatedQuestion: QuizQuestionForm) => {
                          updateQuestion(editingQuestionIndex, updatedQuestion);
                          setEditingQuestionIndex(null);
                        }}
                        onCancel={() => setEditingQuestionIndex(null)}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Settings */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="published"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Published</FormLabel>
                        <div className="text-sm text-gray-600">
                          Make this lesson visible to students
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading || isSubmitting}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading || isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || isSubmitting}>
                {isLoading || isSubmitting
                  ? 'Saving...'
                  : isEditing
                    ? 'Update Lesson'
                    : 'Create Lesson'}
              </Button>
            </DialogFooter>
          </form>
        </Form>

        {/* Media Picker Dialog for Video */}
        <MediaPickerDialog
          open={videoPickerOpen}
          onOpenChange={setVideoPickerOpen}
          onSelect={(media: IMedia) => {
            // Use HLS URL if available, otherwise use display URL
            const videoUrl = getHlsUrl(media) || getMediaDisplayUrl(media);
            if (videoUrl) {
              form.setValue('videoUrl', videoUrl, {
                shouldValidate: true,
              });
            }
          }}
          typeFilter={MediaType.VIDEO}
          title="Select Lesson Video"
          description="Choose a video from your media library or upload a new one"
        />
      </DialogContent>
    </Dialog>
  );
};

export default LessonFormDialog;
