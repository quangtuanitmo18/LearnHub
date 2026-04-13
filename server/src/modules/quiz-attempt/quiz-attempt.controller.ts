import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { ResponseMessage } from 'src/shared/decorators/response-message.decorator';
import { PermissionGuard } from 'src/shared/guards/permission.guard';
import { SaveAnswersDto, SubmitAttemptDto } from './dto/quiz-attempt.dto';
import { QuizAttemptService } from './quiz-attempt.service';

@Controller()
@UseGuards(PermissionGuard)
export class QuizAttemptController {
  constructor(private readonly quizAttemptService: QuizAttemptService) {}

  // ============ QUIZ-BASED ENDPOINTS ============

  /**
   * Get server time for frontend synchronization
   * GET /api/quizzes/server-time
   */
  @Get('quizzes/server-time')
  @ResponseMessage('Server time retrieved successfully')
  getServerTime() {
    return { serverTime: new Date().toISOString() };
  }

  /**
   * Start or resume a quiz attempt
   * POST /api/quizzes/:lessonId/attempts/start
   */
  @Post('quizzes/:lessonId/attempts/start')
  @ResponseMessage('Quiz attempt started successfully')
  async startOrResumeAttempt(
    @Param('lessonId') lessonId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.quizAttemptService.startOrResumeAttempt(lessonId, userId);
  }

  /**
   * List all attempts for a user on a quiz
   * GET /api/quizzes/:lessonId/attempts
   */
  @Get('quizzes/:lessonId/attempts')
  @ResponseMessage('Quiz attempts retrieved successfully')
  async listAttempts(
    @Param('lessonId') lessonId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.quizAttemptService.listAttempts(lessonId, userId);
  }

  // ============ ATTEMPT-BASED ENDPOINTS ============

  /**
   * Load attempt with quiz content for doing
   * GET /api/attempts/:attemptId
   */
  @Get('attempts/:attemptId')
  @ResponseMessage('Quiz attempt content retrieved successfully')
  async getAttemptContent(
    @Param('attemptId') attemptId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.quizAttemptService.getAttemptContent(attemptId, userId);
  }

  /**
   * Autosave answers
   * PUT /api/attempts/:attemptId/answers
   */
  @Put('attempts/:attemptId/answers')
  @ResponseMessage('Answers saved successfully')
  async saveAnswers(
    @Param('attemptId') attemptId: string,
    @CurrentUser('sub') userId: string,
    @Body() saveAnswersDto: SaveAnswersDto,
  ) {
    return this.quizAttemptService.saveAnswers(
      attemptId,
      userId,
      saveAnswersDto,
    );
  }

  /**
   * Submit attempt (grade + finalize)
   * POST /api/attempts/:attemptId/submit
   */
  @Post('attempts/:attemptId/submit')
  @ResponseMessage('Quiz attempt submitted successfully')
  async submitAttempt(
    @Param('attemptId') attemptId: string,
    @CurrentUser('sub') userId: string,
    @Body() submitAttemptDto: SubmitAttemptDto,
  ) {
    return this.quizAttemptService.submitAttempt(
      attemptId,
      userId,
      submitAttemptDto,
    );
  }

  /**
   * Get attempt result (review)
   * GET /api/attempts/:attemptId/result
   */
  @Get('attempts/:attemptId/result')
  @ResponseMessage('Quiz attempt result retrieved successfully')
  async getAttemptResult(
    @Param('attemptId') attemptId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.quizAttemptService.getAttemptResult(attemptId, userId);
  }
}
