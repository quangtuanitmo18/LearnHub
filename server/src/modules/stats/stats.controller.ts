import { Controller, Get, UseGuards } from '@nestjs/common';
import { PERMISSIONS } from 'src/shared/configs/permission';
import { RequirePermissions } from 'src/shared/decorators/permission.decorator';
import { ResponseMessage } from 'src/shared/decorators/response-message.decorator';
import { PermissionGuard } from 'src/shared/guards/permission.guard';
import { StatsService } from './stats.service';

@Controller('stats')
@UseGuards(PermissionGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('dashboard')
  @RequirePermissions(PERMISSIONS.ORDER_READ)
  @ResponseMessage('Dashboard stats retrieved successfully')
  async getDashboardStats() {
    return this.statsService.getDashboardStats();
  }

  @Get('overview')
  @RequirePermissions(PERMISSIONS.ORDER_READ)
  @ResponseMessage('Overview stats retrieved successfully')
  async getOverviewStats() {
    return this.statsService.getOverviewStats();
  }

  @Get('recent-sales')
  @RequirePermissions(PERMISSIONS.ORDER_READ)
  @ResponseMessage('Recent sales retrieved successfully')
  async getRecentSales() {
    return this.statsService.getRecentSales();
  }
}
