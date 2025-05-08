import * as React from "react";
import { LayoutGrid, List, MoreVerticalIcon, UserIcon } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Toaster } from "sonner";
import { Link, useLocation, Outlet } from "react-router-dom";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { cn } from "@/lib/utils";
import LogoutButton from "./LogoutButton";
import ProtectedRoute from "./ProtectedRoute";
export interface AppSidebarItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface AppSidebarGroup {
  title: string;
  collapsible?: boolean;
  items: AppSidebarItem[];
}

interface SidebarLayoutProps {
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  sidebarGroups: AppSidebarGroup[];
  isItemActive: (item: AppSidebarItem) => boolean;
}

function SidebarLayout({
  user,
  sidebarGroups,
  isItemActive,
}: SidebarLayoutProps) {
  const { isMobile } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <div className="flex items-center gap-3">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <LayoutGrid className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="text-sm font-semibold">Scrape Wise</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {sidebarGroups.map((group) => {
          return (
            <SidebarGroup key={group.title}>
              <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item: AppSidebarItem) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        tooltip={item.title}
                        className={cn(
                          isItemActive(item) &&
                            "bg-accent text-accent-foreground"
                        )}
                      >
                        <Link to={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg grayscale">
                    <AvatarFallback className="rounded-lg">
                      <UserIcon className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsed=true]:hidden">
                    <span className="truncate font-medium">
                      {user.firstName} {user.lastName}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                  <MoreVerticalIcon className="ml-auto size-4 group-data-[collapsed=true]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarFallback className="rounded-lg">
                        <UserIcon className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">
                        {user.firstName} {user.lastName}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings">
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LogoutButton />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export function AppLayout() {
  const location = useLocation();
  const isItemActive = (item: AppSidebarItem) => {
    return (
      location.pathname === item.url ||
      location.pathname.startsWith(`${item.url}/`)
    );
  };

  const sidebarGroups: AppSidebarGroup[] = [
    {
      title: "dashboard",
      items: [
        {
          title: "dashboard",
          url: "/dashboard",
          icon: LayoutGrid,
        },
        {
          title: "scraper search",
          url: "/scraper-search",
          icon: LayoutGrid,
        },
        {
          title: "Jobs",
          url: "/jobs",
          icon: List,
        },
      ],
    },
  ];

  return (
    <ProtectedRoute>
      <SidebarProvider defaultOpen={true}>
        <SidebarLayout
          user={{
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@example.com",
          }}
          sidebarGroups={sidebarGroups}
          isItemActive={isItemActive}
        />

        <SidebarInset>
          <header className="sticky top-0 z-10 border-b bg-background p-4 shadow-sm">
            <SidebarTrigger />
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <Outlet />
          </main>
        </SidebarInset>
        <Toaster />
      </SidebarProvider>
    </ProtectedRoute>
  );
}
