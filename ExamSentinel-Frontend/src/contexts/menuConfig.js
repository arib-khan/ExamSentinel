// // config/menuConfig.js
// import {
//   LayoutDashboard,
//   Users,
//   ClipboardList,
//   FileText,
//   BarChart2,
//   GraduationCap,
//   Building2,
//   UserCheck
// } from "lucide-react";
import { liveInterviewAdminMenu, liveInterviewCandidateMenu, CANDIDATE_ROLE_ID } from "@/features/liveInterview/liveInterviewRoutes";

// export const menuConfig = [
//   {
//     id: 'dashboard',
//     title: 'Dashboard',
//     icon: LayoutDashboard,
//     items: [ {
//         title: 'Admin',
//         url: '/admin/dashboard',
//         permission: { module: 'dashboard', action: 'create' }
//       },
//       {
//         title: 'Class Invigilator',
//         url: '/class-invigilator/dashboard',
//         permission: { module: 'class_invigilator_dashboard', action: 'create' }
//       },
//       {
//         title: 'Client Dashboard',
//         url: '/client/dashboard',
//         permission: { module: 'client_dashboard', action: 'create' }
//       },
//     ]
//   },
//   {
//     id: 'students',
//     title: 'Students',
//     icon: Users,
//     permission: { 
//       module: 'students', 
//       actions: ['read', 'create'], 
//       requireAny: true 
//     },
//     items: [
//       {
//         title: 'Student List',
//         url: '/admin/students/list',
//         permission: { module: 'students', action: 'read' }
//       },
//       // {
//       //   title: 'Register Student',
//       //   url: '/admin/students/register',
//       //   permission: { module: 'students', action: 'create' }
//       // },
//       {
//         title: 'Upload Bulk',
//         url: '/admin/students/bulk-upload',
//         permission: { module: 'students', action: 'execute' }
//       }
//     ]
//   },
//   {
//     id: 'exams',
//     title: 'Exams',
//     icon: ClipboardList,
//     permission: { 
//       module: 'exams', 
//       actions: ['read', 'create', 'execute'], 
//       requireAny: true 
//     },
//     items: [
//       {
//         title: 'Exam List',
//         url: '/admin/exams/list',
//         permission: { module: 'exams', action: 'read' }
//       },
//       // {
//       //   title: 'Create Exam',
//       //   url: '/admin/exams/create',
//       //   permission: { module: 'exams', action: 'create' }
//       // },
//       {
//         title: 'Schedule Exam',
//         url: '/admin/exams/schedule',
//         permission: { module: 'exams', action: 'execute' }
//       }
//     ]
//   },
//   {
//     id: 'questions',
//     title: 'Questions',
//     icon: FileText,
//     permission: { 
//       module: 'questions', 
//       actions: ['read', 'create'], 
//       requireAny: true 
//     },
//     items: [
//       {
//         title: 'Question Bank',
//         url: '/admin/questions',
//         permission: { module: 'questions', action: 'read' }
//       },
//       // {
//       //   title: 'Add Question',
//       //   url: '/admin/questions/add',
//       //   permission: { module: 'questions', action: 'create' }
//       // },
//       {
//         title: 'Bulk Upload',
//         url: '/admin/questions/bulk-upload',
//         permission: { module: 'questions', action: 'execute' }
//       }
//     ]
//   },
//   {
//     id: 'results',
//     title: 'Results',
//     icon: BarChart2,
//     permission: { 
//       module: 'results', 
//       actions: ['read', 'execute'], 
//       requireAny: true 
//     },
//     items: [
//       {
//         title: 'Result Summary',
//         url: '/admin/results',
//         permission: { module: 'results', action: 'read' }
//       },
//       {
//         title: 'Download Reports',
//         url: '/admin/reports',
//         permission: { module: 'results', action: 'execute' }
//       }
//     ]
//   },
//   {
//     id: 'institution',
//     title: 'Institution',
//     icon: GraduationCap,
//     permission: { 
//       module: 'institution', 
//       actions: ['read', 'create'], 
//       requireAny: true 
//     },
//     items: [
//       // {
//       //   title: 'Add Institution Profile',
//       //   url: '/admin/institution/profile',
//       //   permission: { module: 'institution', action: 'create' }
//       // },
//       {
//         title: 'Institution List',
//         url: '/admin/institution/list',
//         permission: { module: 'institution', action: 'read' }
//       },
//       {
//         title: 'Verification',
//         url: '/admin/verification',
//         permission: { module: 'institution', action: 'create' }
//       }
//     ]
//   },
//   {
//     id: 'center',
//     title: 'Center',
//     icon: Building2,
//     permission: { 
//       module: 'center', 
//       actions: ['read', 'create'], 
//       requireAny: true 
//     },
//     items: [
//       // {
//       //   title: 'Add Center Profile',
//       //   url: '/admin/center/profile',
//       //   permission: { module: 'center', action: 'create' }
//       // },
//       {
//         title: 'Center List',
//         url: '/admin/center/list',
//         permission: { module: 'center', action: 'read' }
//       }
//     ]
//   },
//   {
//     id: 'user_management',
//     title: 'User Management',
//     icon: UserCheck,
//     permission: { 
//       module: 'user_management', 
//       actions: ['read', 'create'], 
//       requireAny: true 
//     },
//     items: [
//       // {
//       //   title: 'Add User',
//       //   url: '/admin/users/create',
//       //   permission: { module: 'user_management', action: 'create' }
//       // },
//       {
//         title: 'User List',
//         url: '/admin/user-managment',
//         permission: { module: 'user_management', action: 'create' }
//       },
//       // {
//       //   title: 'Add User Roles',
//       //   url: '/admin/user-role/create',
//       //   permission: { module: 'user_management', action: 'create' }
//       // },
//       {
//         title: 'User Role List',
//         url: '/admin/user-role/list',
//         permission: { module: 'user_management', action: 'create' }
//       },
//       {
//         title: 'Profile',
//         url: '/admin/profile',
//         permission: { module: 'user_management', action: 'read' }
//       },
//       {
//         title: 'Change Password',
//         url: '/admin/change-password',
//         permission: { module: 'user_management', action: 'update' }
//       },
//       {
//         title: 'Activity Logs',
//         url: '/admin/activity',
//         permission: { module: 'user_management', action: 'read' }
//       },
//       {
//         title: 'Verification Form',
//         url: '/admin/verification/form',
//         permission: { module: 'biometric_verification', action: 'execute' }
//       },
//       {
//         title: 'Biometric Verification',
//         url: '/admin/verification/capture',
//         permission: { module: 'biometric_verification', action: 'execute' }
//       }
//     ]
//   }
// ];
// config/roleBasedMenuConfig.js
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  FileText,
  BarChart2,
  GraduationCap,
  Building2,
  UserCheck,
  Bell,
  Monitor,
  MonitorCog,
  DownloadCloud,
  Shield,
  ShieldCheck,
  CloudDownload,
  ImportIcon,
  FileUp,
  FileDown,
  Settings2
} from "lucide-react";

