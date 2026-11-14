// // import { Outlet, useLocation, useNavigate } from "react-router-dom";
// // import { AppSidebar } from "@/components/app-sidebar";
// // import {
// //   Breadcrumb,
// //   BreadcrumbItem,
// //   BreadcrumbList,
// //   BreadcrumbPage,
// //   BreadcrumbSeparator,
// // } from "@/components/ui/breadcrumb";
// // import { Separator } from "@/components/ui/separator";
// // import {
// //   SidebarInset,
// //   SidebarProvider,
// //   SidebarTrigger,
// // } from "@/components/ui/sidebar";
// // import { ModeToggle } from "@/constants/mode-toggel";
// // import { Toaster } from "sonner";
// // import { Bell } from "lucide-react";

// // export default function Sidebar() {
// //   const navigate = useNavigate();
// //   const location = useLocation();

// //   const pathnames = location.pathname.split("/").filter(Boolean);

// //   return (
// //     <SidebarProvider>
// //       <AppSidebar />
// //       <SidebarInset>
// //         <header className="flex h-16 shrink-0 items-center gap-2 px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
// //           <div className="flex items-center gap-2">
// //             <SidebarTrigger className="-ml-1" />
// //             <Separator orientation="vertical" className="mr-2 h-4" />
// //             <Breadcrumb>
// //               <BreadcrumbList>
// //                 {pathnames.map((segment, index) => (
// //                   <div key={index} className="flex items-center">
// //                     <BreadcrumbItem>
// //                       <BreadcrumbPage className="capitalize">
// //                         {decodeURIComponent(segment)}
// //                       </BreadcrumbPage>
// //                     </BreadcrumbItem>
// //                     {index !== pathnames.length - 1 && <BreadcrumbSeparator />}
// //                   </div>
// //                 ))}
// //               </BreadcrumbList>
// //             </Breadcrumb>
// //           </div>
// //           <div className="flex justify-center items-center gap-2 ml-auto">
// //             <button
// //               onClick={() => navigate("/admin/notifications")}
// //               className="p-2 rounded-full hover:bg-gray-200 transition"
// //               aria-label="Notifications"
// //             >
// //               <Bell className="h-5 w-5 text-gray-700" />
// //             </button>
// //             <ModeToggle />
// //           </div>
// //         </header>

// //         <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
// //           <div className="flex-1 p-4 rounded-xl bg-muted/50 min-h-[calc(100vh-4rem)] overflow-auto">
// //             <Outlet />
// //           </div>
// //         </div>
// //       </SidebarInset>
// //       <Toaster richColors position="top-center" closeButton />
// //     </SidebarProvider>
// //   );
// // }

// // Updated features/sidebar/Sidebar.jsx
// import { Outlet, useLocation, useNavigate } from "react-router-dom";
// import { AppSidebar } from "@/components/app-sidebar";
// import {
//   Breadcrumb,
//   BreadcrumbItem,
//   BreadcrumbList,
//   BreadcrumbPage,
//   BreadcrumbSeparator,
// } from "@/components/ui/breadcrumb";
// import { Separator } from "@/components/ui/separator";
// import {
//   SidebarInset,
//   SidebarProvider,
//   SidebarTrigger,
// } from "@/components/ui/sidebar";
// import { ModeToggle } from "@/constants/mode-toggel";
// import { Toaster } from "sonner";
// import { Bell } from "lucide-react";
// import { PermissionGate } from "@/components/PermissionGate";

// export default function Sidebar() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const pathnames = location.pathname.split("/").filter(Boolean);

//   return (
//     <SidebarProvider>
//       <AppSidebar />
//       <SidebarInset>
//         <header className="flex h-16 shrink-0 items-center gap-2 px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
//           <div className="flex items-center gap-2">
//             <SidebarTrigger className="-ml-1" />
//             <Separator orientation="vertical" className="mr-2 h-4" />
//             <Breadcrumb>
//               <BreadcrumbList>
//                 {pathnames.map((segment, index) => (
//                   <div key={index} className="flex items-center">
//                     <BreadcrumbItem>
//                       <BreadcrumbPage className="capitalize">
//                         {decodeURIComponent(segment)}
//                       </BreadcrumbPage>
//                     </BreadcrumbItem>
//                     {index !== pathnames.length - 1 && <BreadcrumbSeparator />}
//                   </div>
//                 ))}
//               </BreadcrumbList>
//             </Breadcrumb>
//           </div>
//           <div className="flex justify-center items-center gap-2 ml-auto">
//             {/* Notification bell - only show if user has access to notifications */}
//             <PermissionGate module="user_management" action="read">
//               <button
//                 onClick={() => navigate("/admin/notifications")}
//                 className="p-2 rounded-full hover:bg-gray-200 transition"
//                 aria-label="Notifications"
//               >
//                 <Bell className="h-5 w-5 text-gray-700" />
//               </button>
//             </PermissionGate>
//             <ModeToggle />
//           </div>
//         </header>

//         <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
//           <div className="flex-1 p-4 rounded-xl bg-muted/50 min-h-[calc(100vh-4rem)] overflow-auto">
//             <Outlet />
//           </div>
//         </div>
//       </SidebarInset>
//       <Toaster richColors position="top-center" closeButton />
//     </SidebarProvider>
//   );
// }

// Updated features/sidebar/Sidebar.jsx
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ModeToggle } from "@/constants/mode-toggel";
import { Toaster } from "sonner";
import { Bell } from "lucide-react";
import { PermissionGate } from "@/components/PermissionGate";
import { useUserRole } from "@/contexts/UserRoleContext";
import { usePermissions } from "@/contexts/PermissionContext";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { getRoleDisplayName, getBaseRoutePath } = useUserRole();
  const { hasPermission } = usePermissions();

  const pathnames = location.pathname.split("/").filter(Boolean);

  // Get notification route based on user role
  const getNotificationRoute = () => {
    const basePath = getBaseRoutePath();
    return `${basePath}/notifications`;
  };

  // Format breadcrumb segments for better display
  const formatBreadcrumbSegment = (segment) => {
    return segment
      .replace(/-/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {/* Role indicator as first breadcrumb */}
                {/* <BreadcrumbItem>
                  <BreadcrumbPage className="text-muted-foreground font-medium">
                    {getRoleDisplayName()}
                  </BreadcrumbPage>
                </BreadcrumbItem> */}
                {/* {pathnames.length > 0 && <BreadcrumbSeparator />} */}

                {/* Path breadcrumbs */}
                {pathnames.map((segment, index) => (
                  <div key={index} className="flex items-center">
                    <BreadcrumbItem>
                      <BreadcrumbPage className="capitalize">
                        {formatBreadcrumbSegment(decodeURIComponent(segment))}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                    {index !== pathnames.length - 1 && <BreadcrumbSeparator />}
                  </div>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex justify-center items-center gap-2 ml-auto">
            {/* Notification bell - show based on permissions */}
            <PermissionGate module="notifications" action="read">
              <button
                onClick={() => navigate(getNotificationRoute())}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              </button>
            </PermissionGate>
            <ModeToggle />
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex-1 p-4 rounded-xl bg-muted/50 min-h-[calc(100vh-4rem)] overflow-auto">
            <Outlet />
          </div>
        </div>
      </SidebarInset>
      <Toaster richColors position="top-center" closeButton />
    </SidebarProvider>
  );
}