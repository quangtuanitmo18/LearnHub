'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { OPERATIONS, RESOURCES } from '@/configs/permission';
import { useParams, useRouter } from 'next/navigation';
import {
  useContest,
  useContestQuestions,
  useAddContestQuestion,
  useUpdateContestQuestion,
  useDeleteContestQuestion,
  useReorderContestQuestions,
} from '@/hooks/use-contests';
import {
  QuestionEditor,
  QuestionForm,
  createDefaultQuestion,
} from '@/components/admin/question-editor';
import { ContestQuestion, CreateContestQuestionRequest } from '@/types/contest';
import { QuestionType } from '@/types/quiz';
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
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
import {
  ArrowLeft,
  Clock,
  Pencil,
  Plus,
  Trash2,
  Trophy,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import dayjs from 'dayjs';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ContestAttemptsTable from './components/contest-attempts-table';

function mapContestQuestionToForm(q: ContestQuestion): QuestionForm {
  return {
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
  };
}

function mapFormToRequest(form: QuestionForm): CreateContestQuestionRequest {
  return {
    type: form.type,
    text: form.text,
    explanation: form.explanation,
    order: form.order,
    points: form.points,
    options: form.options.map((opt) => ({
      text: opt.text,
      order: opt.order,
      isCorrect: opt.isCorrect,
    })),
  };
}

export default function ContestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const contestId = params.id as string;

  const { data: contest, isLoading: contestLoading } = useContest(contestId);
  const { data: questions = [], isLoading: questionsLoading } = useContestQuestions(contestId);

  const addQuestionMutation = useAddContestQuestion(contestId);
  const updateQuestionMutation = useUpdateContestQuestion(contestId);
  const deleteQuestionMutation = useDeleteContestQuestion(contestId);
  const reorderMutation = useReorderContestQuestions(contestId);

  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);

  const handleAddQuestion = useCallback(() => {
    setEditingQuestionId(null);
    setIsAddingNew(true);
  }, []);

  const handleEditQuestion = useCallback((questionId: string) => {
    setIsAddingNew(false);
    setEditingQuestionId(questionId);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingQuestionId(null);
    setIsAddingNew(false);
  }, []);

  const handleSaveNewQuestion = useCallback(
    (form: QuestionForm) => {
      addQuestionMutation.mutate(mapFormToRequest(form), {
        onSuccess: () => setIsAddingNew(false),
      });
    },
    [addQuestionMutation],
  );

  const handleSaveExistingQuestion = useCallback(
    (form: QuestionForm) => {
      if (!form.id) return;
      updateQuestionMutation.mutate(
        { questionId: form.id, data: mapFormToRequest(form) },
        { onSuccess: () => setEditingQuestionId(null) },
      );
    },
    [updateQuestionMutation],
  );

  const handleDeleteClick = useCallback((questionId: string) => {
    setQuestionToDelete(questionId);
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!questionToDelete) return;
    deleteQuestionMutation.mutate(questionToDelete, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setQuestionToDelete(null);
        if (editingQuestionId === questionToDelete) setEditingQuestionId(null);
      },
    });
  }, [questionToDelete, deleteQuestionMutation, editingQuestionId]);

  const handleMoveQuestion = useCallback(
    (index: number, direction: 'up' | 'down') => {
      const newQuestions = [...questions];
      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      if (swapIndex < 0 || swapIndex >= newQuestions.length) return;
      [newQuestions[index], newQuestions[swapIndex]] = [
        newQuestions[swapIndex],
        newQuestions[index],
      ];
      reorderMutation.mutate(newQuestions.map((q) => q.id));
    },
    [questions, reorderMutation],
  );

  const isLoading = contestLoading || questionsLoading;
  const isMutating =
    addQuestionMutation.isPending ||
    updateQuestionMutation.isPending ||
    deleteQuestionMutation.isPending;

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  return (
    <ProtectedRoute resource={RESOURCES.CONTEST} action={OPERATIONS.READ}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/admin/contests')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            {contestLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96" />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <Trophy className="text-primary h-6 w-6" />
                  <h1 className="text-2xl font-bold">{contest?.title}</h1>
                  <Badge
                    variant={contest?.status === 'PUBLISHED' ? 'default' : 'secondary'}
                    className="capitalize"
                  >
                    {contest?.status?.toLowerCase()}
                  </Badge>
                </div>
                <div className="text-muted-foreground mt-1 flex items-center gap-4 text-sm">
                  {contest?.durationSec && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {Math.floor(contest.durationSec / 60)} min
                    </span>
                  )}
                  {contest?.startTime && (
                    <span>Start: {dayjs(contest.startTime).format('DD/MM/YYYY HH:mm')}</span>
                  )}
                  {contest?.endTime && (
                    <span>End: {dayjs(contest.endTime).format('DD/MM/YYYY HH:mm')}</span>
                  )}
                  <span>
                    {questions.length} question{questions.length !== 1 && 's'} · {totalPoints} pts
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        <Tabs defaultValue="questions" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="questions">Questions Manager</TabsTrigger>
            <TabsTrigger value="attempts">Participants & Attempts</TabsTrigger>
          </TabsList>

          <TabsContent value="questions">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Questions</h2>
                <Button onClick={handleAddQuestion} disabled={isAddingNew || isMutating}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Question
                </Button>
              </div>

              {/* Add New Question Editor */}
              {isAddingNew && (
                <QuestionEditor
                  question={createDefaultQuestion(questions.length + 1)}
                  onSave={handleSaveNewQuestion}
                  onCancel={handleCancelEdit}
                  title="Add New Question"
                />
              )}

              {/* Questions List */}
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24 w-full rounded-lg" />
                  ))}
                </div>
              ) : questions.length === 0 && !isAddingNew ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Trophy className="text-muted-foreground/40 mb-4 h-12 w-12" />
                    <p className="text-muted-foreground text-lg font-medium">No questions yet</p>
                    <p className="text-muted-foreground/60 mb-4 text-sm">
                      Add questions to build your contest
                    </p>
                    <Button onClick={handleAddQuestion}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add First Question
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {questions.map((question, index) =>
                    editingQuestionId === question.id ? (
                      <QuestionEditor
                        key={question.id}
                        question={mapContestQuestionToForm(question)}
                        onSave={handleSaveExistingQuestion}
                        onCancel={handleCancelEdit}
                        title={`Edit Question #${index + 1}`}
                      />
                    ) : (
                      <QuestionCard
                        key={question.id}
                        question={question}
                        index={index}
                        totalCount={questions.length}
                        onEdit={() => handleEditQuestion(question.id)}
                        onDelete={() => handleDeleteClick(question.id)}
                        onMoveUp={() => handleMoveQuestion(index, 'up')}
                        onMoveDown={() => handleMoveQuestion(index, 'down')}
                        disabled={isMutating}
                      />
                    ),
                  )}
                </div>
              )}
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Question</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this question? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleConfirmDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </TabsContent>
          <TabsContent value="attempts">
            <ContestAttemptsTable contestId={contestId} />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}

