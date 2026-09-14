'use client';

import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Separator } from '@/components/ui/separator';
import { Toaster } from '@/components/ui/sonner';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex min-h-screen min-w-0 flex-col bg-background">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b border-border/60 bg-white/85 px-4 backdrop-blur-xl sm:px-6">
          <SidebarTrigger className="-ml-1 rounded-xl hover:bg-muted transition-colors" />
          <Separator orientation="vertical" className="h-5" />

          <span className="text-sm font-semibold text-foreground">
            Link Pasific Portal
          </span>
        </header>
        <main className="min-w-0 flex-1 overflow-auto">{children}</main>
      </SidebarInset>
      <Toaster position="top-right" richColors />
    </SidebarProvider>
  );
}
