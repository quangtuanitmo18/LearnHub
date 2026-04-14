'use client';

import { BackendImageUpload } from '@/components/ui/backend-image-upload';
import { Button } from '@/components/ui/button';
import { DateTimePicker } from '@/components/ui/date-time-picker';
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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { yupResolver } from '@hookform/resolvers/yup';
import * as React from 'react';
import { useForm } from 'react-hook-form';

import { useCreateContest, useUpdateContest } from '@/hooks/use-contests';
import { Contest, ContestStatus } from '@/types/contest';
import { contestSchema, ContestSchema } from '@/validators/contest.validator';
import { MdAdd, MdEdit } from 'react-icons/md';
import slugify from 'slugify';
import { toast } from 'sonner';

interface ContestsActionDialogProps {
  mode?: 'create' | 'edit';
  contest?: Contest;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ContestsActionDialog = ({
  mode = 'create',
  contest,
  open,
  onOpenChange,
}: ContestsActionDialogProps) => {
  const createContestMutation = useCreateContest();
  const updateContestMutation = useUpdateContest();

  const isLoading = createContestMutation.isPending || updateContestMutation.isPending;

  const form = useForm<ContestSchema>({
    resolver: yupResolver(contestSchema) as any,
    defaultValues: {
      title: '',
      slug: '',
      imageId: '',
      description: '',
      passScore: undefined,
      maxAttempts: undefined,
      durationSec: undefined,
      startTime: '',
      endTime: '',
      showResultDate: '',
      isMembership: false,
      status: ContestStatus.DRAFT,
    },
  });

  const generateSlug = (name: string): string => {
    return slugify(name, {
      lower: true,
      strict: true,
      remove: /[*+~.()'\"!:@]/g,
    });
  };

  const watchTitle = form.watch('title');
  React.useEffect(() => {
    if (watchTitle && mode === 'create') {
      const slug = generateSlug(watchTitle);
      form.setValue('slug', slug);
    }
  }, [watchTitle, mode, form]);

  // Helper to format datetime for input
  const formatDateTimeLocal = (dateStr?: string | null) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toISOString().slice(0, 16);
    } catch {
      return '';
    }
  };

  React.useEffect(() => {
    if (open) {
      form.reset({
        title: contest?.title || '',
        slug: contest?.slug || '',
        imageId: contest?.imageId || '',
        description: contest?.description || '',
        passScore: contest?.passScore ?? undefined,
        maxAttempts: contest?.maxAttempts ?? undefined,
        durationSec: contest?.durationSec ?? undefined,
        startTime: formatDateTimeLocal(contest?.startTime),
        endTime: formatDateTimeLocal(contest?.endTime),
        showResultDate: formatDateTimeLocal(contest?.showResultDate),
        isMembership: contest?.isMembership ?? false,
        status: contest?.status ?? ContestStatus.DRAFT,
      });
    }
  }, [open, contest, form]);

  const onSubmit = async (data: ContestSchema) => {
    const payload = {
      title: data.title,
      slug: data.slug,
      imageId: data.imageId || undefined,
      description: data.description || undefined,
      passScore: data.passScore ?? undefined,
      maxAttempts: data.maxAttempts ?? undefined,
      durationSec: data.durationSec ?? undefined,
      startTime: data.startTime ? new Date(data.startTime).toISOString() : undefined,
      endTime: data.endTime ? new Date(data.endTime).toISOString() : undefined,
      showResultDate: data.showResultDate ? new Date(data.showResultDate).toISOString() : undefined,
      isMembership: data.isMembership,
    };

    if (mode === 'create') {
      createContestMutation.mutate(payload, {
        onSuccess: () => {
          toast.success('Contest created successfully!');
          onOpenChange(false);
          form.reset();
        },
      });
    } else if (contest) {
      updateContestMutation.mutate(
        { id: contest.id, ...payload, status: data.status },
        {
          onSuccess: () => {
            toast.success('Contest updated successfully!');
            onOpenChange(false);
            form.reset();
          },
        },
      );
    }
  };

  const title = mode === 'create' ? 'Create Contest' : 'Edit Contest';
  const description =
    mode === 'create' ? 'Add a new contest or competition.' : 'Update the contest information.';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'create' ? <MdAdd className="h-5 w-5" /> : <MdEdit className="h-5 w-5" />}
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 items-start gap-4">
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
                      <Input placeholder="Enter contest title" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Slug */}
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Slug <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="contest-slug" {...field} disabled={isLoading} />
                    </FormControl>
                    <div className="text-muted-foreground mt-1 text-xs">
                      URL-friendly version of the title (lowercase, hyphens only)
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the contest..."
                        rows={3}
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Image Upload */}
              <FormField
                control={form.control}
                name="imageId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Image</FormLabel>
                    <FormControl>
                      <BackendImageUpload
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Score & Attempt settings */}
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="passScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pass Score (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="70"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(e.target.value ? Number(e.target.value) : undefined)
                          }
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxAttempts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Attempts</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="3"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(e.target.value ? Number(e.target.value) : undefined)
                          }
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="durationSec"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (sec)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="3600"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(e.target.value ? Number(e.target.value) : undefined)
                          }
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Time settings */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <DateTimePicker
                          value={field.value}
                          onChange={field.onChange}
                          disabled={isLoading}
                          placeholder="Pick start time"
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
                    <FormItem className="flex flex-col">
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <DateTimePicker
                          value={field.value}
                          onChange={field.onChange}
                          disabled={isLoading}
                          placeholder="Pick end time"
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
                    <FormItem className="flex flex-col">
                      <FormLabel>Show Result</FormLabel>
                      <FormControl>
                        <DateTimePicker
                          value={field.value}
                          onChange={field.onChange}
                          disabled={isLoading}
                          placeholder="Pick result date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Membership */}
              <FormField
                control={form.control}
                name="isMembership"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Membership Only</FormLabel>
                      <div className="text-muted-foreground text-sm">
                        Require active membership to participate
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Status (only in edit mode) */}
              {mode === 'edit' && (
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Published</FormLabel>
                        <div className="text-muted-foreground text-sm">
                          Make this contest available to participants
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value === ContestStatus.PUBLISHED}
                          onCheckedChange={(checked) => {
                            field.onChange(checked ? ContestStatus.PUBLISHED : ContestStatus.DRAFT);
                          }}
                          disabled={isLoading}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : mode === 'create' ? 'Create Contest' : 'Update Contest'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ContestsActionDialog;
