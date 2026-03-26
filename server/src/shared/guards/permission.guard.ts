import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../services/prisma.service';
import { PERMISSION_KEY } from '../decorators/permission.decorator';
import { Permission } from '../configs/permission';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    // Get required permissions from decorator
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no permissions required, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.sub) {
      throw new ForbiddenException('User not authenticated');
    }

    // Get user with roles and permissions
    const userWithRoles = await this.prismaService.user.findUnique({
      where: { id: user.sub },
      include: {
        roles: true,
      },
    });

    if (!userWithRoles) {
      throw new ForbiddenException('User not found');
    }

    // Check if user is super admin
    const isSuperAdmin =
      userWithRoles.userType === 'DEFAULT' &&
      userWithRoles.roles.some((role) => role.name === 'Super Admin');

    if (isSuperAdmin) {
      return true;
    }

    // Collect all user permissions from roles
    const userPermissions = new Set<string>();

    for (const role of userWithRoles.roles) {
      role.permissions.forEach((permission) => userPermissions.add(permission));
    }

    // Check if user has at least one required permission
    const hasPermission = requiredPermissions.some((permission) =>
      userPermissions.has(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Insufficient permissions. Required: ${requiredPermissions.join(' or ')}`,
      );
    }

    return true;
  }
}
