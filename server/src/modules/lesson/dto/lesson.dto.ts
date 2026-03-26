import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Min,
  IsArray,
  ValidateNested,
  IsNotEmpty,
  ArrayMinSize,
  ValidateIf,
} from 'class-validator';
import {
  LessonType,
  QuestionType,
  type LessonTypeValue,
  type QuestionTypeValue,
} from 'src/shared/constants/lesson.constant';

// ============ BASE LESSON DTO ============

export class BaseLessonDto {
  @IsEnum(LessonType)
  type: LessonTypeValue;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? parseInt(value, 10) : value,
  )
  @IsNumber()
  @Min(0)
  order?: number;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}

// ============ CONTENT DTOs ============

// Article Content
export class ArticleContentDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? parseInt(value, 10) : value,
  )
  @IsNumber()
  @Min(1)
  durationSec?: number;
}

// Video Content
export class VideoContentDto {
  @IsUrl()
  @IsNotEmpty()
  url: string;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? parseInt(value, 10) : value,
  )
  @IsNumber()
  @Min(1)
  durationSec?: number;
}

// Quiz Option
export class QuizOptionDto {
  @IsOptional()
  @IsString()
  id?: string; // For updates - existing option ID

  @IsString()
  @IsNotEmpty()
  text: string;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? parseInt(value, 10) : value,
  )
  @IsNumber()
  @Min(0)
  order?: number;

  @IsBoolean()
  isCorrect: boolean;
}

// Quiz Question
export class QuizQuestionDto {
  @IsOptional()
  @IsString()
  id?: string; // For updates - existing question ID

  @IsEnum(QuestionType)
  type: QuestionTypeValue;

  @IsString()
  @IsNotEmpty()
  text: string;

  @IsOptional()
  @IsString()
  explanation?: string;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? parseInt(value, 10) : value,
  )
  @IsNumber()
  @Min(0)
  order?: number;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? parseInt(value, 10) : value,
  )
  @IsNumber()
  @Min(1)
  points?: number; // Points awarded for correct answer

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizOptionDto)
  @ArrayMinSize(2)
  options: QuizOptionDto[];
}

// Quiz Content
export class QuizContentDto {
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? parseInt(value, 10) : value,
  )
  @IsNumber()
  @Min(1)
  durationSec?: number;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? parseInt(value, 10) : value,
  )
  @IsNumber()
  @Min(0)
  passScore?: number;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? parseInt(value, 10) : value,
  )
  @IsNumber()
  @Min(1)
  maxAttempts?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizQuestionDto)
  @ArrayMinSize(1)
  questions: QuizQuestionDto[];
}

// ============ CREATE LESSON DTOs ============

export class CreateLessonDto {
  @ValidateNested()
  @Type(() => BaseLessonDto)
  lesson: BaseLessonDto;

  // Content is validated based on lesson.type
  @ValidateNested()
  @ValidateIf((o) => o.lesson?.type === LessonType.ARTICLE)
  @Type(() => ArticleContentDto)
  content: ArticleContentDto | VideoContentDto | QuizContentDto;

  @IsUUID()
  courseId: string;

  @IsUUID()
  chapterId: string;
}

// Type-specific create DTOs for internal use
export class CreateArticleLessonDto {
  @ValidateNested()
  @Type(() => BaseLessonDto)
  lesson: BaseLessonDto;

  @ValidateNested()
  @Type(() => ArticleContentDto)
  content: ArticleContentDto;

  @IsUUID()
  courseId: string;

  @IsUUID()
  chapterId: string;
}

export class CreateVideoLessonDto {
  @ValidateNested()
  @Type(() => BaseLessonDto)
  lesson: BaseLessonDto;

  @ValidateNested()
  @Type(() => VideoContentDto)
  content: VideoContentDto;

  @IsUUID()
  courseId: string;

  @IsUUID()
  chapterId: string;
}

export class CreateQuizLessonDto {
  @ValidateNested()
  @Type(() => BaseLessonDto)
  lesson: BaseLessonDto;

  @ValidateNested()
  @Type(() => QuizContentDto)
  content: QuizContentDto;

  @IsUUID()
  courseId: string;

  @IsUUID()
  chapterId: string;
}

// ============ UPDATE LESSON DTOs ============

export class UpdateBaseLessonDto {
  @IsOptional()
  @IsEnum(LessonType)
  type?: LessonTypeValue;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? parseInt(value, 10) : value,
  )
  @IsNumber()
  @Min(0)
  order?: number;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}

export class UpdateArticleContentDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  content?: string;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? parseInt(value, 10) : value,
  )
  @IsNumber()
  @Min(1)
  durationSec?: number;
}

export class UpdateVideoContentDto {
  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? parseInt(value, 10) : value,
  )
  @IsNumber()
  @Min(1)
  durationSec?: number;
}

export class UpdateQuizContentDto {
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? parseInt(value, 10) : value,
  )
  @IsNumber()
  @Min(1)
  durationSec?: number;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? parseInt(value, 10) : value,
  )
  @IsNumber()
  @Min(0)
  passScore?: number;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? parseInt(value, 10) : value,
  )
  @IsNumber()
  @Min(1)
  maxAttempts?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizQuestionDto)
  questions?: QuizQuestionDto[];
}

export class UpdateLessonDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateBaseLessonDto)
  lesson?: UpdateBaseLessonDto;

  @IsOptional()
  content?:
    | UpdateArticleContentDto
    | UpdateVideoContentDto
    | UpdateQuizContentDto;

  @IsOptional()
  @IsUUID()
  courseId?: string;

  @IsOptional()
  @IsUUID()
  chapterId?: string;
}

// ============ REORDER DTOs ============

export class ReorderLessonItemDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsNumber()
  @Min(0)
  order: number;
}

export class ReorderLessonsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderLessonItemDto)
  lessons: ReorderLessonItemDto[];
}

// ============ RESPONSE DTOs ============

export class QuizCreationResponseDto {
  lessonId: string;
}

export class LessonResponseDto {
  id: string;
  type: LessonTypeValue;
  title: string;
  description?: string;
  slug?: string;
  order: number;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  article?: {
    content: string;
    durationSec?: number;
  };
  video?: {
    url: string;
    durationSec?: number;
  };
  quiz?: {
    durationSec?: number;
    passScore?: number;
    maxAttempts?: number;
    questions?: Array<{
      id: string;
      type: QuestionTypeValue;
      text: string;
      explanation?: string;
      order: number;
      points: number;
      options: Array<{
        id: string;
        text: string;
        order: number;
        isCorrect: boolean;
      }>;
    }>;
  };
  course?: {
    id: string;
    title: string;
    slug: string;
  };
  chapter?: {
    id: string;
    title: string;
    order: number;
  };
}
