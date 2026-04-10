'use client';

import React, { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAttemptResult } from '@/hooks/use-quiz';

interface QuizAttemptDetailsDialogProps {
  open: boolean;
  attemptId: string | null;
  onOpenChange: (open: boolean) => void;
}

const QuizAttemptDetailsDialog = ({
  open,
  attemptId,
  onOpenChange,
}: QuizAttemptDetailsDialogProps) => {
  const { data: attemptResultData, isLoading: isAttemptResultLoading } = useAttemptResult(
    attemptId,
    { enabled: open && !!attemptId },
  );

  const answerRows = useMemo(() => {
    const answers = attemptResultData?.answers ?? [];
    return answers.map((a, idx) => {
      const selectedTexts = a.selectedOptionIds
        .map((id) => a.question.options.find((o) => o.id === id)?.text)
        .filter((t): t is string => !!t);

      const correctTexts = (a.question.options ?? []).filter((o) => o.isCorrect).map((o) => o.text);

      return {
        no: idx + 1,
        type: a.question.type,
        question: a.question.text,
        selected: selectedTexts.length > 0 ? selectedTexts.join(', ') : '-',
        correct: correctTexts.length > 0 ? correctTexts.join(', ') : '-',
        isCorrect: a.isCorrect,
      };
    });
  }, [attemptResultData]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[80vh] max-w-7xl! flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Quiz Attempt Details</DialogTitle>
          <DialogDescription>Review your answers and see the correct responses.</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto rounded-lg border border-gray-200">
          {isAttemptResultLoading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="text-sm text-gray-500">Loading details...</div>
            </div>
          ) : answerRows.length === 0 ? (
            <div className="flex h-32 items-center justify-center">
              <div className="text-sm text-gray-500">No detail data.</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="w-12">#</TableHead>
                  <TableHead className="w-40">Type</TableHead>
                  <TableHead>Question</TableHead>
                  <TableHead>Your Answer</TableHead>
                  <TableHead>Correct Answer</TableHead>
                  <TableHead className="w-28 text-center">Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {answerRows.map((row) => (
                  <TableRow key={row.no} className="hover:bg-gray-50/50">
                    <TableCell className="font-medium">{row.no}</TableCell>
                    <TableCell className="text-xs text-gray-700 sm:text-sm">{row.type}</TableCell>
                    <TableCell className="text-xs whitespace-normal text-gray-900 sm:text-sm">
                      {row.question}
                    </TableCell>
                    <TableCell
                      className={`text-xs whitespace-normal sm:text-sm ${
                        row.isCorrect ? 'text-green-700' : 'text-pink-700'
                      }`}
                    >
                      {row.selected}
                    </TableCell>
                    <TableCell className="text-xs whitespace-normal text-gray-900 sm:text-sm">
                      {attemptResultData?.passed ? (
                        row.correct
                      ) : (
                        <span className="text-gray-400 italic">Hidden until passed</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="secondary"
                        className={
                          row.isCorrect
                            ? 'bg-green-100 text-green-700'
                            : 'bg-pink-100 text-pink-700'
                        }
                      >
                        {row.isCorrect ? 'Correct' : 'Incorrect'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuizAttemptDetailsDialog;
