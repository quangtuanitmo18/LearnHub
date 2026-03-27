'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/stores/auth-store';
import { useState } from 'react';
import { MdAccountCircle, MdEdit, MdEmail, MdPerson, MdSecurity } from 'react-icons/md';
import ProfileEditDialog from './profile-edit-dialog';
import { DEFAULT_AVATAR } from '@/constants';
import { UserStatus, UserType } from '@/types/user';

// Profile info tab component - Arrow function
const ProfileInfoTab = () => {
  const user = useAuthStore((state) => state.user);
  console.log('user', user);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  if (!user) return null;

  const avatarUrl = user.avatar || DEFAULT_AVATAR;
  const userInitials = user.username ? user.username.slice(0, 2).toUpperCase() : 'U';

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="mb-1 text-xl font-bold sm:mb-2 sm:text-2xl">Personal Information</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Manage your account information and personal settings
        </p>
      </div>

      {/* Personal Information */}
      <Card className="max-w-3xl">
        <CardHeader className="flex flex-col items-start justify-between space-y-2 px-4 pt-4 pb-4 sm:flex-row sm:items-center sm:space-y-0 sm:px-6 sm:pt-6">
          <div>
            <CardDescription className="text-xs sm:text-sm">
              Basic account information
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setProfileDialogOpen(true)}
            className="flex h-8 w-full items-center gap-1.5 text-xs sm:h-9 sm:w-auto sm:gap-2 sm:text-sm"
          >
            <MdEdit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Edit
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 px-4 pb-4 sm:space-y-6 sm:px-6 sm:pb-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={user.username || 'User'} />}
              <AvatarFallback className="bg-primary text-primary-foreground text-base sm:text-lg">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-semibold sm:text-base">{user.username}</h3>
              <p className="text-muted-foreground text-xs sm:text-sm">Profile Picture</p>
            </div>
          </div>

          <Separator />

          {/* User Details Grid */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <MdPerson className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium sm:text-sm">Username</p>
                  <p className="text-muted-foreground truncate text-xs sm:text-sm">
                    {user.username}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 sm:gap-3">
                <MdEmail className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium sm:text-sm">Email</p>
                  <p className="text-muted-foreground truncate text-xs sm:text-sm">{user.email}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <MdAccountCircle className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                <div>
                  <p className="text-xs font-medium sm:text-sm">Account Type</p>
                  <Badge variant="secondary" className="mt-1 text-[10px] sm:text-xs">
                    {user.userType === UserType.DEFAULT
                      ? 'Regular Account'
                      : user.userType === UserType.GOOGLE
                        ? 'Google'
                        : 'Facebook'}
                  </Badge>
                </div>
              </div>

              <div className="flex items-start gap-2 sm:gap-3">
                <MdSecurity className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                <div>
                  <p className="text-xs font-medium sm:text-sm">Status</p>
                  <Badge
                    variant={user.status === UserStatus.ACTIVE ? 'default' : 'destructive'}
                    className="mt-1 text-[10px] sm:text-xs"
                  >
                    {user.status === UserStatus.ACTIVE
                      ? 'Active'
                      : user.status === UserStatus.INACTIVE
                        ? 'Inactive'
                        : user.status === UserStatus.BANNED
                          ? 'Banned'
                          : 'Unknown'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Components */}
      <ProfileEditDialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen} user={user} />
    </div>
  );
};

export default ProfileInfoTab;
