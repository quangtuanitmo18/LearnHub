'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePermissions } from '@/hooks/use-permissions';
import {
  MdAdminPanelSettings,
  MdDelete,
  MdEdit,
  MdMoreVert,
  MdPeople,
  MdPersonOutline,
  MdSecurity,
  MdShield,
} from 'react-icons/md';

import { OPERATIONS, RESOURCES } from '@/configs/permission';
import { IRole } from '@/types/role';

// Role icons mapping - aligned with actual system roles
const roleIcons = {
  admin: MdSecurity,
  'Super Admin': MdAdminPanelSettings,
  super_admin: MdAdminPanelSettings, // fallback for underscore version
  student: MdPeople,
  guest: MdPersonOutline,
} as const;

// Role color mapping - aligned with actual system roles
const roleColors = {
  admin: 'bg-red-100 text-red-800 border-red-200',
  'Super Admin': 'bg-purple-100 text-purple-800 border-purple-200',
  super_admin: 'bg-purple-100 text-purple-800 border-purple-200', // fallback for underscore version
  student: 'bg-green-100 text-green-800 border-green-200',
  guest: 'bg-gray-100 text-gray-800 border-gray-200',
} as const;

// Helper function to get role icon with fallback logic
function getRoleIcon(roleName: string) {
  // Try exact match first
  if (roleIcons[roleName as keyof typeof roleIcons]) {
    return roleIcons[roleName as keyof typeof roleIcons];
  }

  // Default fallback
  return MdShield;
}

// Helper function to get role color with fallback logic
function getRoleColor(roleName: string) {
  // Try exact match first
  if (roleColors[roleName as keyof typeof roleColors]) {
    return roleColors[roleName as keyof typeof roleColors];
  }

  // Default fallback
  return 'bg-gray-100 text-gray-800 border-gray-200';
}

interface RolesListProps {
  roles?: IRole[];
  onEditRole?: (role: IRole) => void;
}

interface RoleListItemProps {
  role: IRole;
  onEditRole?: (role: IRole) => void;
}

function RoleListItem({ role, onEditRole }: RoleListItemProps) {
  const { UPDATE, DELETE } = usePermissions(RESOURCES.ROLE, [OPERATIONS.UPDATE, OPERATIONS.DELETE]);

  const IconComponent = getRoleIcon(role.name);
  const colorClass = getRoleColor(role.name);

  const handleEditRole = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEditRole?.(role);
  };

  const hasActions = UPDATE || DELETE;

  return (
    <div className="group hover:bg-muted/50 border-border/40 border-b transition-colors duration-200 last:border-b-0">
      <div className="grid grid-cols-12 items-center gap-4 p-4">
        {/* Role Info - 4 columns */}
        <div className="col-span-12 flex items-center gap-3 md:col-span-4">
          <div className={`rounded-lg p-2 ${colorClass} shrink-0`}>
            <IconComponent className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base leading-tight font-semibold capitalize">
              {role.name.replace('_', ' ')}
            </h3>
            <p className="text-muted-foreground max-w-[200px] truncate text-sm">
              {role.description}
            </p>
          </div>
        </div>

        {/* Permissions - 2 columns */}
        <div className="col-span-6 flex items-center gap-2 md:col-span-2">
          <span className="text-muted-foreground hidden text-sm md:block">Permissions:</span>
          <Badge variant="secondary" className="font-semibold">
            {role.permissions.length}
          </Badge>
        </div>

        {/* Metadata - 3 columns */}
        <div className="col-span-6 space-y-1 md:col-span-3">
          <div className="text-muted-foreground flex items-center gap-1 text-sm">
            <MdPeople className="h-3.5 w-3.5" />
            <span>{role?.totalUsers || 0} users</span>
          </div>
          <div className="text-muted-foreground text-xs">
            {new Date(role.createdAt).toLocaleDateString()}
          </div>
        </div>

        {/* Actions - 1 column */}
        <div className="col-span-6 flex justify-end md:col-span-1">
          {hasActions && (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <MdMoreVert className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {UPDATE && (
                  <DropdownMenuItem onClick={handleEditRole} className="gap-2">
                    <MdEdit className="h-4 w-4" />
                    Edit Role
                  </DropdownMenuItem>
                )}
                {DELETE && (
                  <DropdownMenuItem
                    className="text-destructive gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MdDelete className="h-4 w-4" />
                    Delete Role
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
}

const RolesList = ({ roles = [], onEditRole }: RolesListProps) => {
  return (
    <div className="border-border overflow-hidden rounded-lg border">
      {/* Table Header */}
      <div className="bg-muted/50 border-border border-b">
        <div className="text-muted-foreground grid grid-cols-12 gap-4 p-4 text-sm font-medium">
          <div className="col-span-12 md:col-span-4">Role</div>
          <div className="col-span-6 hidden md:col-span-2 md:block">Permissions</div>
          <div className="col-span-6 hidden md:col-span-3 md:block">Users & Date</div>
          <div className="col-span-6 hidden md:col-span-1 md:block">Actions</div>
        </div>
      </div>

      {/* Table Body */}
      <div>
        {roles.map((role) => (
          <RoleListItem key={role.id} role={role} onEditRole={onEditRole} />
        ))}
      </div>
    </div>
  );
};

export default RolesList;
