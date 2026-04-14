import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

// ============ ANSWER DTOs ============

export class AnswerDto {
  @IsUUID()
  @IsNotEmpty()
  questionId: string;

  @IsArray()
  @IsString({ each: true })
  selectedOptionIds: string[];
}

// ============ REQUEST DTOs ============

export class SaveAnswersDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  @ArrayMinSize(1)
  answers: AnswerDto[];

  strikes?: number;
}

export class SubmitAttemptDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[];

  strikes?: number;
}

// ============ RESPONSE DTOs ============

export class AttemptMetaResponseDto {
  attemptId: string;
  lessonId?: string;
  contestId?: string;
  attemptNo: number;
  status: string;
  startedAt: Date;
  expiresAt: Date | null;
}

export class QuestionOptionResponseDto {
  id: string;
  text: string;
  order: number;
}

export class QuestionOptionWithCorrectResponseDto extends QuestionOptionResponseDto {
  isCorrect: boolean;
}

export class QuestionResponseDto {
  id: string;
  type: string;
  text: string;
  order: number;
  points: number;
  options: QuestionOptionResponseDto[];
}

export class SavedAnswerResponseDto {
  questionId: string;
  selectedOptionIds: string[];
}

export class AttemptContentResponseDto {
  attemptId: string;
  lessonId?: string;
  contestId?: string;
  status: string;
  expiresAt: Date | null;
  questions: QuestionResponseDto[];
  savedAnswers: SavedAnswerResponseDto[];
}

export class SubmitResultResponseDto {
  attemptId: string;
  status: string;
  score: number;
  maxScore: number;
  passed: boolean | null;
  correctCount: number;
  totalCount: number;
  startedAt: Date;
  submittedAt: Date;
  isResultMasked?: boolean;
}

export class QuestionWithCorrectResponseDto {
  type: string;
  text: string;
  points: number;
  explanation?: string | null;
  options: QuestionOptionWithCorrectResponseDto[];
}

export class AnswerResultResponseDto {
  questionId: string;
  question: QuestionWithCorrectResponseDto;
  selectedOptionIds: string[];
  isCorrect: boolean;
  earnedScore: number;
}

export class AttemptResultResponseDto {
  attemptId: string;
  lessonId?: string;
  contestId?: string;
  attemptNo: number;
  status: string;
  score: number;
  maxScore: number;
  passed: boolean | null;
  correctCount?: number;
  totalCount?: number;
  startedAt?: Date;
  submittedAt?: Date | null;
  answers: AnswerResultResponseDto[];
  isResultMasked?: boolean;
}

export class AttemptSummaryResponseDto {
  attemptId: string;
  attemptNo: number;
  status: string;
  score: number | null;
  maxScore: number | null;
  passed: boolean | null;
  startedAt: Date;
  submittedAt: Date | null;
  isResultMasked?: boolean;
}

export class AttemptsListResponseDto {
  lessonId?: string;
  contestId?: string;
  maxAttempts: number | null;
  usedAttempts: number;
  attempts: AttemptSummaryResponseDto[];
}
