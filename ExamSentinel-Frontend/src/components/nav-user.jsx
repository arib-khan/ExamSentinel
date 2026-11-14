// "use client";
// import { useNavigate } from "react-router-dom";
// import {
//   BadgeCheck,
//   Bell,
//   ChevronsUpDown,
//   ClipboardList,
//   CreditCard,
//   Key,
//   LogOut,
//   Sparkles,
// } from "lucide-react";
// import { useState } from "react";

// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuGroup,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import {
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
//   useSidebar,
// } from "@/components/ui/sidebar";
// import {
//   AlertDialog,
//   AlertDialogContent,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogCancel,
//   AlertDialogAction,
// } from "@/components/ui/alert-dialog";

// export function NavUser({ user }) {
//   const { isMobile } = useSidebar();
//   const navigate = useNavigate();

//   const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     navigate("/login");
//   };

//   return (
//     <>
//       <SidebarMenu>
//         <SidebarMenuItem>
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <SidebarMenuButton
//                 size="lg"
//                 className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
//               >
//                 <Avatar className="h-8 w-8 rounded-lg">
//                   <AvatarImage
//                     src={user.avatar}
//                     alt={user.name}
//                     loading="lazy"
//                   />
//                   <AvatarFallback className="rounded-lg">SD</AvatarFallback>
//                 </Avatar>
//                 <div className="grid flex-1 text-left text-sm leading-tight">
//                   <span className="truncate font-semibold">{user.name}</span>
//                   <span className="truncate text-xs">{user.email}</span>
//                 </div>
//                 <ChevronsUpDown className="ml-auto size-4" />
//               </SidebarMenuButton>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent
//               className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
//               side={isMobile ? "bottom" : "right"}
//               align="end"
//               sideOffset={4}
//             >
//               <DropdownMenuLabel className="p-0 font-normal">
//                 <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
//                   <Avatar className="h-8 w-8 rounded-lg">
//                     <AvatarImage src={user.avatar} alt={user.name} />
//                     <AvatarFallback className="rounded-lg">CN</AvatarFallback>
//                   </Avatar>
//                   <div className="grid flex-1 text-left text-sm leading-tight">
//                     <span className="truncate font-semibold">{user.name}</span>
//                     <span className="truncate text-xs">{user.email}</span>
//                   </div>
//                 </div>
//               </DropdownMenuLabel>
//               <DropdownMenuSeparator />
//               <DropdownMenuGroup>
//                 <DropdownMenuItem onClick={() => navigate('/admin/profile')}>
//                   <BadgeCheck />
//                   My Profile
//                 </DropdownMenuItem>
//               </DropdownMenuGroup>
//               <DropdownMenuSeparator />
//               <DropdownMenuGroup>
//                 <DropdownMenuItem
//                   onClick={() => navigate("/admin/notifications")}
//                 >
//                   <Bell />
//                   Notifications
//                 </DropdownMenuItem>
//                 <DropdownMenuItem onClick={() => navigate('/admin/change-password')}>
//                   <Key />
//                   Change Password
//                 </DropdownMenuItem>
//                 <DropdownMenuItem onClick={() => navigate('/admin/activity')}>
//                   <ClipboardList />
//                   Activity Logs
//                 </DropdownMenuItem>

//               </DropdownMenuGroup>
//               <DropdownMenuSeparator />
//               <DropdownMenuItem
//                 onClick={() => {
//                   // Close dropdown, then open confirmation
//                   setTimeout(() => {
//                     setShowLogoutConfirm(true);
//                   }, 0);
//                 }}
//               >
//                 <LogOut />
//                 Log out
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </SidebarMenuItem>
//       </SidebarMenu>

//       {/* AlertDialog rendered outside dropdown */}
//       <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>
//               Are you sure you want to log out?
//             </AlertDialogTitle>
//             <AlertDialogDescription>
//               You’ll be redirected to the login page and logged out of your
//               account.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction onClick={handleLogout}>Logout</AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </>
//   );
// }

