'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { QuestionType } from '@/types/quiz';
import { useState } from 'react';
import { MdAdd, MdDelete } from 'react-icons/md';

export interface QuestionOptionForm {
  id?: string;
  text: string;
  order: number;
  isCorrect: boolean;
}

export interface QuestionForm {
  id?: string;
  text: string;
  explanation?: string;
  type: QuestionType;
  order: number;
  points: number;
  options: QuestionOptionForm[];
}

interface QuestionEditorProps {
  question: QuestionForm;
  onSave: (question: QuestionForm) => void;
  onCancel: () => void;
  title?: string;
}

export function createDefaultQuestion(order: number): QuestionForm {
  return {
    text: '',
    explanation: '',
    type: QuestionType.SINGLE_CHOICE,
    order,
    points: 1,
    options: Array.from({ length: 4 }, (_, i) => ({
      text: `Option ${String.fromCharCode(65 + i)}`,
      order: i + 1,
      isCorrect: i === 0,
    })),
  };
}

export function QuestionEditor({
  question,
  onSave,
  onCancel,
  title = 'Edit Question',
}: QuestionEditorProps) {
  const [editForm, setEditForm] = useState<QuestionForm>({ ...question });

  const updateOption = (optionIndex: number, value: string) => {
    const newOptions = [...editForm.options];
    newOptions[optionIndex] = { ...newOptions[optionIndex], text: value };
    setEditForm({ ...editForm, options: newOptions });
  };

  const toggleCorrectAnswer = (optionIndex: number, isChecked: boolean) => {
    const newOptions = [...editForm.options];

    if (editForm.type === QuestionType.SINGLE_CHOICE || editForm.type === QuestionType.TRUE_FALSE) {
      newOptions.forEach((opt, idx) => {
        newOptions[idx] = { ...opt, isCorrect: idx === optionIndex && isChecked };
      });
    } else {
      newOptions[optionIndex] = { ...newOptions[optionIndex], isCorrect: isChecked };
    }

    setEditForm({ ...editForm, options: newOptions });
  };

  const addOption = () => {
    if (editForm.options.length < 6) {
      setEditForm({
        ...editForm,
        options: [
          ...editForm.options,
          { text: '', order: editForm.options.length + 1, isCorrect: false },
        ],
      });
    }
  };

  const removeOption = (optionIndex: number) => {
    if (editForm.options.length > 2) {
      const newOptions = editForm.options
        .filter((_, i) => i !== optionIndex)
        .map((opt, idx) => ({ ...opt, order: idx + 1 }));
      setEditForm({ ...editForm, options: newOptions });
    }
  };

  const handleTypeChange = (value: QuestionType) => {
    const newEditForm = { ...editForm, type: value };

    if (value === QuestionType.TRUE_FALSE) {
      newEditForm.options = [
        { text: 'True', order: 1, isCorrect: true },
        { text: 'False', order: 2, isCorrect: false },
      ];
    } else if (editForm.type === QuestionType.TRUE_FALSE) {
      newEditForm.options = Array.from({ length: 4 }, (_, i) => ({
        text: `Option ${String.fromCharCode(65 + i)}`,
        order: i + 1,
        isCorrect: i === 0,
      }));
    } else if (value === QuestionType.SINGLE_CHOICE) {
      const firstCorrectIndex = newEditForm.options.findIndex((opt) => opt.isCorrect);
      newEditForm.options = newEditForm.options.map((opt, idx) => ({
        ...opt,
        isCorrect: idx === (firstCorrectIndex >= 0 ? firstCorrectIndex : 0),
      }));
    }

    setEditForm(newEditForm);
  };

  const handleSave = () => {
    if (!editForm.text.trim()) return;
    const hasCorrect = editForm.options.some((opt) => opt.isCorrect);
    if (!hasCorrect) return;
    onSave(editForm);
  };

  const isValid = editForm.text.trim() && editForm.options.some((opt) => opt.isCorrect);

  return (
    <Card className="border-2 shadow-sm">
      <CardContent className="p-6">
        <div className="mb-4 border-b pb-3">
          <h4 className="text-xl font-semibold">{title}</h4>
        </div>

        <div className="space-y-4">
          {/* Question Text */}
          <div className="space-y-2">
            <Label htmlFor="question-text" className="text-sm font-medium">
              Question Text <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="question-text"
              value={editForm.text}
              onChange={(e) => setEditForm({ ...editForm, text: e.target.value })}
              placeholder="Enter your question"
              rows={3}
            />
          </div>

          {/* Question Type, Points, Order */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Question Type</Label>
              <Select value={editForm.type} onValueChange={handleTypeChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={QuestionType.SINGLE_CHOICE}>Single Choice</SelectItem>
                  <SelectItem value={QuestionType.MULTIPLE_CHOICE}>Multiple Choice</SelectItem>
                  <SelectItem value={QuestionType.TRUE_FALSE}>True/False</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="points" className="text-sm font-medium">
                Points
              </Label>
              <Input
                id="points"
                type="number"
                min="1"
                value={editForm.points}
                onChange={(e) =>
                  setEditForm({ ...editForm, points: parseInt(e.target.value, 10) || 1 })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="order" className="text-sm font-medium">
                Order
              </Label>
              <Input
                id="order"
                type="number"
                min="1"
                value={editForm.order}
                onChange={(e) =>
                  setEditForm({ ...editForm, order: parseInt(e.target.value, 10) || 1 })
                }
              />
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Options <span className="text-red-500">*</span>
            </Label>
            <p className="text-muted-foreground text-xs">
              {editForm.type === QuestionType.MULTIPLE_CHOICE
                ? 'Check all correct answers'
                : 'Select the correct answer'}
            </p>

            {editForm.type === QuestionType.MULTIPLE_CHOICE ? (
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {editForm.options.map((option, optionIndex) => {
                  const optionKey = option.id || `opt-${optionIndex}`;
                  return (
                    <div key={optionKey} className="flex items-center gap-2 rounded-md border p-2">
                      <Checkbox
                        checked={option.isCorrect}
                        onCheckedChange={(checked) =>
                          toggleCorrectAnswer(optionIndex, checked as boolean)
                        }
                      />
                      <div className="flex-1">
                        <Input
                          value={option.text}
                          onChange={(e) => updateOption(optionIndex, e.target.value)}
                          placeholder={`Option ${optionIndex + 1}`}
                        />
                      </div>
                      {editForm.options.length > 2 && editForm.type !== QuestionType.TRUE_FALSE && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeOption(optionIndex)}
                          className="text-red-600"
                        >
                          <MdDelete className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <RadioGroup
                value={String(editForm.options.findIndex((opt) => opt.isCorrect))}
                onValueChange={(value: string) => {
                  const selectedIndex = parseInt(value, 10);
                  const newOptions = editForm.options.map((opt, idx) => ({
                    ...opt,
                    isCorrect: idx === selectedIndex,
                  }));
                  setEditForm({ ...editForm, options: newOptions });
                }}
                className="grid grid-cols-1 gap-2 md:grid-cols-2"
              >
                {editForm.options.map((option, optionIndex) => {
                  const optionKey = option.id || `opt-${optionIndex}`;
                  return (
                    <div key={optionKey} className="flex items-center gap-2 rounded-md border p-2">
                      <RadioGroupItem value={String(optionIndex)} />
                      <div className="flex-1">
                        <Input
                          value={option.text}
                          onChange={(e) => updateOption(optionIndex, e.target.value)}
                          placeholder={`Option ${optionIndex + 1}`}
                        />
                      </div>
                      {editForm.options.length > 2 && editForm.type !== QuestionType.TRUE_FALSE && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeOption(optionIndex)}
                          className="text-red-600"
                        >
                          <MdDelete className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </RadioGroup>
            )}

            {editForm.options.length < 6 && editForm.type !== QuestionType.TRUE_FALSE && (
              <Button type="button" variant="outline" size="sm" onClick={addOption}>
                <MdAdd className="mr-2 h-3 w-3" />
                Add Option
              </Button>
            )}
          </div>

          {/* Explanation */}
          <div className="space-y-2">
            <Label htmlFor="explanation" className="text-sm font-medium">
              Explanation
            </Label>
            <Textarea
              id="explanation"
              value={editForm.explanation || ''}
              onChange={(e) =>
                setEditForm({ ...editForm, explanation: e.target.value || undefined })
              }
              placeholder="Explain the correct answer (shown after submission)"
              rows={2}
            />
          </div>

          <div className="flex gap-3 border-t pt-3">
            <Button type="button" onClick={handleSave} disabled={!isValid}>
              Save Question
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
