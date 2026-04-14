'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ROUTE_CONFIG } from '@/configs/routes';
import { DEFAULT_AVATAR } from '@/constants';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';
import { MdArticle, MdEmojiEvents, MdLogout, MdPerson, MdSchool, MdSettings } from 'react-icons/md';
import { Award, Trophy } from 'lucide-react';

export type ProfileTab =
  | 'account'
  | 'courses'
  | 'contests'
  | 'posts'
  | 'achievements'
  | 'certificates'
  | 'settings';

interface ProfileSidebarProps {
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
}

const sidebarItems = [
  {
    id: 'account' as ProfileTab,
    label: 'Account',
    icon: MdPerson,
  },
  {
    id: 'courses' as ProfileTab,
    label: 'My Courses',
    icon: MdSchool,
  },
  {
    id: 'contests' as ProfileTab,
    label: 'My Contests',
    icon: Trophy,
  },
  {
    id: 'posts' as ProfileTab,
    label: 'My Posts',
    icon: MdArticle,
  },
  {
    id: 'achievements' as ProfileTab,
    label: 'Achievements',
    icon: MdEmojiEvents,
  },
  {
    id: 'certificates' as ProfileTab,
    label: 'Certificates',
    icon: Award,
  },
  {
    id: 'settings' as ProfileTab,
    label: 'Settings',
    icon: MdSettings,
  },
];

// Profile sidebar component - Arrow function
const ProfileSidebar = ({ activeTab, onTabChange }: ProfileSidebarProps) => {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  // Handle logout - Arrow function
  const handleLogout = () => {
    logout();
    router.push(ROUTE_CONFIG.AUTH.SIGN_IN);
  };

  if (!user) return null;

  const avatarUrl = user.avatar || DEFAULT_AVATAR;
  const userInitials = user.username ? user.username.slice(0, 2).toUpperCase() : 'U';

  return (
    <>
      {/* Desktop Sidebar */}
      <Card className="hidden h-fit border-0 bg-linear-to-br from-white to-gray-50 pt-0 shadow-lg lg:block dark:from-gray-900 dark:to-gray-800">
        <CardContent className="p-0">
          {/* User Profile Header */}
          <div className="from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 flex flex-col items-center justify-center gap-2 bg-linear-to-br p-6">
            <div className="relative">
              <div className="relative h-20 w-20">
                <Avatar className="mx-auto mb-4 h-full w-full shadow-lg ring-4 ring-white/50">
                  <AvatarImage src={avatarUrl} alt={user.username} />
                  <AvatarFallback className="from-primary to-primary/80 bg-linear-to-br text-lg font-bold text-white">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                {/* Online indicator */}
                <div className="absolute right-0 bottom-2 size-3 rounded-full border-2 border-white bg-green-500 shadow-sm"></div>
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{user.username}</h3>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{user.email}</p>
          </div>

          <Separator className="border-gray-200 dark:border-gray-700" />

          {/* Navigation Items */}
          <div className="p-3">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  className={`mb-2 h-12 w-full justify-start font-medium transition-all duration-200 ${
                    isActive
                      ? 'from-primary to-primary/90 scale-[1.02] transform bg-gradient-to-r text-white shadow-md hover:text-white hover:shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
                  }`}
                  onClick={() => onTabChange(item.id)}
                >
                  <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : ''}`} />
                  {item.label}
                </Button>
              );
            })}

            <Separator className="my-4 border-gray-200 dark:border-gray-700" />

            {/* Logout Button */}
            <Button
              variant="ghost"
              className="h-12 w-full justify-start font-medium text-red-600 transition-all duration-200 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/20"
              onClick={handleLogout}
            >
              <MdLogout className="mr-3 h-5 w-5" />
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Navigation */}
      <div className="space-y-3 sm:space-y-4 lg:hidden">
        {/* User Profile Card - Mobile */}
        <Card className="border-0 bg-linear-to-br from-white to-gray-50 shadow-md dark:from-gray-900 dark:to-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-14 w-14 shadow-md ring-2 ring-white/50 sm:h-16 sm:w-16">
                  <AvatarImage src={avatarUrl} alt={user.username} />
                  <AvatarFallback className="from-primary to-primary/80 bg-linear-to-br text-sm font-bold text-white sm:text-base">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                {/* Online indicator */}
                <div className="absolute right-0 bottom-0 size-2.5 rounded-full border-2 border-white bg-green-500 shadow-sm sm:size-3"></div>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-base font-bold text-gray-900 sm:text-lg dark:text-white">
                  {user.username}
                </h3>
                <p className="truncate text-xs text-gray-600 sm:text-sm dark:text-gray-400">
                  {user.email}
                </p>
              </div>
              {/* Logout Button - Mobile */}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 shrink-0 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 sm:h-9 sm:w-9 dark:hover:bg-red-950/20"
                onClick={handleLogout}
              >
                <MdLogout className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Horizontal Tabs - Mobile */}
        <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <Button
                key={item.id}
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                className={`flex h-9 shrink-0 items-center gap-1.5 px-3 text-xs font-medium transition-all duration-200 sm:h-10 sm:gap-2 sm:px-4 sm:text-sm ${
                  isActive
                    ? 'from-primary to-primary/90 bg-gradient-to-r shadow-md'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                onClick={() => onTabChange(item.id)}
              >
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="whitespace-nowrap">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default ProfileSidebar;