"use client";
import { useNavigate } from "react-router-dom";
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  ClipboardList,
  CreditCard,
  Key,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { usePermissions } from "@/contexts/PermissionContext";
import { PermissionGate } from "@/components/PermissionGate";

export function NavUser() {
  const userDetails = sessionStorage.getItem("userData");
  const avatar = "https://i.pravatar.cc/150?img=2";
  const {
    user_name,
    user_id,
  } = userDetails ? JSON.parse(userDetails) : {};

  const { isMobile } = useSidebar();
  const navigate = useNavigate();
  const { userRole } = usePermissions();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("userData");
    navigate("/login");
  };

  // Get role-based routes
  const getRoleBasedRoutes = () => {
    switch (userRole) {
      case 1: // Admin
        return {
          profile: '/admin/profile',
          notifications: '/admin/notifications',
          changePassword: '/admin/change-password',
          activityLogs: '/admin/activity'
        };
      case 2: // Client (Institute)
        return {
          profile: '/client/profile',
          notifications: '/client/notifications',
          changePassword: '/client/change-password',
          activityLogs: null // Clients might not have activity logs
        };
      case 3: // Class Invigilator
        return {
          profile: '/class-invigilator/profile',
          notifications: '/class-invigilator/notifications',
          changePassword: '/class-invigilator/change-password',
          activityLogs: null // Class invigilators might not have activity logs
        };
      default:
        return {
          profile: '/admin/profile',
          notifications: '/admin/notifications',
          changePassword: '/admin/change-password',
          activityLogs: '/admin/activity'
        };
    }
  };

  const routes = getRoleBasedRoutes();

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={avatar}
                    alt={user_name}
                    loading="lazy"
                  />
                  <AvatarFallback className="rounded-lg">
                    {user_name ? user_name.charAt(0).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user_name}</span>
                  <span className="truncate text-xs">{user_id}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
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
                    <AvatarImage src={avatar} alt={user_name} />
                    <AvatarFallback className="rounded-lg">
                      {user_name ? user_name.charAt(0).toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user_name}</span>
                    <span className="truncate text-xs">{user_id}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* Profile - Available for all roles with permission check */}
              <DropdownMenuGroup>
                <PermissionGate module="user_management" action="read">
                  <DropdownMenuItem onClick={() => navigate(routes.profile)}>
                    <BadgeCheck />
                    My Profile
                  </DropdownMenuItem>
                </PermissionGate>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              {/* Navigation items based on permissions */}
              <DropdownMenuGroup>
                {/* Notifications - Available for all roles with permission check */}
                <PermissionGate module="notifications" action="read">
                  <DropdownMenuItem onClick={() => navigate(routes.notifications)}>
                    <Bell />
                    Notifications
                  </DropdownMenuItem>
                </PermissionGate>

                {/* Change Password - Available for all roles with permission check */}
                <PermissionGate module="user_management" action="update">
                  <DropdownMenuItem onClick={() => navigate(routes.changePassword)}>
                    <Key />
                    Change Password
                  </DropdownMenuItem>
                </PermissionGate>

                {/* Activity Logs - Only show if route exists and user has permission */}
                {routes.activityLogs && (
                  <PermissionGate module="user_management" action="read">
                    <DropdownMenuItem onClick={() => navigate(routes.activityLogs)}>
                      <ClipboardList />
                      Activity Logs
                    </DropdownMenuItem>
                  </PermissionGate>
                )}
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              {/* Logout - Always available */}
              <DropdownMenuItem
                onClick={() => {
                  // Close dropdown, then open confirmation
                  setTimeout(() => {
                    setShowLogoutConfirm(true);
                  }, 0);
                }}
              >
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      {/* AlertDialog rendered outside dropdown */}
      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to log out?
            </AlertDialogTitle>
            <AlertDialogDescription>
              You'll be redirected to the login page and logged out of your
              account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>Logout</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}