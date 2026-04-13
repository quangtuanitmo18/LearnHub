import {
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { ResponseMessage } from 'src/shared/decorators/response-message.decorator';
import { PermissionGuard } from 'src/shared/guards/permission.guard';
import { ContestService } from './contest.service';
import { QuizAttemptService } from '../quiz-attempt/quiz-attempt.service';
import { Public } from 'src/shared/decorators/public.decorator';

@Controller('contests')
export class ContestController {
  constructor(
    private readonly contestService: ContestService,
    private readonly quizAttemptService: QuizAttemptService,
  ) {}

  @Get()
  @Public()
  @ResponseMessage('Contests retrieved successfully')
  async getPublicContests() {
    return this.contestService.getPublicContests();
  }

  @Get(':slug')
  @Public()
  @ResponseMessage('Contest detail retrieved successfully')
  async getContestDetail(@Param('slug') slug: string) {
    return this.contestService.getContestBySlug(slug);
  }

  @Get(':id/leaderboard')
  @Public()
  @ResponseMessage('Contest leaderboard retrieved successfully')
  async getContestLeaderboard(@Param('id') id: string) {
    return this.quizAttemptService.getLeaderboard(id, '', true);
  }

  @Post(':id/attempts/start')
  @UseGuards(PermissionGuard)
  @ResponseMessage('Contest attempt started successfully')
  async startOrResumeAttempt(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.quizAttemptService.startOrResumeAttempt(id, userId, true);
  }

  @Get(':id/attempts')
  @UseGuards(PermissionGuard)
  @ResponseMessage('Contest attempts retrieved successfully')
  async listAttempts(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.quizAttemptService.listAttempts(id, userId, true);
  }
}
