import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
import {
  CurrentUser,
  JwtPayload,
} from 'src/shared/decorators/current-user.decorator';
import { ResponseMessage } from 'src/shared/decorators/response-message.decorator';
import { ChatService } from './chat.service';
import { ChatMessageDto, ChatReplyDto } from './dto/chat-response.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * Send a message to the chatbot
   * POST /chat/message
   */
  @Post('message')
  @ResponseMessage('Message processed successfully')
  async message(
    @CurrentUser() user: JwtPayload,
    @Body() body: ChatMessageDto,
  ): Promise<ChatReplyDto> {
    const { message } = body;

    return this.chatService.handleUserMessage(user.sub, message);
  }

  /**
   * Get chat history for the current user
   * GET /chat/history
   */
  @Get('history')
  @ResponseMessage('Chat history retrieved successfully')
  getHistory(@CurrentUser() user: JwtPayload) {
    const messages = this.chatService.getHistory(user.sub);

    return {
      messages,
      count: messages.length,
    };
  }

  /**
   * Clear chat history for the current user
   * DELETE /chat/history
   */
  @Delete('history')
  @ResponseMessage('Chat history cleared successfully')
  clearHistory(@CurrentUser() user: JwtPayload) {
    this.chatService.clearHistory(user.sub);

    return { success: true };
  }
}
