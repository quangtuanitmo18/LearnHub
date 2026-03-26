import { IsUUID } from 'class-validator';

export class ToggleUserLessonProgressDto {
  @IsUUID()
  lessonId: string;
}
