import type { IChapter } from '@/types/chapter';
import { ListResponse, BaseFilterParams } from './common';
import { LessonType } from './lesson';
import type { IMedia } from './media';

export enum CourseLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

export enum CourseStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

export enum CourseType {
  FREE = 'FREE',
  PAID = 'PAID',
}

export interface CourseQA {
  question: string;
  answer: string;
}

export interface CourseInfo {
  requirements: string[];
  benefits: string[];
  techniques: string[];
  documents: string[];
  qa: CourseQA[];
}

export interface IAuthor {
  id: string;
  firstName: string;
  lastName: string;
  username?: string;
  email?: string;
  avatar?: string;
}

export interface ICourse {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  image: IMedia | null;
  previewImages: IMedia[];
  description: string;
  introUrl: string;
  price: number;
  oldPrice: number;
  isFree: boolean;
  status: CourseStatus;
  authorId: string;
  categoryId: string;
  chapterIds: string[];
  view: number;
  sold: number;
  level: CourseLevel;
  info: CourseInfo;
  averageRating?: number;
  totalReviews?: number;
  totalDuration?: number;
  enrolledStudents?: number;
  author: IAuthor;
  category: {
    id: string;
    name: string;
  };
  chapters: IChapter[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IPublicCourse extends Omit<
  ICourse,
  'author' | 'category' | 'chapters' | 'info' | 'authorId' | 'categoryId' | 'chapterIds'
> {
  author: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
  category: {
    id: string;
    name: string;
    slug?: string;
  };
  chaptersCount?: number;
  lessonsCount?: number;
  totalLessons?: number;
  info?: {
    requirements?: string[];
    benefits?: string[];
    techniques?: string[];
    documents?: string[];
    qa?: CourseQA[];
  };
}

export interface CreateCourseRequest {
  title: string;
  slug: string;
  excerpt?: string;
  imageId?: string | null;
  previewImageIds?: string[];
  description?: string;
  introUrl?: string;
  price: number;
  oldPrice: number;
  isFree: boolean;
  status: CourseStatus;
  categoryId: string;
  level: CourseLevel;
  info: CourseInfo;
}

export type CourseLevelOption = {
  label: string;
  value: CourseLevel;
};

export interface UpdateCourseRequest extends Partial<CreateCourseRequest> {
  id: string;
}

export interface CoursesListParams extends BaseFilterParams {
  status?: string[];
  minPrice?: number;
  maxPrice?: number;
  level?: string[];
  categoryId?: string;
  minRating?: number;
  type?: string[];
}

export type CoursesListResponse = ListResponse<ICourse>;
export type PublicCoursesListResponse = ListResponse<IPublicCourse>;

export interface IEnrolledCourse {
  id: string;
  title: string;
  slug: string;
  image: string;
  description: string;
  level: CourseLevel;
  averageRating: number;
  totalReviews: number;
  totalLessons: number;
  completedLessons: number;
}
