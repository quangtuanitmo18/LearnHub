'use client';

import { useState } from 'react';
import { useNotesByLesson, useCreateNote, useDeleteNote, useUpdateNote } from '@/hooks/use-notes';
import { useVideoPlayer } from '../context/video-player-context';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trash2, Edit2, PlayCircle, Pause, Loader2, Clock, StickyNote } from 'lucide-react';
import { secondsToDisplayTime } from '@/utils/format';

interface LessonNotesProps {
  lessonId: string;
  courseId: string;
}

export function LessonNotes({ lessonId, courseId }: LessonNotesProps) {
  const { data: notes, isLoading } = useNotesByLesson(lessonId);
  const createNote = useCreateNote();
  const updateNote = useUpdateNote(lessonId);
  const deleteNote = useDeleteNote(lessonId);

  const { currentTime, isPlaying, seekTo, pause, play, hasPlayer } = useVideoPlayer();

  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);

  // Auto-pause when user starts typing
  const handleFocusTextarea = () => {
    if (hasPlayer && isPlaying) {
      pause();
    }
  };

  const handleCreateNote = () => {
    if (!newNoteContent.trim() || !lessonId) return;

    createNote.mutate(
      {
        lessonId,
        content: newNoteContent,
        timestamp: hasPlayer ? Math.floor(currentTime) : 0,
      },
      {
        onSuccess: () => {
          setNewNoteContent('');
          // Resume video after saving
          if (hasPlayer) {
            play();
          }
        },
      },
    );
  };

  // Click timestamp to seek video
  const handleSeekTo = (seconds: number) => {
    if (hasPlayer) {
      seekTo(seconds);
      play();
    }
  };

  const handleUpdateNote = (id: string) => {
    if (!editContent.trim()) return;
    updateNote.mutate(
      { id, data: { content: editContent } },
      { onSuccess: () => setEditingNoteId(null) },
    );
  };

  // Keyboard shortcut: Ctrl+Enter to save
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleCreateNote();
    }
  };

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Create Note Section */}
      <div className="space-y-3 border-b border-gray-100 bg-gray-50/50 p-4">
        {/* Timestamp indicator */}
        {hasPlayer && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="h-3.5 w-3.5" />
            <span>
              Timestamp at{' '}
              <span className="rounded bg-blue-100 px-1.5 py-0.5 font-mono font-semibold text-blue-700">
                {secondsToDisplayTime(currentTime)}
              </span>
            </span>
            {isPlaying && (
              <button
                onClick={pause}
                className="ml-auto flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-orange-700 transition-colors hover:bg-orange-200"
              >
                <Pause className="h-3 w-3" />
                Pause
              </button>
            )}
          </div>
        )}

        <Textarea
          placeholder={
            hasPlayer
              ? 'Take a note at this moment... (Ctrl+Enter to save)'
              : 'Add a note for this lesson... (Ctrl+Enter to save)'
          }
          value={newNoteContent}
          onChange={(e) => setNewNoteContent(e.target.value)}
          onFocus={handleFocusTextarea}
          onKeyDown={handleKeyDown}
          className="h-20 resize-none text-sm focus-visible:ring-blue-500"
        />
        <div className="flex items-center justify-end">
          <Button
            size="sm"
            onClick={handleCreateNote}
            disabled={!newNoteContent.trim() || createNote.isPending || !lessonId}
            className="gap-1.5"
          >
            {createNote.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <StickyNote className="h-3.5 w-3.5" />
            )}
            Save Note
          </Button>
        </div>
      </div>

      {/* Notes List */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
          </div>
        ) : !notes || notes.length === 0 ? (
          <div className="py-12 text-center">
            <StickyNote className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <p className="text-sm font-medium text-gray-500">No notes yet</p>
            <p className="mt-1 text-xs text-gray-400">
              {hasPlayer
                ? 'Pause the video and take your first note!'
                : 'Add your first note for this lesson.'}
            </p>
          </div>
        ) : (
          notes
            .sort((a, b) => a.timestamp - b.timestamp)
            .map((note) => (
              <div
                key={note.id}
                className="group flex flex-col gap-2 rounded-lg border border-gray-100 bg-white p-3 transition-all hover:border-blue-200 hover:shadow-sm"
              >
                <div className="flex items-start justify-between">
                  {/* Timestamp badge (clickable to seek) */}
                  {note.timestamp > 0 && hasPlayer ? (
                    <button
                      onClick={() => handleSeekTo(note.timestamp)}
                      className="flex items-center gap-1.5 rounded bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-100 hover:text-blue-800"
                      title="Click to jump to this timestamp"
                    >
                      <PlayCircle className="h-3.5 w-3.5" />
                      {secondsToDisplayTime(note.timestamp)}
                    </button>
                  ) : note.timestamp > 0 ? (
                    <span className="flex items-center gap-1.5 rounded bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-500">
                      <Clock className="h-3.5 w-3.5" />
                      {secondsToDisplayTime(note.timestamp)}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">
                      {new Date(note.createdAt).toLocaleString()}
                    </span>
                  )}

                  {/* Edit/Delete actions */}
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      className="rounded p-1 text-gray-400 hover:text-blue-600"
                      onClick={() => {
                        setEditingNoteId(note.id);
                        setEditContent(note.content);
                      }}
                      title="Edit note"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      className="rounded p-1 text-gray-400 hover:text-red-600"
                      onClick={() => setDeletingNoteId(note.id)}
                      title="Delete note"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Note content or edit form */}
                {editingNoteId === note.id ? (
                  <div className="mt-1 space-y-2">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-[60px] resize-none text-sm"
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setEditingNoteId(null)}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={() => handleUpdateNote(note.id)}>
                        Update
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-700">
                    {note.content}
                  </p>
                )}
              </div>
            ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={!!deletingNoteId} onOpenChange={() => setDeletingNoteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this note? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (deletingNoteId) {
                  deleteNote.mutate(deletingNoteId);
                  setDeletingNoteId(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