// Base menu configuration for all roles
export const roleBasedMenuConfig = {
  // Admin menu configuration (role_id: 1)
  admin: [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: LayoutDashboard,
      items: [
        {
          title: 'Admin Dashboard',
          url: '/admin/dashboard',
          permission: { module: 'dashboard', action: 'create' }
        }
      ]
    },
    liveInterviewAdminMenu, // Live interview module (shown right under Dashboard)
    {
      id: 'students',
      title: 'Students',
      icon: Users,
      permission: { 
        module: 'students', 
        actions: ['read', 'create'], 
        requireAny: true 
      },
      items: [
        {
          title: 'Student List',
          url: '/admin/students/list',
          permission: { module: 'students', action: 'read' }
        },
        {
          title: 'Register Student',
          url: '/admin/students/register',
          permission: { module: 'students', action: 'create' }
        },
        {
          title: 'Upload Bulk',
          url: '/admin/students/bulk-upload',
          permission: { module: 'students', action: 'execute' }
        }
      ]
    },
    {
      id: 'exams',
      title: 'Exams',
      icon: ClipboardList,
      permission: { 
        module: 'exams', 
        actions: ['read', 'create', 'execute'], 
        requireAny: true 
      },
      items: [
        {
          title: 'Exam List',
          url: '/admin/exams/list',
          permission: { module: 'exams', action: 'read' }
        },
        {
          title: 'Create Exam',
          url: '/admin/exams/create',
          permission: { module: 'exams', action: 'create' }
        },
        {
          title: 'Schedule Exam',
          url: '/admin/exams/schedule',
          permission: { module: 'exams', action: 'execute' }
        },
        {
          title: 'Center Mapping',
          url: '/admin/mapping/details',
          permission: { module: 'exams', action: 'execute' }
        },
        {
          title: 'Seat Mapping',
          url: '/admin/seat-mapping/details',
          permission: { module: 'exams', action: 'execute' }
        }
      ]
    },
    // Not in use
    // {
    //   id: 'export_data',
    //   title: 'Export Data',
    //   icon: FileUp,
    //   permission: { 
    //     module: 'data_export', 
    //     actions: ['execute'], 
    //     requireAny: true 
    //   },
    //   items: [
    //     {
    //       title: 'Export Data',
    //       url: '/admin/export/data',
    //       permission: { module: 'data_export', action: 'execute' }
    //     },
     
    //   ]
    // },
    {
      id: 'questions',
      title: 'Questions',
      icon: FileText,
      permission: { 
        module: 'questions', 
        actions: ['read', 'create'], 
        requireAny: true 
      },
      items: [
        {
          title: 'Question Bank',
          url: '/admin/questions',
          permission: { module: 'questions', action: 'read' }
        },
        {
          title: 'Add Question',
          url: '/admin/questions/add',
          permission: { module: 'questions', action: 'create' }
        },
        {
          title: 'Bulk Upload',
          url: '/admin/questions/bulk-upload',
          permission: { module: 'questions', action: 'execute' }
        }
      ]
    },
    {
      id: 'results',
      title: 'Results',
      icon: BarChart2,
      permission: { 
        module: 'results', 
        actions: ['read', 'execute'], 
        requireAny: true 
      },
      items: [
        // {
        //   title: 'Result Summary',
        //   url: '/admin/results',
        //   permission: { module: 'results', action: 'read' }
        // },
        {
          title: 'Download Reports',
          url: '/admin/reports',
          permission: { module: 'results', action: 'execute' }
        }
      ]
    },
    {
      id: 'institution',
      title: 'Institution',
      icon: GraduationCap,
      permission: { 
        module: 'institution', 
        actions: ['read', 'create'], 
        requireAny: true 
      },
      items: [
        {
          title: 'Add Institution Profile',
          url: '/admin/institution/profile',
          permission: { module: 'institution', action: 'create' }
        },
        {
          title: 'Institution List',
          url: '/admin/institution/list',
          permission: { module: 'institution', action: 'read' }
        },
          {
          title: 'Exam Preferences',
          url: '/admin/institution/exam-preferences',
          permission: { module: 'institution', action: 'create' }
        }
        // Not is use 
        // {
        //   title: 'Verification',
        //   url: '/admin/verification',
        //   permission: { module: 'institution', action: 'create' }
        // }
      ]
    },
    {
      id: 'center',
      title: 'Center',
      icon: Building2,
      permission: { 
        module: 'center', 
        actions: ['read', 'create','execute'], 
        requireAny: true 
      },
      items: [
        {
          title: 'Add Center Profile',
          url: '/admin/center/profile',
          permission: { module: 'center', action: 'create' }
        },
        {
          title: 'Center List',
          url: '/admin/center/list',
          permission: { module: 'center', action: 'read' }
        },
        {
          title: 'Center Inventroy List',
          url: '/admin/center-inventroy/list',
          permission: { module: 'center', action: 'read' }
        },
        {
          title: 'Center Inventory Upload',
          url: '/admin/center/inventory-upload',
          permission: { module: 'center', action: 'execute' }
        }
      ]
    },
    {
      id: 'user_management',
      title: 'User Management',
      icon: UserCheck,
      permission: { 
        module: 'user_management', 
        actions: ['read', 'create'], 
        requireAny: true 
      },
      items: [
        {
          title: 'Add User',
          url: '/admin/users/create',
          permission: { module: 'user_management', action: 'create' }
        },
        {
          title: 'User List',
          url: '/admin/user-managment',
          permission: { module: 'user_management', action: 'create' }
        },
        {
          title: 'Change Password',
          url: '/admin/change-password',
          permission: { module: 'user_management', action: 'update' }
        },

      ]
    },
    {
      id: 'access_control',
      title: 'Access Control',
      icon: Settings2,
      permission: { 
        module: 'object_permission', 
        actions: ['execute'], 
        requireAny: true 
      },
      items: [
              {
          title: 'Add User Roles',
          url: '/admin/user-role/create',
          permission: { module: 'user_management', action: 'create' }
        },
        {
          title: 'User Role List',
          url: '/admin/user-role/list',
          permission: { module: 'user_management', action: 'create' }
        },
        {
          title: 'Add Object Permission',
          url: '/admin/object-permission/add',
          permission: { module: 'object_permission', action: 'create' }
        },
        {
          title: 'Object Permission',
          url: '/admin/object-permission/list',
          permission: { module: 'object_permission', action: 'execute' }
        },
        // add permission for system objects
        {
          title: 'Add System Objects',
          url: '/admin/system-objects/add',
          permission: { module: 'system_object', action: 'create' }
        },
        {
          title: 'System Objects',
          url: '/admin/system-objects/list',
          permission: { module: 'system_object', action: 'execute' }
        },
      ]
    },
      {
      id: 'biometric_verification',
      title: 'Biometric Verification', 
      icon: ShieldCheck,
      permission: { 
        module: 'biometric_verification', 
        actions: ['read', 'execute'], 
        requireAny: true 
      },
      items: [
          {
          title: 'Dashboard',
          url: '/admin/biometric/dashboard',
          permission: { module: 'biometric_verification', action: 'execute' }
        },
           {
          title: 'Verification List',
          url: '/admin/biometric/list',
          permission: { module: 'biometric_verification', action: 'execute' }
        },
      
          ]
    },
    {
      id: 'admin_controls',
      title: 'Admin Controls',
      icon: MonitorCog,
      permission: { 
        module: 'admin_controls', 
        actions: ['read', 'create', 'execute'], 
        requireAny: true 
      },
      items: [
              {
          title: 'Exam Controls',
          url: '/admin/exam/controls',
          permission: { module: 'admin_controls', action: 'create' }
        },
        //       {
        //   title: 'Exam Password Generation',
        //   url: '/admin/exam-password/control',
        //   permission: { module: 'admin_controls', action: 'create' }
        // }
      ]
    },
  ],

  // Class Invigilator menu configuration (role_id: 3)
  classInvigilator: [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: LayoutDashboard,
      items: [
        {
          title: 'Class Invigilator Dashboard',
          url: '/class-invigilator/dashboard',
          permission: { module: 'class_invigilator_dashboard', action: 'create' }
        }
      ]
    },
     {
      id: 'import_data',
      title: 'Data Download',
      icon: FileDown,
      permission: { 
        module: 'data_import', 
        actions: ['execute'], 
        requireAny: true 
      },
      items: [
        {
          title: 'Import Data',
          url: '/class-invigilator/import/data',
          permission: { module: 'data_import', action: 'execute' }
        },
     
      ]
    },
    //  {
    //   id: 'questions',
    //   title: 'Image Download', // here we are checking the Question permission and then adding the mix items.
    //   icon: DownloadCloud,
    //   permission: { 
    //     module: 'questions', 
    //     actions: ['read', 'execute'], 
    //     requireAny: true 
    //   },
    //   items: [
    //     {
    //       title: 'Question Images',
    //       url: '/class-invigilator/questions/download',
    //       permission: { module: 'questions', action: 'execute' }
    //     },
    //     {
    //       title: 'Student Images ',
    //       url: '/class-invigilator/students/download',
    //       permission: { module: 'students', action: 'execute' }
    //     },
      
    //   ]
    // },
      {
      id: 'biometric_verification',
      title: 'Verification', 
      icon: ShieldCheck,
      permission: { 
        module: 'biometric_verification', 
        actions: ['read', 'execute'], 
        requireAny: true 
      },
      items: [
        {
        title: 'Biometric Dashboard',
        url: '/class-invigilator/biometric-dashboard',
        permission: { module: 'biometric_verification', action: 'execute' }
      },
        {
        title: 'Biometric Registration',
        url: '/class-invigilator/biometric-registration',
        permission: { module: 'biometric_verification', action: 'execute' }
      },
        //   {
        //   title: 'Seat Rearrangment',
        //   url: '/class-invigilator/seat-rearrangment',
        //   permission: { module: 'seat_rearrangment', action: 'execute' }
        // },
          ]
    },
    // {
    //   id: 'user_management',
    //   title: 'User Management',
    //   icon: UserCheck,
    //   permission: { 
    //     module: 'user_management', 
    //     actions: ['read', 'create', 'update'], 
    //     requireAny: true 
    //   },
    //   items: [
    //     {
    //       title: 'Profile',
    //       url: '/class-invigilator/profile',
    //       permission: { module: 'user_management', action: 'read' }
    //     },
    //     {
    //       title: 'Change Password',
    //       url: '/class-invigilator/change-password',
    //       permission: { module: 'user_management', action: 'update' }
    //     }
    //   ]
    // },
    
    {
      id: 'notifications',
      title: 'Notifications',
      icon: Bell,
      permission: { 
        module: 'notifications', 
        actions: ['read'], 
        requireAny: true 
      },
      items: [
        {
          title: 'View Notifications',
          url: '/class-invigilator/notifications',
          permission: { module: 'notifications', action: 'read' }
        }
      ]
    }
  ],

    candidate: [liveInterviewCandidateMenu], // Live interview module
    operator: [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: LayoutDashboard,
      items: [
        {
          title: 'Operator Dashboard',
          url: '/operator/dashboard',
          permission: { module: 'operator_dashboard', action: 'create' }
        }
      ]
    },
      {
      id: 'biometric_verification',
      title: 'Verification', 
      icon: ShieldCheck,
      permission: { 
        module: 'biometric_verification', 
        actions: ['read', 'execute'], 
        requireAny: true 
      },
      items: [
      //   {
      //   title: 'Biometric Dashboard',
      //   url: '/operator/biometric-dashboard',
      //   permission: { module: 'biometric_verification', action: 'execute' }
      // },
        {
        title: 'Biometric Registration',
        url: '/operator/biometric-registration',
        permission: { module: 'biometric_verification', action: 'execute' }
      },
        //   {
        //   title: 'Candidate Verification',
        //   url: '/operator/verification',
        //   permission: { module: 'biometric_verification', action: 'execute' }
        // },
          ]
    },
  
  ],

  // Client menu configuration (role_id: 2)
  client: [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: LayoutDashboard,
      items: [
        {
          title: 'Client Dashboard',
          url: '/client/dashboard',
          permission: { module: 'client_dashboard', action: 'create' }
        }
      ]
    },
     {
      id: 'students',
      title: 'Students',
      icon: Users,
      permission: { 
        module: 'students', 
        actions: ['read', 'create'], 
        requireAny: true 
      },
      items: [
        {
          title: 'Student List',
          url: '/client/students/list',
          permission: { module: 'students', action: 'read' }
        },
        {
          title: 'Upload Bulk',
          url: '/client/students/bulk-upload',
          permission: { module: 'students', action: 'execute' }
        }
      ]
    },
     {
      id: 'questions',
      title: 'Questions',
      icon: FileText,
      permission: { 
        module: 'questions', 
        actions: ['read', 'execute'], 
        requireAny: true 
      },
      items: [
        {
          title: 'Question Bank',
          url: '/client/questions',
          permission: { module: 'questions', action: 'read' }
        },
        
        {
          title: 'Bulk Upload',
          url: '/client/questions/bulk-upload',
          permission: { module: 'questions', action: 'execute' }
        }
      ]
    },
    
    {
      id: 'institution',
      title: 'Institution',
      icon: GraduationCap,
      permission: { 
        module: 'institution', 
        actions: ['read', 'create', 'update'], 
        requireAny: true 
      },
      items: [
        {
          title: 'Institution Profile',
          url: '/client/institution/profile',
          permission: { module: 'institution', action: 'create' }
        },
        {
          title: 'Institution List',
          url: '/client/institution/list',
          permission: { module: 'institution', action: 'read' }
        },
        {
          title: 'Exam Preferences',
          url: '/client/institution/exam-preferences',
          permission: { module: 'institution', action: 'create' }
        }
      ]
    },
      {
      id: 'results',
      title: 'Results',
      icon: BarChart2,
      permission: { 
        module: 'results', 
        actions: [ 'execute'], 
        requireAny: true 
      },
      items: [
        {
          title: 'Download Reports',
          url: '/client/reports',
          permission: { module: 'results', action: 'execute' }
        }
      ]
    },
    //  {
    //   id: 'user_management',
    //   title: 'User Management',
    //   icon: UserCheck,
    //   permission: { 
    //     module: 'user_management', 
    //     actions: ['read', 'create', 'update'], 
    //     requireAny: true 
    //   },
    //   items: [
    //     {
    //       title: 'Profile',
    //       url: '/client/profile',
    //       permission: { module: 'user_management', action: 'read' }
    //     },
    //     {
    //       title: 'Change Password',
    //       url: '/client/change-password',
    //       permission: { module: 'user_management', action: 'update' }
    //     },
    //   ]
    // },
        {
      id: 'notifications',
      title: 'Notifications',
      icon: Bell,
      permission: { 
        module: 'notifications', 
        actions: ['read'], 
        requireAny: true 
      },
      items: [
        {
          title: 'View Notifications',
          url: '/client/notifications',
          permission: { module: 'notifications', action: 'read' }
        }
      ]
    }
  ]
};

// Get menu configuration based on user role
export const getMenuConfigByRole = (userRole) => {
  const roleMap = {
    1: 'admin',
    2: 'client',
    3: 'classInvigilator',
    5: 'operator',
    [CANDIDATE_ROLE_ID]: 'candidate'
  };
  
  const roleName = roleMap[userRole];
  return roleBasedMenuConfig[roleName] || [];
};