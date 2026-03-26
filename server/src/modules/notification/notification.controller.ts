import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import {
  NotificationQueryDto,
  MarkMultipleReadDto,
  DeleteMultipleNotificationsDto,
} from './dto/notification.dto';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { PermissionGuard } from 'src/shared/guards/permission.guard';
import { RequirePermissions } from 'src/shared/decorators/permission.decorator';
import { PERMISSIONS } from 'src/shared/configs/permission';
import { ResponseMessage } from 'src/shared/decorators/response-message.decorator';

@Controller('notifications')
@UseGuards(PermissionGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * Get all notifications for the current user with pagination
   * GET /notifications
   */
  @Get()
  @ResponseMessage('Notifications retrieved successfully')
  async getNotifications(
    @CurrentUser('sub') userId: string,
    @Query() query: NotificationQueryDto,
  ) {
    return this.notificationService.getUserNotifications(userId, query);
  }

  /**
   * Get notification count (total and unread)
   * GET /notifications/count
   */
  @Get('count')
  @ResponseMessage('Notification count retrieved successfully')
  async getNotificationCount(@CurrentUser('sub') userId: string) {
    return this.notificationService.getNotificationCount(userId);
  }

  /**
   * Mark a single notification as read
   * POST /notifications/:id/read
   */
  @Post(':id/read')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Notification marked as read')
  async markAsRead(
    @Param('id') recipientId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.notificationService.markAsRead(recipientId, userId);
  }

  /**
   * Mark multiple notifications as read
   * POST /notifications/mark-read
   */
  @Post('mark-read')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Notifications marked as read')
  async markMultipleAsRead(
    @Body() dto: MarkMultipleReadDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.notificationService.markMultipleAsRead(
      dto.recipientIds,
      userId,
    );
  }

  /**
   * Mark all notifications as read
   * POST /notifications/mark-all-read
   */
  @Post('mark-all-read')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('All notifications marked as read')
  async markAllAsRead(@CurrentUser('sub') userId: string) {
    return this.notificationService.markAllAsRead(userId);
  }

  /**
   * Delete a single notification
   * DELETE /notifications/:id
   */
  @Delete(':id')
  @ResponseMessage('Notification deleted successfully')
  async deleteNotification(
    @Param('id') recipientId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.notificationService.deleteNotification(recipientId, userId);
  }

  /**
   * Delete multiple notifications
   * DELETE /notifications
   */
  @Delete()
  @ResponseMessage('Notifications deleted successfully')
  async deleteMultipleNotifications(
    @Body() dto: DeleteMultipleNotificationsDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.notificationService.deleteMultipleNotifications(
      dto.recipientIds,
      userId,
    );
  }
}
