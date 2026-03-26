import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto, UpdateRoleDto, AssignRoleDto } from './dto/role.dto';
import { PaginationQueryDto } from 'src/shared/dto/pagination.dto';
import { RequirePermissions } from 'src/shared/decorators/permission.decorator';
import { PERMISSIONS } from 'src/shared/configs/permission';
import { PermissionGuard } from 'src/shared/guards/permission.guard';
import { ResponseMessage } from 'src/shared/decorators/response-message.decorator';

@Controller('roles')
@UseGuards(PermissionGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @RequirePermissions(PERMISSIONS.ROLE_CREATE)
  @ResponseMessage('Role created successfully')
  async createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.createRole(createRoleDto);
  }

  @Get()
  @RequirePermissions(PERMISSIONS.ROLE_READ)
  @ResponseMessage('Roles retrieved successfully')
  async getAllRoles(@Query() paginationQuery: PaginationQueryDto) {
    return this.roleService.getAllRoles(paginationQuery);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.ROLE_READ)
  @ResponseMessage('Role retrieved successfully')
  async getRoleById(@Param('id') id: string) {
    return this.roleService.getRoleById(id);
  }

  @Put(':id')
  @RequirePermissions(PERMISSIONS.ROLE_UPDATE)
  @ResponseMessage('Role updated successfully')
  async updateRole(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.roleService.updateRole(id, updateRoleDto);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.ROLE_DELETE)
  @ResponseMessage('Role deleted successfully')
  async deleteRole(@Param('id') id: string) {
    return this.roleService.deleteRole(id);
  }

  @Post('assign')
  @RequirePermissions(PERMISSIONS.ROLE_UPDATE, PERMISSIONS.USER_UPDATE)
  @ResponseMessage('Role assigned successfully')
  async assignRole(@Body() assignRoleDto: AssignRoleDto) {
    return this.roleService.assignRoleToUser(
      assignRoleDto.userId,
      assignRoleDto.roleId,
    );
  }

  @Post('remove')
  @RequirePermissions(PERMISSIONS.ROLE_UPDATE, PERMISSIONS.USER_UPDATE)
  @ResponseMessage('Role removed successfully')
  async removeRole(@Body() assignRoleDto: AssignRoleDto) {
    return this.roleService.removeRoleFromUser(
      assignRoleDto.userId,
      assignRoleDto.roleId,
    );
  }
}
