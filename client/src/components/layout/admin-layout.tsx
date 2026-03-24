"use client";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useEffect, useRef } from "react";
import { AdminHeader } from "../admin/admin-header";

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  actions?: React.ReactNode;
  showTopActions?: boolean;
}

export function AdminLayout({
  children,
  title,
  actions,
  showTopActions = true,
}: AdminLayoutProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Prevent body scrolling when admin layout is mounted
  useEffect(() => {
    // Store original overflow style
    const originalOverflow = document.body.style.overflow;

    // Prevent body scroll
    document.body.style.overflow = "hidden";

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <SidebarProvider>
      <div className="fixed inset-0 flex w-full h-full overflow-hidden bg-background">
        <AdminSidebar />
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto overflow-x-hidden h-full"
        >
          <AdminHeader title={title || ""} />
          <main className="p-6 bg-muted/10">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
