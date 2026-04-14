'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  MdDashboard,
  MdPeople,
  MdSchool,
  MdCategory,
  MdSecurity,
  MdSettings,
  MdLogout,
  MdLocalOffer,
  MdShoppingCart,
  MdArticle,
  MdComment,
  MdPermMedia,
  MdRateReview,
  MdEmojiEvents,
} from 'react-icons/md';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUser, useAuthStore } from '@/stores/auth-store';
import { signOut, useSession } from 'next-auth/react';
import { ROUTE_CONFIG } from '@/configs/routes';

const menuItems = [
  {
    title: 'Dashboard',
    url: '/admin/dashboard',
    icon: MdDashboard,
  },
  {
    title: 'Users',
    url: '/admin/users',
    icon: MdPeople,
  },
  {
    title: 'Courses',
    url: '/admin/courses',
    icon: MdSchool,
  },
  {
    title: 'Contests',
    url: '/admin/contests',
    icon: MdEmojiEvents,
  },
  {
    title: 'Categories',
    url: '/admin/categories',
    icon: MdCategory,
  },
  {
    title: 'Blogs',
    url: '/admin/blogs',
    icon: MdArticle,
  },
  {
    title: 'Comments',
    url: '/admin/comments',
    icon: MdComment,
  },
  {
    title: 'Reviews',
    url: '/admin/reviews',
    icon: MdRateReview,
  },
  {
    title: 'Media',
    url: '/admin/media',
    icon: MdPermMedia,
  },
  {
    title: 'Coupons',
    url: '/admin/coupons',
    icon: MdLocalOffer,
  },
  {
    title: 'Orders',
    url: '/admin/orders',
    icon: MdShoppingCart,
  },
  {
    title: 'Roles',
    url: '/admin/roles',
    icon: MdSecurity,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useUser();
  const { data: session } = useSession();
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    if (session && (session?.provider === 'google' || session?.provider === 'facebook')) {
      await signOut({ redirect: false });
    }
    await logout();
    router.push('/auth/sign-in');
  };

  // Generate initials from username
  const initials = user?.username?.slice(0, 2).toUpperCase() || 'AD';

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="shrink-0 border-b p-6">
        <Link href={ROUTE_CONFIG.HOME} className="flex min-w-0 items-center gap-3">
          <div className="bg-primary text-primary-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
            <MdSchool className="h-4 w-4" />
          </div>
          <h2 className="truncate text-lg font-semibold">LMS Admin</h2>
        </Link>
      </SidebarHeader>

      <SidebarContent className="min-h-0 flex-1 overflow-x-hidden px-4 py-4">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={pathname === item.url}>
                <Link href={item.url} className="flex min-w-0 items-center gap-3 px-3 py-2">
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        <SidebarSeparator className="my-4" />

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/admin/settings" className="flex min-w-0 items-center gap-3 px-3 py-2">
                <MdSettings className="h-4 w-4 shrink-0" />
                <span className="truncate">Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="shrink-0 border-t p-4">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src="/avatar.jpg" alt={user?.username} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user?.username}</p>
            <p className="text-muted-foreground truncate text-xs">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground"
            title="Logout"
          >
            <MdLogout className="h-4 w-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
