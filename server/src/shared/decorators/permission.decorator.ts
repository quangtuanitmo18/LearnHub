import { SetMetadata } from '@nestjs/common';
import { Permission } from '../configs/permission';

export const PERMISSION_KEY = 'permissions';

/**
 * Permission decorator to set required permissions for a route
 * Can accept single permission or array of permissions
 * @param permissions - Required permissions for the route
 */
export const RequirePermissions = (...permissions: Permission[]) => {
  return SetMetadata(PERMISSION_KEY, permissions);
};

/**
 * Alias for RequirePermissions for backward compatibility
 */
export const Permissions = RequirePermissions;
