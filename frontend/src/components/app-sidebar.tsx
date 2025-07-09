"use client";
import React from "react";
import {
  Calendar,
  Home,
  Inbox,
  Search,
  Settings,
  User2,
  ChevronDown,
  ChevronUp,
  Plus,
  Users,
  BookOpen,
  Shield,
  BarChart3,
  LogOut,
  Menu,
  X,
  // GraduationCap,
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
  SidebarGroupAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: any;
  permission: string | null;
  roleRestriction?: string;
}

// export function AppSidebar({activeTab, onTabChange}: SidebarProps) {
//   const {
//     state,
//     open,
//     setOpen,
//     openMobile,
//     setOpenMobile,
//     isMobile,
//     toggleSidebar,
//   } = useSidebar();

//   const items = [
//     {
//       id: "dashboard",
//       label: "Dashboard",
//       icon: Home,
//       permission: null,
//     },
//     {
//       id: "teachers",
//       label: "Teachers",
//       icon: Users,
//       permission: "view_teachers",
//     },
//     {
//       id: "lessons",
//       label: "Lesson Tracker",
//       icon: BookOpen,
//       permission: "view_lessons",
//     },
//     {
//       id: "schedule",
//       label: "Schedule",
//       icon: Calendar,
//       permission: "view_lessons",
//     },
//     {
//       id: "reports",
//       label: "Reports",
//       icon: BarChart3,
//       permission: "view_reports",
//     },
//     {
//       id: "roles",
//       label: "Role Management",
//       icon: Shield,
//       permission: "manage_roles",
//     },
//     {
//       id: "notifications",
//       label: "Notifications",
//       icon: Bell,
//       permission: "view_teachers",
//     },
//     {
//       id: "settings",
//       label: "Settings",
//       icon: Settings,
//       permission: "manage_system",
//     },
//   ];

//   const { user, logout } = useAuth()

//   const hasPermission = (permission: string | null) => {
//     if (!permission) return true
//     return user?.permissions?.includes(permission) || false
//   }

//   const getInitials = (name: string) => {
//     return name
//       .split(" ")
//       .map((n) => n[0])
//       .join("")
//       .toUpperCase()
//       .slice(0, 2)
//   }

//   const availableItems = NAVIGATION_ITEMS.filter((item) => hasPermission(item.permission))

//   return (
//     <Sidebar collapsible="icon">
//       <SidebarContent>
//         <SidebarGroup>
//           <SidebarGroupLabel>Application</SidebarGroupLabel>
//           <SidebarGroupContent>
//             <SidebarMenu>
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <SidebarMenuButton>
//                     Select Workspace
//                     <ChevronDown className="ml-auto" />
//                   </SidebarMenuButton>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent className="w-[--radix-popper-anchor-width]">
//                   <DropdownMenuItem>
//                     <span>Acme Inc</span>
//                   </DropdownMenuItem>
//                   <DropdownMenuItem>
//                     <span>Acme Corp.</span>
//                   </DropdownMenuItem>
//                 </DropdownMenuContent>
//               </DropdownMenu>

//               {items.map((item) => (
//                 <SidebarMenuItem key={item.title}>
//                   <SidebarMenuButton asChild>
//                     <a href={item.url}>
//                       <item.icon />
//                       <span>{item.title}</span>
//                     </a>
//                   </SidebarMenuButton>
//                 </SidebarMenuItem>
//               ))}
//             </SidebarMenu>
//           </SidebarGroupContent>
//         </SidebarGroup>

//         {/* <SidebarGroup>
//           <SidebarGroupLabel>Application</SidebarGroupLabel>
//           <SidebarGroupAction>
//             <Plus /> <span className="sr-only">Add Project</span>
//           </SidebarGroupAction>
//           <SidebarGroupContent></SidebarGroupContent>
//         </SidebarGroup> */}

//         <Collapsible defaultOpen className="group/collapsible">
//           <SidebarGroup>
//             <SidebarGroupLabel asChild>
//               <CollapsibleTrigger>
//                 Help
//                 <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
//               </CollapsibleTrigger>
//             </SidebarGroupLabel>
//             <CollapsibleContent>
//               <SidebarGroupContent />
//             </CollapsibleContent>
//           </SidebarGroup>
//         </Collapsible>
//       </SidebarContent>
//       <SidebarFooter>
//         <SidebarMenu>
//           <SidebarMenuItem>
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <SidebarMenuButton>
//                   <User2 /> Username
//                   <ChevronUp className="ml-auto" />
//                 </SidebarMenuButton>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent
//                 side="top"
//                 className="w-[--radix-popper-anchor-width]"
//               >
//                 <DropdownMenuItem>
//                   <span>Account</span>
//                 </DropdownMenuItem>
//                 <DropdownMenuItem>
//                   <span>Billing</span>
//                 </DropdownMenuItem>
//                 <DropdownMenuItem>
//                   <span>Sign out</span>
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </SidebarMenuItem>
//         </SidebarMenu>
//       </SidebarFooter>
//     </Sidebar>
//   );
// }

export function AppSidebar({ activeTab, onTabChange }: SidebarProps) {
  const {
    state,
    open,
    setOpen,
    openMobile,
    setOpenMobile,
    isMobile,
    toggleSidebar,
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
    {
      id: "reports",
      label: "Reports",
      icon: BarChart3,
      permission: "view_reports",
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

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
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
      <SidebarContent>
        {/* Header */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-0">
            <div className="flex items-center gap-2 px-2 py-1">
              <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
              <div className="group-data-[collapsible=icon]:hidden">
                <h2 className="font-semibold text-sm">EduManage</h2>
                <p className="text-xs text-muted-foreground">
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
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-medium text-sm">
                  {getInitials(user.name)}
                </div>
                <div className="group-data-[collapsible=icon]:hidden flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{user.name}</p>
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
                          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
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
      <SidebarFooter>
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
