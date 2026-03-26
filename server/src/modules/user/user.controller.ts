import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PERMISSIONS } from 'src/shared/configs/permission';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { RequirePermissions } from 'src/shared/decorators/permission.decorator';
import { ResponseMessage } from 'src/shared/decorators/response-message.decorator';
import { PermissionGuard } from 'src/shared/guards/permission.guard';
import {
  CreateUserDto,
  UpdateMeDto,
  UpdateUserAdminDto,
  UserQueryDto,
  AvatarPresignedRequestDto,
  AvatarUploadCompleteDto,
} from './dto/user.dto';
import { AdminUpdateMembershipDto } from './dto/membership.dto';
import { UserService } from './user.service';

@Controller('users')
@UseGuards(PermissionGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  // ==================== AVATAR UPLOAD ENDPOINTS ====================

  /**
   * Get presigned URL for avatar upload
   */
  @Post('avatar/presigned')
  @ResponseMessage('Presigned URL generated successfully')
  async getAvatarPresignedUrl(
    @CurrentUser('sub') userId: string,
    @Body() dto: AvatarPresignedRequestDto,
  ) {
    return this.userService.getAvatarPresignedUrl(userId, dto);
  }

  /**
   * Mark avatar upload as complete and update user profile
   */
  @Post('avatar/upload-complete')
  @ResponseMessage('Avatar uploaded successfully')
  async completeAvatarUpload(
    @CurrentUser('sub') userId: string,
    @Body() dto: AvatarUploadCompleteDto,
  ) {
    return this.userService.completeAvatarUpload(userId, dto.key);
  }

  /**
   * Delete current user's avatar
   */
  @Delete('avatar')
  @ResponseMessage('Avatar deleted successfully')
  async deleteAvatar(@CurrentUser('sub') userId: string) {
    return this.userService.deleteAvatar(userId);
  }

  @Get()
  @RequirePermissions(PERMISSIONS.USER_READ)
  @ResponseMessage('Users retrieved successfully')
  async getAllUsers(@Query() userQuery: UserQueryDto) {
    return this.userService.getAllUsers(userQuery);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.USER_READ)
  @ResponseMessage('User retrieved successfully')
  async getUserById(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.USER_CREATE)
  @ResponseMessage('User created successfully')
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.USER_DELETE)
  @ResponseMessage('User deleted successfully')
  async deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }

  @Patch('me')
  @ResponseMessage('Profile updated successfully')
  async updateMe(
    @CurrentUser('sub') userId: string,
    @Body() updateMeDto: UpdateMeDto,
  ) {
    return this.userService.updateMe(userId, updateMeDto);
  }

  @Put('admin/:id')
  @RequirePermissions(PERMISSIONS.USER_UPDATE)
  @ResponseMessage('User updated successfully by admin')
  async updateUserAdmin(
    @Param('id') id: string,
    @Body() updateUserAdminDto: UpdateUserAdminDto,
  ) {
    return this.userService.updateUserAdmin(id, updateUserAdminDto);
  }

  // ==================== MEMBERSHIP ENDPOINTS ====================

  @Get('membership/me')
  @ResponseMessage('Membership info retrieved successfully')
  async getMyMembership(@CurrentUser('sub') userId: string) {
    return this.userService.getMembershipInfo(userId);
  }

  @Get('membership/:id')
  @RequirePermissions(PERMISSIONS.USER_READ)
  @ResponseMessage('User membership info retrieved successfully')
  async getUserMembership(@Param('id') id: string) {
    return this.userService.getMembershipInfo(id);
  }

  // Note: To subscribe to a membership, use POST /orders/membership/checkout
  // This ensures payment is processed before membership is activated

  @Put('admin/membership/:id')
  @RequirePermissions(PERMISSIONS.USER_UPDATE)
  @ResponseMessage('User membership updated successfully by admin')
  async adminUpdateMembership(
    @Param('id') id: string,
    @Body() adminUpdateMembershipDto: AdminUpdateMembershipDto,
  ) {
    return this.userService.adminUpdateMembership(id, adminUpdateMembershipDto);
  }

  @Post('admin/membership/check-expired')
  @RequirePermissions(PERMISSIONS.USER_UPDATE)
  @ResponseMessage('Expired memberships checked')
  async checkExpiredMemberships() {
    return this.userService.checkExpiredMemberships();
  }

  @Get('admin/membership/expired')
  @RequirePermissions(PERMISSIONS.USER_READ)
  @ResponseMessage('Expired memberships retrieved successfully')
  async getExpiredMemberships() {
    return this.userService.getExpiredMemberships();
  }
}
