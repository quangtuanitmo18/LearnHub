import { IsInt, IsNotEmpty, IsString, IsUUID, Min } from 'class-validator';

export class CreateNoteDto {
  @IsUUID()
  @IsNotEmpty()
  lessonId: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsInt()
  @Min(0)
  timestamp: number;
}

