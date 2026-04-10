import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { BadgeCondition } from 'src/generated/prisma/client';
import { PERMISSIONS } from 'src/shared/configs/permission';
import { RequirePermissions } from 'src/shared/decorators/permission.decorator';
import { ResponseMessage } from 'src/shared/decorators/response-message.decorator';
import { GamificationService } from './gamification.service';

class CreateBadgeDto {
  name: string;
  description: string;
  imageUrl: string;
  conditionType: BadgeCondition;
  conditionValue: number;
}

class UpdateBadgeDto {
  name?: string;
  description?: string;
  imageUrl?: string;
  conditionType?: BadgeCondition;
  conditionValue?: number;
}

@Controller('admin/gamification')
export class AdminGamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get('badges')
  @RequirePermissions(PERMISSIONS.COURSE_READ)
  @ResponseMessage('All badges retrieved successfully')
  getAllBadges() {
    return this.gamificationService.getAllBadges();
  }

  @Post('badges')
  @RequirePermissions(PERMISSIONS.COURSE_CREATE)
  @ResponseMessage('Badge created successfully')
  async createBadge(@Body() dto: CreateBadgeDto) {
    return this.gamificationService.createBadge(dto);
  }

  @Put('badges/:id')
  @RequirePermissions(PERMISSIONS.COURSE_UPDATE)
  @ResponseMessage('Badge updated successfully')
  async updateBadge(@Param('id') id: string, @Body() dto: UpdateBadgeDto) {
    return this.gamificationService.updateBadge(id, dto);
  }

  @Delete('badges/:id')
  @RequirePermissions(PERMISSIONS.COURSE_DELETE)
  @ResponseMessage('Badge deleted successfully')
  async deleteBadge(@Param('id') id: string) {
    return this.gamificationService.deleteBadge(id);
  }
}
