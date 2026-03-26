export const CourseStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
} as const;

export type CourseStatusType = (typeof CourseStatus)[keyof typeof CourseStatus];

export const CourseLevel = {
  BEGINNER: 'BEGINNER',
  INTERMEDIATE: 'INTERMEDIATE',
  ADVANCED: 'ADVANCED',
} as const;

export type CourseLevelType = (typeof CourseLevel)[keyof typeof CourseLevel];

export const CourseType = {
  FREE: 'FREE',
  PAID: 'PAID',
} as const;

export type CourseTypeValue = (typeof CourseType)[keyof typeof CourseType];
