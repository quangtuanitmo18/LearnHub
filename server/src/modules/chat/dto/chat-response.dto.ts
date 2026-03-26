import { IsNotEmpty, IsString } from 'class-validator';

export class ChatCourseDto {
  id: string;
  title: string;
  price: number;
  oldPrice?: number;
  image?: string;
  level?: string;
  author?: string;
  view?: number;
  tags?: string[];
}

export class ChatReplyDto {
  response: string;
  courses: ChatCourseDto[];
  suggestions: string[];
  intent: string; // "course_search" | "order_status" | "small_talk" | "out_of_scope"
  timestamp: string; // ISO string
}

export class ChatMessageDto {
  @IsNotEmpty({ message: 'Message is required' })
  @IsString({ message: 'Message must be a string' })
  message: string;
}
