'use client';

import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useEffect, useRef } from 'react';
import { AdminHeader } from '../admin/admin-header';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  actions?: React.ReactNode;
  showTopActions?: boolean;
}

export function AdminLayout({ children, title, actions, showTopActions = true }: AdminLayoutProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Prevent body scrolling when admin layout is mounted
  useEffect(() => {
    // Store original overflow style
    const originalOverflow = document.body.style.overflow;

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <SidebarProvider>
      <div className="bg-background fixed inset-0 flex h-full w-full overflow-hidden">
        <AdminSidebar />
        <div ref={scrollContainerRef} className="h-full flex-1 overflow-x-hidden overflow-y-auto">
          <AdminHeader title={title || ''} />
          <main className="bg-muted/10 p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
