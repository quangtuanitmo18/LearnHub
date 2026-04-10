import { Controller, Get, Query } from '@nestjs/common';
import { Public } from 'src/shared/decorators/public.decorator';
import { ResponseMessage } from 'src/shared/decorators/response-message.decorator';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { GamificationService } from './gamification.service';

@Controller('gamification')
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get('leaderboard')
  @Public()
  @ResponseMessage('Leaderboard retrieved successfully')
  async getLeaderboard(@Query('limit') limit: string) {
    const fetchLimit = limit ? parseInt(limit, 10) : 100;
    return this.gamificationService.getLeaderboard(fetchLimit);
  }

  @Get('me')
  @ResponseMessage('User gamification profile retrieved successfully')
  async getMyProfile(@CurrentUser('sub') userId: string) {
    return this.gamificationService.getUserProfile(userId);
  }
}
