import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaginationQueryDto } from 'src/shared/dto/pagination.dto';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import { RoleRepository } from './role.repository';
import { UserRepository } from '../user/user.repository';

@Injectable()
export class RoleService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async createRole(createRoleDto: CreateRoleDto) {
    await this.roleRepository.validateUniqueName(createRoleDto.name);

    return this.roleRepository.create(createRoleDto);
  }

  async getAllRoles(paginationQuery?: PaginationQueryDto) {
    return this.roleRepository.findAll(paginationQuery);
  }

  async getRoleById(id: string) {
    return this.roleRepository.findWithUsers(id);
  }

  async updateRole(id: string, updateRoleDto: UpdateRoleDto) {
    // Check if name is being changed and if new name already exists
    if (updateRoleDto.name) {
      await this.roleRepository.validateUniqueName(updateRoleDto.name, id);
    }

    return this.roleRepository.update({ id }, updateRoleDto);
  }

  async deleteRole(id: string) {
    const isAssigned = await this.roleRepository.isAssignedToUsers(id);

    if (isAssigned) {
      throw new BadRequestException(
        'Cannot delete role that is assigned to users',
      );
    }

    await this.roleRepository.delete({ id });

    return { message: 'Role deleted successfully' };
  }

  async assignRoleToUser(userId: string, roleId: string) {
    // Check if user exists
    const user = await this.userRepository.findByIdWithRoles(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if role exists
    await this.roleRepository.findOne({ id: roleId });

    // Check if user already has this role
    const hasRole = user.roles.some((r) => r.id === roleId);
    if (hasRole) {
      throw new BadRequestException('User already has this role');
    }

    return this.userRepository.assignRole(userId, roleId);
  }

  async removeRoleFromUser(userId: string, roleId: string) {
    // Check if user exists
    const user = await this.userRepository.findByIdWithRoles(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user has this role
    const hasRole = user.roles.some((r) => r.id === roleId);
    if (!hasRole) {
      throw new BadRequestException('User does not have this role');
    }

    return this.userRepository.removeRole(userId, roleId);
  }
}
