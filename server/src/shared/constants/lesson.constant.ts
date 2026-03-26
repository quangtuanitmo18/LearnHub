export const LessonType = {
  VIDEO: 'VIDEO',
  ARTICLE: 'ARTICLE',
  QUIZ: 'QUIZ',
} as const;

export type LessonTypeValue = (typeof LessonType)[keyof typeof LessonType];

export const QuestionType = {
  MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
  SINGLE_CHOICE: 'SINGLE_CHOICE',
  TRUE_FALSE: 'TRUE_FALSE',
} as const;

export type QuestionTypeValue =
  (typeof QuestionType)[keyof typeof QuestionType];

// Legacy alias for backward compatibility during migration
export const LessonContentType = LessonType;
export type LessonContentTypeValue = LessonTypeValue;