// ─── Question Card (Read-only) ──────────────────────────────

interface QuestionCardProps {
  question: ContestQuestion;
  index: number;
  totalCount: number;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  disabled?: boolean;
}

function QuestionCard({
  question,
  index,
  totalCount,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  disabled,
}: QuestionCardProps) {
  const correctOptions = question.options.filter((opt) => opt.isCorrect);
  const typeLabel =
    question.type === 'SINGLE_CHOICE'
      ? 'Single'
      : question.type === 'MULTIPLE_CHOICE'
        ? 'Multi'
        : 'T/F';

  return (
    <Card className="group transition-shadow hover:shadow-md">
      <CardContent className="flex items-start gap-3 p-4">
        {/* Reorder Controls */}
        <div className="flex flex-col items-center gap-0.5 pt-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onMoveUp}
            disabled={index === 0 || disabled}
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </Button>
          <span className="text-muted-foreground text-xs font-medium">{index + 1}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onMoveDown}
            disabled={index === totalCount - 1 || disabled}
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Question Content */}
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 font-medium">{question.text}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {typeLabel}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {question.points} pt{question.points !== 1 && 's'}
            </Badge>
            <span className="text-muted-foreground text-xs">
              Correct: {correctOptions.map((o) => o.text).join(', ')}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onEdit}
            disabled={disabled}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hover:text-destructive h-8 w-8"
            onClick={onDelete}
            disabled={disabled}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
