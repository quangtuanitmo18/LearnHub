import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { NoteService } from '@/services/notes';
import { INote } from '@/types/note';
import { toast } from 'sonner';

export const noteKeys = {
  all: ['notes'] as const,
  lists: () => [...noteKeys.all, 'list'] as const,
  list: (filters: string) => [...noteKeys.lists(), { filters }] as const,
  details: () => [...noteKeys.all, 'detail'] as const,
  detail: (id: string) => [...noteKeys.details(), id] as const,
  byLesson: (lessonId: string) => [...noteKeys.all, 'lesson', lessonId] as const,
};

export function useNotesByLesson(lessonId: string) {
  return useQuery({
    queryKey: noteKeys.byLesson(lessonId),
    queryFn: (): Promise<INote[]> => {
      if (!lessonId) return Promise.resolve([]);
      return NoteService.findAllByLesson(lessonId);
    },
    enabled: !!lessonId,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { lessonId: string; content: string; timestamp?: number }) =>
      NoteService.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: noteKeys.byLesson(variables.lessonId),
      });
      toast.success('Note added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add note');
    },
  });
}

export function useUpdateNote(lessonId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { content?: string; timestamp?: number } }) =>
      NoteService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: noteKeys.byLesson(lessonId),
      });
      toast.success('Note updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update note');
    },
  });
}

export function useDeleteNote(lessonId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => NoteService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: noteKeys.byLesson(lessonId),
      });
      toast.success('Note deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete note');
    },
  });
}
