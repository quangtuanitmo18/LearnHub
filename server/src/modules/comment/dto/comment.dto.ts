import {
  IsString,
  IsOptional,
  IsUUID,
  MinLength,
  MaxLength,
  IsEnum,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';
import {
  ReactionType,
  type ReactionTypeType,
  CommentStatus,
  type CommentStatusType,
} from 'src/shared/constants/comment.constant';

export class CreateCommentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  content: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;
}

export class UpdateCommentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  content: string;
}

export class ReactCommentDto {
  @IsEnum(ReactionType)
  type: ReactionTypeType;
}

export class UpdateCommentStatusDto {
  @IsEnum(CommentStatus)
  status: CommentStatusType;
}

export class CommentQueryDto {
  @IsOptional()
  @IsEnum(CommentStatus)
  status?: CommentStatusType;

  @IsOptional()
  @IsUUID()
  lessonId?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;
}

export class BulkDeleteCommentDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  ids: string[];
}
