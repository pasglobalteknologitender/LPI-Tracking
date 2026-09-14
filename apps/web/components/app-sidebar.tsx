'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Ship, Users, LogOut, ChevronUp, Package2, Logs } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ROLE_LABELS, type Permission } from '@/lib/permissions';

type NavItem = {
  title: string;
  url: string;
  icon: typeof Package2;
  permission?: Permission;
};

const navItems: NavItem[] = [
  {
    title: 'Shipments',
    url: '/shipments',
    icon: Package2,
  },
  {
    title: 'Logs',
    url: '/logs',
    icon: Logs,
    permission: 'view_logs',
  },
  {
    title: 'Users',
    url: '/users',
    icon: Users,
    permission: 'manage_users',
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user, logout, can } = useAuth();
  const visibleNavItems = navItems.filter(
    (item) => !item.permission || can(item.permission),
  );

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Sidebar className="border-r border-sidebar-border/70 bg-sidebar">
      {/* className="border-b border-sidebar-border" */}
      <SidebarHeader>
        <div className="flex items-center gap-3 px-3 pt-4 pb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-blue-700/20">
            <Ship className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight">
              Link Pasific Indonusa
            </span>
            <span className="text-xs text-muted-foreground">
              Shipment Tracker
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-2">
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {visibleNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(item.url)}
                    tooltip={item.title}
                    className="h-11 rounded-2xl text-muted-foreground transition-all duration-200 hover:bg-blue-50 hover:text-foreground data-[active=true]:bg-primary data-[active=true]:text-white data-[active=true]:shadow-lg data-[active=true]:shadow-blue-700/20"
                  >
                    <Link href={item.url} className="!p-3">
                      <item.icon className="h-4 w-4" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/70 p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="h-14 rounded-2xl data-[state=open]:bg-muted/70 hover:bg-muted/70 transition-colors"
                >
                  <Avatar className="h-9 w-9 ring-2 ring-blue-100">
                    <AvatarFallback className="bg-primary text-white text-xs font-semibold">
                      {user ? getInitials(user.name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-1 flex-col text-left text-sm">
                    <span className="truncate font-semibold">{user?.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user?.role ? ROLE_LABELS[user.role] : user?.email}
                    </span>
                  </div>
                  <ChevronUp className="ml-auto h-4 w-4 text-muted-foreground" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-2xl"
                side="top"
                align="start"
              >
                <DropdownMenuItem
                  onClick={logout}
                  className="text-destructive focus:text-destructive rounded-lg"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
