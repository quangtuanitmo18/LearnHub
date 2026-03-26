import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/shared/services/base.service';
import { PrismaService } from 'src/shared/services/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';

@Injectable()
export class RoleRepository extends BaseService<
  Prisma.RoleGetPayload<{ include: { users: true } }>,
  CreateRoleDto,
  UpdateRoleDto,
  Prisma.RoleWhereUniqueInput
> {
  protected modelName = Prisma.ModelName.Role;

  constructor(prismaService: PrismaService) {
    super(prismaService, {
      defaultSortBy: 'name',
      defaultSortOrder: 'asc',
      searchFields: ['name', 'description'],
    });
  }

  /**
   * Find role by name
   */
  async findByName(name: string) {
    return this.findOneOrNull({ name });
  }

  /**
   * Get role with users
   */
  async findWithUsers(id: string) {
    return this.findOne(
      { id },
      {
        users: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    );
  }

  /**
   * Check if role is assigned to any users
   */
  async isAssignedToUsers(id: string): Promise<boolean> {
    const role = await this.findOne(
      { id },
      {
        users: {
          select: { id: true },
          take: 1,
        },
      },
    );
    if (!role) return false;
    return Array.isArray(role.users) && role.users.length > 0;
  }

  /**
   * Get all roles without pagination
   */
  async findAllRoles() {
    return this.findMany({}, { name: 'asc' });
  }

  /**
   * Check if a role name is unique
   */
  async validateUniqueName(name: string, excludeId?: string) {
    return this.checkUniqueness('name', name, excludeId);
  }
}
