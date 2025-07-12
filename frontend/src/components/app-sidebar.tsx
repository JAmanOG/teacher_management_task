"use client";
import React from "react";
import {
  Calendar,
  Home,
  Users,
  BookOpen,
  Shield,
  
  LogOut,
  Clock,
  MessageSquare,
  GraduationCap,
  Bell,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}
export function AppSidebar({ activeTab, onTabChange }: SidebarProps) {
  const {
    setOpenMobile,
    isMobile,
  } = useSidebar();

  const items = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
      permission: null,
    },
    {
      id: "teachers",
      label: "Teachers",
      icon: Users,
      permission: "view_teachers",
    },
    {
      id: "students",
      label: "Students",
      icon: GraduationCap,
      permission: "view_teachers",
    },
    {
      id: "classes",
      label: "Classes",
      icon: Users,
      permission: "manage_system",
    },
    {
      id: "chapters",
      label: "Chapters",
      icon: BookOpen,
      permission: "edit_lessons",
    },  
    {
      id: "lessons",
      label: "Lesson Tracker",
      icon: BookOpen,
      permission: "view_lessons",
    },
    {
      id: "schedule",
      label: "Schedule",
      icon: Calendar,
      permission: "view_lessons",
    },
    {
      id: "checkin",
      label: "Check In/Out",
      icon: Clock,
      permission: null,
      roleRestriction: "Teacher",
    },
    {
      id: "comments",
      label: "Comments",
      icon: MessageSquare,
      permission: "view_teachers",
    },  
    // {
    //   id: "reports",
    //   label: "Reports",
    //   icon: BarChart3,
    //   permission: "view_reports",
    // },
    {
      id: "student-creation",
      label: "Student Creation",
      icon: GraduationCap,
      permission: "manage_system",
      },
    {
      id: "roles",
      label: "Role Management",
      icon: Shield,
      permission: "manage_roles",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      permission: "view_teachers",
    },
  ];

  const { user, logout } = useAuth();

  const hasPermission = (permission: string | null) => {
    if (!permission) return true;
    return user?.permissions?.includes(permission) || false;
  };

  const getInitials = (fullName: string) => {
    if (!fullName) return "U";
    return fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const availableItems = items.filter((item) => {
    const hasRequiredPermission = hasPermission(item.permission)
    const hasRoleAccess = !item.roleRestriction || user?.role === item.roleRestriction
    return hasRequiredPermission && hasRoleAccess
  })


  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarContent className="bg-[#0c2630] text-[#f2fbfa]">
        {/* Header */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-0">
            <div className="flex items-center gap-2 px-2 py-1">
              <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <div className="group-data-[collapsible=icon]:hidden">
                <h2 className="font-semibold text-sm text-white">EduManage</h2>
                <p className="text-xs text-muted-foreground ">
                  School Management
                </p>
              </div>
            </div>
          </SidebarGroupLabel>
        </SidebarGroup>

        {/* User Info */}
        {user && (
          <SidebarGroup>
            <SidebarGroupContent>
              <div className="flex items-center gap-2 px-2 py-3 border-b border-border/50">
                {/* <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-medium text-sm"> */}
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-white border-[1px] font-medium text-sm">
                  {getInitials(user.fullName)}
                </div>
                <div className="group-data-[collapsible=icon]:hidden flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{user.fullName}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {user.role}
                  </p>
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Navigation */}
        <SidebarGroup className="flex-1">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {availableItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      tooltip={item.label}
                      className={cn(
                        "w-full h-10",
                        isActive &&
                          "border-l-2 border-[#cebc84] shadow-sm shadow-amber-500 text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                      )}
                      onClick={() => {
                        onTabChange(item.id);
                        if (isMobile) {
                          setOpenMobile(false);
                        }
                      }}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="group-data-[collapsible=icon]:hidden">
                        {item.label}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="bg-[#0c2630] text-[#f2fbfa]">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Sign Out"
              className="w-full h-10 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
              <span className="group-data-[collapsible=icon]:hidden">
                Sign Out
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
