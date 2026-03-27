import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/shared/services/base.service';
import { PrismaService } from 'src/shared/services/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from './dto/user.dto';
import { PaginatedResponseDto } from 'src/shared/dto/pagination.dto';

@Injectable()
export class UserRepository extends BaseService<
  Prisma.UserGetPayload<{ include: { roles: true } }>,
  CreateUserDto,
  UpdateUserDto,
  Prisma.UserWhereUniqueInput
> {
  protected modelName = Prisma.ModelName.User;

  constructor(prismaService: PrismaService) {
    super(prismaService, {
      defaultSortBy: 'createdAt',
      defaultSortOrder: 'desc',
      searchFields: ['username', 'email'],
      selectFields: {
        id: true,
        username: true,
        email: true,
        status: true,
        userType: true,
        avatar: true,
        plan: true,
        planStartDate: true,
        planEndDate: true,
        isMembership: true,
        createdAt: true,
        updatedAt: true,
        courses: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        roles: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string) {
    return this.findOneOrNull({ email });
  }

  /**
   * Find user by ID with roles
   */
  async findByIdWithRoles(userId: string) {
    return this.findOne(
      { id: userId },
      {
        roles: true,
      },
    );
  }

  /**
   * Find user by ID with full role details and permissions
   */
  async findByIdWithFullRoles(userId: string) {
    return this.findOne(
      { id: userId },
      {
        roles: {
          select: {
            id: true,
            name: true,
            description: true,
            permissions: true,
          },
        },
      },
    );
  }

  /**
   * Check if email is unique
   */
  async validateUniqueEmail(email: string, excludeId?: string) {
    return this.checkUniqueness('email', email, excludeId);
  }

  /**
   * Assign role to user
   */
  async assignRole(userId: string, roleId: string) {
    return this.prismaService.user.update({
      where: { id: userId },
      data: {
        roles: {
          connect: { id: roleId },
        },
      },
      include: {
        roles: true,
      },
    });
  }

  /**
   * Remove role from user
   */
  async removeRole(userId: string, roleId: string) {
    return this.prismaService.user.update({
      where: { id: userId },
      data: {
        roles: {
          disconnect: { id: roleId },
        },
      },
      include: {
        roles: true,
      },
    });
  }

  /**
   * Validate that all role IDs exist
   */
  async validateRoleIds(roleIds: string[]) {
    if (!roleIds || roleIds.length === 0) return;

    const existingRoles = await this.prismaService.role.findMany({
      where: { id: { in: roleIds } },
      select: { id: true },
    });

    const existingRoleIds = existingRoles.map((role) => role.id);
    const invalidRoleIds = roleIds.filter(
      (id) => !existingRoleIds.includes(id),
    );

    if (invalidRoleIds.length > 0) {
      throw new Error(`Invalid role IDs: ${invalidRoleIds.join(', ')}`);
    }
  }

  /**
   * Find all users with filtering by status and userType
   */
  async findAllUsers(
    userQuery?: UserQueryDto,
  ): Promise<PaginatedResponseDto<any>> {
    // Build additional where conditions for status and userType filters
    const additionalWhere: any = {};

    if (userQuery?.status) {
      if (Array.isArray(userQuery.status)) {
        additionalWhere.status = { in: userQuery.status };
      } else {
        additionalWhere.status = userQuery.status;
      }
    }

    if (userQuery?.userType) {
      if (Array.isArray(userQuery.userType)) {
        additionalWhere.userType = { in: userQuery.userType };
      } else {
        additionalWhere.userType = userQuery.userType;
      }
    }

    if (userQuery?.plan) {
      if (Array.isArray(userQuery.plan)) {
        additionalWhere.plan = { in: userQuery.plan };
      } else {
        additionalWhere.plan = userQuery.plan;
      }
    }

    if (userQuery?.isMembership !== undefined) {
      additionalWhere.isMembership = userQuery.isMembership;
    }

    // Use the base findAll method with additional filters
    return this.findAll(userQuery, additionalWhere);
  }

  /**
   * Update user with roles (admin operation)
   */
  async updateUserWithRoles(userId: string, data: any, roleIds?: string[]) {
    // Validate role IDs if provided
    if (roleIds !== undefined && roleIds.length > 0) {
      await this.validateRoleIds(roleIds);
    }

    // Use transaction to ensure atomicity
    return this.prismaService.$transaction(async (prisma) => {
      const updateData: any = { ...data };

      if (roleIds !== undefined) {
        // Set roles by disconnecting all and connecting new ones
        updateData.roles = {
          set: roleIds.map((id) => ({ id })),
        };
      }

      return prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          username: true,
          email: true,
          status: true,
          userType: true,
          avatar: true,
          plan: true,
          planStartDate: true,
          planEndDate: true,
          isMembership: true,
          updatedAt: true,
          roles: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    });
  }

  /**
   * Update user membership
   */
  async updateMembership(
    userId: string,
    membershipData: {
      plan: string;
      planStartDate: Date;
      planEndDate: Date;
      isMembership: boolean;
    },
  ) {
    return this.prismaService.user.update({
      where: { id: userId },
      data: membershipData as any,
      select: {
        id: true,
        username: true,
        email: true,
        plan: true,
        planStartDate: true,
        planEndDate: true,
        isMembership: true,
      },
    });
  }

  /**
   * Get user membership info
   */
  async getMembershipInfo(userId: string) {
    return this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        plan: true,
        planStartDate: true,
        planEndDate: true,
        isMembership: true,
      },
    });
  }

  /**
   * Find users with expired memberships
   */
  async findExpiredMemberships() {
    return this.prismaService.user.findMany({
      where: {
        isMembership: true,
        planEndDate: {
          lt: new Date(),
        },
      },
      select: {
        id: true,
        username: true,
        email: true,
        plan: true,
        planStartDate: true,
        planEndDate: true,
        isMembership: true,
      },
    });
  }

  /**
   * Deactivate expired memberships
   */
  async deactivateExpiredMemberships() {
    return this.prismaService.user.updateMany({
      where: {
        isMembership: true,
        planEndDate: {
          lt: new Date(),
        },
      },
      data: {
        isMembership: false,
        plan: 'NONE' as any,
      },
    });
  }
}
