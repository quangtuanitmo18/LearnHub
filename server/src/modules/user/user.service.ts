import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UpdateMeDto,
  UpdateUserAdminDto,
  UserQueryDto,
  AvatarPresignedRequestDto,
  AvatarPresignedResponseDto,
  UpdateUserSettingsDto,
  UserSettingsResponseDto,
} from './dto/user.dto';
import {
  AdminUpdateMembershipDto,
  MembershipResponseDto,
} from './dto/membership.dto';
import { UserRepository } from './user.repository';
import { S3Service } from 'src/shared/services/s3.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import {
  MembershipPlan,
  MembershipDuration,
  type MembershipPlanType,
} from 'src/shared/constants/user.constant';

// Allowed avatar mimetypes
const ALLOWED_AVATAR_MIMETYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
];

// Max avatar size: 5MB
const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

@Injectable()
export class UserService {
  private readonly cdnBaseUrl: string;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly s3Service: S3Service,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {
    this.cdnBaseUrl = this.configService.get<string>('cdn.baseUrl') || '';
  }

  async getMySettings(userId: string): Promise<UserSettingsResponseDto> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        emailNotifications: true,
        pushNotifications: true,
        marketingEmails: true,
        darkMode: true,
        language: true,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return user;
  }

  async updateMySettings(
    userId: string,
    updateUserSettingsDto: UpdateUserSettingsDto,
  ): Promise<UserSettingsResponseDto> {
    const language = updateUserSettingsDto.language?.trim().toLowerCase();
    if (language !== undefined && language !== 'vi' && language !== 'en') {
      throw new BadRequestException('Language must be either vi or en');
    }

    const updateData = {
      ...updateUserSettingsDto,
      ...(language !== undefined ? { language } : {}),
    };

    const updated = await this.prismaService.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        emailNotifications: true,
        pushNotifications: true,
        marketingEmails: true,
        darkMode: true,
        language: true,
      },
    });

    return updated;
  }

  async getUserStats() {
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      bannedUsers,
      facebookUsers,
      googleUsers,
      defaultUsers,
    ] = await Promise.all([
      this.prismaService.user.count(),
      this.prismaService.user.count({ where: { status: 'ACTIVE' } }),
      this.prismaService.user.count({ where: { status: 'INACTIVE' } }),
      this.prismaService.user.count({ where: { status: 'BANNED' } }),
      this.prismaService.user.count({ where: { userType: 'FACEBOOK' } }),
      this.prismaService.user.count({ where: { userType: 'GOOGLE' } }),
      this.prismaService.user.count({ where: { userType: 'DEFAULT' } }),
    ]);

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      bannedUsers,
      facebookUsers,
      googleUsers,
      defaultUsers,
    };
  }

  async bulkDeleteUsers(userIds: string[]) {
    await this.prismaService.user.deleteMany({
      where: { id: { in: userIds } },
    });
    return { message: `${userIds.length} users deleted successfully` };
  }

  async getAllUsers(userQuery?: UserQueryDto) {
    return await this.userRepository.findAllUsers(userQuery);
  }

  async getUserById(id: string) {
    const user = await this.userRepository.findByIdWithFullRoles(id);

    if (!user) {
      return { permissions: [] };
    }

    // Collect all permissions from user roles
    const permissions = new Set<string>();
    if (user.roles) {
      user.roles.forEach((role) => {
        if (Array.isArray(role.permissions)) {
          role.permissions.forEach((permission) =>
            permissions.add(String(permission)),
          );
        }
      });
    }

    return {
      ...user,
      permissions: Array.from(permissions),
    };
  }

  async createUser(createUserDto: CreateUserDto) {
    await this.userRepository.validateUniqueEmail(createUserDto.email);

    const hashedPassword = createUserDto.password
      ? await bcrypt.hash(createUserDto.password, 10)
      : undefined;

    return this.userRepository.create(
      {
        username: createUserDto.username,
        email: createUserDto.email,
        password: hashedPassword ?? undefined,
        status: (createUserDto.status as any) || 'ACTIVE',
        userType: (createUserDto.userType as any) || 'DEFAULT',
        avatar: createUserDto.avatar,
      },
      {
        roles: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    );
  }

  async deleteUser(id: string) {
    await this.userRepository.delete({ id });

    return { message: 'User deleted successfully' };
  }

  async updateMe(userId: string, updateMeDto: UpdateMeDto) {
    // Check if email is being changed and validate uniqueness
    if (updateMeDto.email) {
      await this.userRepository.validateUniqueEmail(updateMeDto.email, userId);
    }

    const updateData: Record<string, any> = {
      username: updateMeDto.username,
      email: updateMeDto.email,
      avatar: updateMeDto.avatar,
    };

    // Hash password if provided
    if (updateMeDto.password) {
      updateData.password = await bcrypt.hash(updateMeDto.password, 10);
    }

    // Remove undefined fields
    const cleanedData = Object.fromEntries(
      Object.entries(updateData).filter(([, value]) => value !== undefined),
    ) as UpdateUserDto;

    return this.userRepository.update({ id: userId }, cleanedData);
  }

  async updateUserAdmin(id: string, updateUserAdminDto: UpdateUserAdminDto) {
    try {
      // Validate that the user exists first
      const existingUser = await this.userRepository.findOne({ id });
      if (!existingUser) {
        throw new Error(`User with ID ${id} not found`);
      }

      // Prepare update data - only status is updatable via this admin endpoint
      const updateData: Record<string, any> = {};
      if (updateUserAdminDto.status !== undefined) {
        updateData.status = updateUserAdminDto.status;
      }

      // Update user with roles (repository handles validation and transaction)
      return await this.userRepository.updateUserWithRoles(
        id,
        updateData,
        updateUserAdminDto.roleIds,
      );
    } catch (error) {
      // Re-throw with more context if needed
      if (error.message?.includes('Invalid role IDs')) {
        throw new Error(`Failed to update user: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get user's membership information
   */
  async getMembershipInfo(userId: string): Promise<MembershipResponseDto> {
    const user = await this.userRepository.getMembershipInfo(userId);

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const now = new Date();
    const planEndDate = user.planEndDate ? new Date(user.planEndDate) : null;
    const isExpired = planEndDate ? planEndDate < now : true;
    const daysRemaining =
      planEndDate && !isExpired
        ? Math.ceil(
            (planEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
          )
        : 0;

    return {
      plan: user.plan as MembershipPlanType,
      planStartDate: user.planStartDate,
      planEndDate: user.planEndDate,
      isMembership: user.isMembership,
      daysRemaining,
      isExpired: user.plan !== MembershipPlan.NONE && isExpired,
    };
  }

  /**
   * Admin update user's membership
   * Note: Regular users should subscribe via POST /orders/membership/checkout
   */
  async adminUpdateMembership(
    userId: string,
    adminUpdateMembershipDto: AdminUpdateMembershipDto,
  ) {
    const user = await this.userRepository.findOne({ id: userId });

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const updateData: any = {};

    if (adminUpdateMembershipDto.plan !== undefined) {
      updateData.plan = adminUpdateMembershipDto.plan;

      // Auto-calculate dates if plan is provided without dates
      if (adminUpdateMembershipDto.plan === MembershipPlan.NONE) {
        updateData.isMembership = false;
      } else if (
        adminUpdateMembershipDto.planStartDate === undefined &&
        adminUpdateMembershipDto.planEndDate === undefined
      ) {
        const durationMonths =
          MembershipDuration[adminUpdateMembershipDto.plan];
        updateData.planStartDate = new Date();
        updateData.planEndDate = new Date();
        updateData.planEndDate.setMonth(
          updateData.planEndDate.getMonth() + durationMonths,
        );
        updateData.isMembership = true;
      }
    }

    if (adminUpdateMembershipDto.planStartDate !== undefined) {
      updateData.planStartDate = new Date(
        adminUpdateMembershipDto.planStartDate,
      );
    }

    if (adminUpdateMembershipDto.planEndDate !== undefined) {
      updateData.planEndDate = new Date(adminUpdateMembershipDto.planEndDate);
    }

    if (adminUpdateMembershipDto.isMembership !== undefined) {
      updateData.isMembership = adminUpdateMembershipDto.isMembership;
    }

    return this.userRepository.updateMembership(userId, updateData);
  }

  /**
   * Check and deactivate expired memberships (can be called by a cron job)
   */
  async checkExpiredMemberships() {
    const result = await this.userRepository.deactivateExpiredMemberships();
    return {
      message: 'Expired memberships checked and deactivated',
      count: result.count,
    };
  }

  /**
   * Get all users with expired memberships
   */
  async getExpiredMemberships() {
    return this.userRepository.findExpiredMemberships();
  }

  // ==================== AVATAR UPLOAD METHODS ====================

  /**
   * Generate presigned URL for avatar upload
   */
  async getAvatarPresignedUrl(
    userId: string,
    dto: AvatarPresignedRequestDto,
  ): Promise<AvatarPresignedResponseDto> {
    // Validate mimetype
    if (!ALLOWED_AVATAR_MIMETYPES.includes(dto.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${ALLOWED_AVATAR_MIMETYPES.join(', ')}`,
      );
    }

    // Validate file size
    if (dto.size > MAX_AVATAR_SIZE) {
      throw new BadRequestException(
        `File too large. Maximum size: ${MAX_AVATAR_SIZE / (1024 * 1024)}MB`,
      );
    }

    // Generate unique key for avatar
    const ext = dto.filename.split('.').pop() || 'jpg';
    const key = `avatars/${userId}/${uuidv4()}-${Date.now()}.${ext}`;

    // Generate presigned URL (10 minutes expiry)
    const presignedData = await this.s3Service.getPresignedUploadUrl(
      key,
      dto.mimetype,
      600,
    );

    return presignedData;
  }

  /**
   * Mark avatar upload as complete and update user's avatar
   */
  async completeAvatarUpload(
    userId: string,
    key: string,
  ): Promise<{ avatar: string }> {
    // Verify file exists in S3
    const exists = await this.s3Service.fileExists(key);
    if (!exists) {
      throw new BadRequestException(
        'Upload not completed - file not found in S3',
      );
    }

    // Construct the avatar URL
    const avatarUrl = this.cdnBaseUrl ? `${this.cdnBaseUrl}/${key}` : key;

    // Get current user to check for old avatar
    const user = await this.userRepository.findOne({ id: userId });
    const oldAvatarKey = user?.avatar;

    // Update user's avatar
    await this.userRepository.update({ id: userId }, { avatar: avatarUrl });

    // Delete old avatar from S3 if it exists and is different
    if (oldAvatarKey && oldAvatarKey !== avatarUrl) {
      try {
        // Extract key from URL if it's a full URL
        const keyToDelete = oldAvatarKey.includes('/')
          ? oldAvatarKey.replace(`${this.cdnBaseUrl}/`, '')
          : oldAvatarKey;

        if (keyToDelete.startsWith('avatars/')) {
          await this.s3Service.deleteFile(keyToDelete);
        }
      } catch (error) {
        // Log but don't fail if old avatar deletion fails
        console.error('Failed to delete old avatar:', error);
      }
    }

    return { avatar: avatarUrl };
  }

  /**
   * Delete user's avatar
   */
  async deleteAvatar(userId: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ id: userId });

    if (!user?.avatar) {
      throw new BadRequestException('User has no avatar to delete');
    }

    // Extract key from URL
    const keyToDelete = user.avatar.includes('/')
      ? user.avatar.replace(`${this.cdnBaseUrl}/`, '')
      : user.avatar;

    // Delete from S3 if it's an avatar we manage
    if (keyToDelete.startsWith('avatars/')) {
      try {
        await this.s3Service.deleteFile(keyToDelete);
      } catch (error) {
        console.error('Failed to delete avatar from S3:', error);
      }
    }

    await this.userRepository.update({ id: userId }, { avatar: '' });

    return { message: 'Avatar deleted successfully' };
  }
}
