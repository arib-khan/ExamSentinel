// import * as React from "react";
// import {
//   AudioWaveform,
//   BookOpen,
//   Bot,
//   Command,
//   Frame,
//   GalleryVerticalEnd,
//   Map,
//   PieChart,
//   Settings2,
//   SquareTerminal,
//   User,
// } from "lucide-react";

// import { NavMain } from "./nav-main";
// import { NavProjects } from "./nav-projects";
// import { NavUser } from "./nav-user";
// import { TeamSwitcher } from "./team-switcher";
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarFooter,
//   SidebarHeader,
//   SidebarRail,
// } from "./ui/sidebar";
// import { Users } from "lucide-react";
// import { Settings2Icon } from "lucide-react";
// import { BarChart2 } from "lucide-react";
// import { FileText } from "lucide-react";
// import { ClipboardList } from "lucide-react";
// import { LayoutDashboard } from "lucide-react";
// import { GraduationCap } from "lucide-react";
// import { Building } from "lucide-react";
// import { Building2 } from "lucide-react";

// // Sample data
// export const data = {
//   user: {
//     name: "Sunil Dharawat",
//     email: "Sunil@gmail.com",
//     avatar: "https://i.pravatar.cc/150?img=2",
//   },
//   teams: [
//     {
//       name: "Exam Pro",
//       logo: GalleryVerticalEnd,
//       plan: "Online Exam Software",
//     },
//   ],
//   navMain: [
//     {
//       title: "Dashboard",
//       url: "/dashboard",
//       icon: LayoutDashboard,
//       isActive: false,
//       items: [{ title: "Admin", url: "/admin/dashboard" }],
//     },
//     {
//       title: "Students",
//       url: "#",
//       icon: Users,
//       items: [
//         { title: "Student List", url: "/admin/students/list" },
//         { title: "Register Student", url: "/admin/students/register" },
//         { title: "Upload Bulk", url: "/admin/students/bulk-upload" },
//       ],
//     },
//     {
//       title: "Exams",
//       url: "#",
//       icon: ClipboardList,
//       items: [
//         { title: "Exam List", url: "/admin/exams/list" },
//         { title: "Create Exam", url: "/admin/exams/create" },
//         { title: "Schedule Exam", url: "/admin/exams/schedule" },
//       ],
//     },
//     {
//       title: "Questions",
//       url: "#",
//       icon: FileText,
//       items: [
//         { title: "Question Bank", url: "/admin/questions" },
//         { title: "Add Question", url: "/admin/questions/add" },
//         { title: "Bulk Upload", url: "/admin/questions/bulk-upload" },
//       ],
//     },
//     {
//       title: "Results",
//       url: "#",
//       icon: BarChart2,
//       items: [
//         { title: "Result Summary", url: "/admin/results" },
//         { title: "Download Reports", url: "/admin/reports" },
//       ],
//     },
//     {
//       title: "Institution",
//       url: "#",
//       icon: GraduationCap,
//       items: [
//         { title: "Add Institution Profile", url: "/admin/institution/profile" },
//         { title: "Institution List", url: "/admin/institution/list" },
//       ],
//     },
//     {
//       title: "Center",
//       url: "#",
//       icon: Building2,
//       items: [
//         { title: "Add Center Profile", url: "/admin/center/profile" },
//         { title: "Center List", url: "/admin/center/list" },
//       ],
//     },
//     {
//       title: "User Management",
//       url: "#",
//       icon: Users,
//       items: [
//         { title: "Add User", url: "/admin/users/create" },
//         { title: "System Settings", url: "/admin/settings/system" },
//         { title: "Manage Roles", url: "/admin/settings/roles" },
//       ],
//     },
//   ],
//   // projects: [
//   //   {
//   //     name: "Design Engineering",
//   //     url: "#",
//   //     icon: Frame,
//   //   },
//   //   {
//   //     name: "Sales & Marketing",
//   //     url: "#",
//   //     icon: PieChart,
//   //   },
//   //   {
//   //     name: "Travel",
//   //     url: "#",
//   //     icon: Map,
//   //   },
//   // ],
// };

// export function AppSidebar(props) {
//   return (
//     <Sidebar collapsible="icon" {...props}>
//       <SidebarHeader>
//         <TeamSwitcher teams={data.teams} />
//       </SidebarHeader>
//       <SidebarContent>
//         <NavMain items={data.navMain} />
//         {/* <NavProjects projects={data.projects} /> */}
//       </SidebarContent>
//       <SidebarFooter>
//         <NavUser user={data.user} />
//       </SidebarFooter>
//       <SidebarRail />
//     </Sidebar>
//   );
// }



// Updated components/app-sidebar.jsx
import * as React from "react";
import {
  GalleryVerticalEnd,
  LayoutDashboard,
  Users,
  ClipboardList,
  FileText,
  BarChart2,
  GraduationCap,
  Building2,
  UserCheck,
  MessagesSquare
} from "lucide-react";

import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { TeamSwitcher } from "./team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "./ui/sidebar";
import { usePermissionMenu } from "@/contexts/hooks/usePermissionMenu";

// Icon mapping for dynamic icons
const iconMap = {
  LayoutDashboard,
  Users,
  ClipboardList,
  FileText,
  BarChart2,
  GraduationCap,
  Building2,
  UserCheck,
  MessagesSquare
};

// Static data that doesn't require permissions

export const staticData = {
  teams: [
    {
      name: "ExamSentinel",
      logo: GalleryVerticalEnd,
      plan: "Online Exam Software",
    },
  ],
};

export function AppSidebar(props) {
  const { filteredMenu, loading } = usePermissionMenu();

  // Transform menu config to sidebar format
  const transformedMenu = React.useMemo(() => {
    return filteredMenu.map(menuItem => ({
      title: menuItem.title,
      url: menuItem.url || "#",
      icon: menuItem.icon || Users,
      isActive: false,
      items: menuItem.items?.map(item => ({
        title: item.title,
        url: item.url
      })) || []
    }));
  }, [filteredMenu]);

  if (loading) {
    return (
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          <TeamSwitcher teams={staticData.teams} />
        </SidebarHeader>
        <SidebarContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </SidebarContent>
        <SidebarFooter>
          <NavUser />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    );
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={staticData.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={transformedMenu} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}