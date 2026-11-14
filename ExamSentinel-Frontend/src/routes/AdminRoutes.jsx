// routes/AdminRoutes.jsx
import ActivityLogs from "@/features/admin/Management/ActivityLog";
import ChangePassword from "@/features/admin/Management/ChangePassword";
import Profile from "@/features/admin/Management/Profile";
import ExamStudentMapForm from "@/features/mapping/create/ExamStudentMapForm";
import Reports from "@/features/Reports/Reports";
import { lazy } from "react";
import ProtectedRoute from "./ProtectedRoute";
import FingerprintCapture from "@/features/verification/biometric-verificaion/Fingerprint";

const Dashboard = lazy(() => import("../features/admin/DashboardTabs"));
const ClassInvigilatorDashboard = lazy(() => import("../features/admin/LiveExamdetails"));
const InstitutionForm = lazy(() =>
  import("../features/institute/create/AddInstitute")
);
const InstitutionList = lazy(() =>
  import("../features/institute/list/InstitutionList")
);
const ExamForm = lazy(() => import("../features/exams/create/CreateExam"));
const ExamList = lazy(() => import("../features/exams/list/examList"));
const StudentList = lazy(() => import("../features/student/list/studentList"));
const RegistrationForm = lazy(() =>
  import("../features/student/create/Registration")
);
const BulkUpload = lazy(() => import("../features/student/bulk/StudentBulkMaster"));
const QuestionBulkMaster = lazy(() =>
  import("../features/questions/bulk/QuestionBulkMaster")
);
const AddQuestionForm = lazy(() =>
  import("../features/questions/create/addQuestions")
);
const CentreForm = lazy(() => import("../features/center/create/CenterForm"));
const NotificationList = lazy(() =>
  import("../components/UserManagement/notification")
);
const QuestionList = lazy(() =>
  import("../features/questions/list/questionList")
);
const CenterList = lazy(() => import("../features/center/list/centerList"));
const UserForm = lazy(() => import("../features/users/create/UserForm"));
const StudentVerificationList = lazy(() => import("../features/verification/StudentVerificationList"));
const UserList = lazy(() => import("../features/users/list/userList"));
const UserRoleForm = lazy(() => import("../features/users/userRole/create/UserRoleForms"));

const UserRoleList = lazy(() => import("../features/users/userRole/list/userList"));
const StudentVerification = lazy(() => import("../features/verification/Biometric_Verification/StudentVerificationList"));
const AdminRoutes = [
  // { path: "/admin/dashboard", element: <Dashboard /> },
  // { path: "/admin/dashboard", element: <Dashboard /> },
  {
    path: "/admin/dashboard", element: (
      <ProtectedRoute module="dashboard" action="create">
        <Dashboard />
      </ProtectedRoute>
    )
  },
  {
    path: "/class-invigilator/dashboard", element: (
      <ProtectedRoute module="class_invigilator_dashboard" action="create">
        <ClassInvigilatorDashboard />
      </ProtectedRoute>
    )
  },
  {
    path: "/client/dashboard", element: (
      <ProtectedRoute module="client_dashboard" action="create">
        <Dashboard />
      </ProtectedRoute>
    )
  },
  {
    path: "/admin/institution/profile", element: (
      <ProtectedRoute module="institution" action="create">
        <InstitutionForm />
      </ProtectedRoute>
    )
  },
  {
    path: "/admin/institution/list", element: (
      <ProtectedRoute module="institution" action="read" >
        <InstitutionList />
      </ProtectedRoute>
    )
  },
  {
    path: "/admin/exams/create", element: (
      <ProtectedRoute module="exams" action="create" >
        <ExamForm />
      </ProtectedRoute>
    )
  },
  {
    path: "/admin/exams/list", element: (
      <ProtectedRoute module="exams" action="read" >
        <ExamList />
      </ProtectedRoute>
    )
  },
  {
    path: "/admin/students/list", element: (
      <ProtectedRoute module="students" action="read" >
        <StudentList />
      </ProtectedRoute>
    )
  },
  {
    path: "/admin/students/register", element: (
      <ProtectedRoute module="students" action="create" >
        <RegistrationForm />
      </ProtectedRoute>
    )
  },
  {
    path: "/admin/students/bulk-upload", element: (
      <ProtectedRoute module="students" action="execute" >
        <BulkUpload />
      </ProtectedRoute>
    )
  },
  {
    path: "/admin/questions/bulk-upload", element: (
      <ProtectedRoute module="questions" action="execute" >
        <QuestionBulkMaster />
      </ProtectedRoute>
    )
  },
  {
    path: "/admin/questions/add", element: (
      <ProtectedRoute module="questions" action="create" >
        <AddQuestionForm />
      </ProtectedRoute>
    )
  },
  {
    path: "/admin/center/profile", element: (
      <ProtectedRoute module="center" action="create" >
        <CentreForm />
      </ProtectedRoute>
    )
  },

  {
    path: "/admin/questions", element: (
      <ProtectedRoute module="questions" action="read" >
        <QuestionList />
      </ProtectedRoute>
    )
  },
  {
    path: "/admin/center/list", element: (
      <ProtectedRoute module="center" action="read" >
        <CenterList />
      </ProtectedRoute>
    )
  },
  {
    path: "/admin/exams/schedule", element: (
      <ProtectedRoute module="exams" action="execute" >
        <ExamStudentMapForm />
      </ProtectedRoute>
    )
  },
  {
    path: "/admin/profile", element: (
      <ProtectedRoute module="user_management" action="create" >
        <Profile />
      </ProtectedRoute>
    )
  },
  {
    path: "/admin/change-password", element: (
      <ProtectedRoute module="user_management" action="update" >
        <ChangePassword />
      </ProtectedRoute>
    )
  },
  {
    path: "/admin/activity", element: (
      <ProtectedRoute module="user_management" action="create" >
        <ActivityLogs />
      </ProtectedRoute>
    )
  },
  {
    path: "/admin/reports", element: (
      <ProtectedRoute module="results" action="execute" >
        <Reports />
      </ProtectedRoute>
    )
  },
  {
    path: "/admin/users/create", element: (
      <ProtectedRoute module="user_management" action="create" >
        <UserForm />
      </ProtectedRoute>
    )
  },
  {
    path: "/admin/verification", element: (
      <ProtectedRoute module="institution" action="execute" >
        <StudentVerificationList />
      </ProtectedRoute>
    )
  },
  {
    path: "/admin/user-managment", element: (
      <ProtectedRoute module="user_management" action="read" >
        <UserList />
      </ProtectedRoute>
    )
  },
  {
    path: "/admin/user-role/create", element: (
      <ProtectedRoute module="user_management" action="create" >
        <UserRoleForm />
      </ProtectedRoute>
    )
  },
  {
    path: "/admin/user-role/list", element: (
      <ProtectedRoute module="user_management" action="read" >
        <UserRoleList />
      </ProtectedRoute>
    )
  },
  {
    path: "/admin/verification/capture", element: (
      <ProtectedRoute module="biometric_verification" action="execute" >
        <StudentVerificationList />
      </ProtectedRoute>
    )
  },
  // {
  //   path: "/admin/verification/capture", element: (
  //     <ProtectedRoute module="user_management" action="execute" >
  //       <FingerprintCapture />
  //     </ProtectedRoute>
  //   )
  // },
  {
    path: "/admin/verification/form", element: (
      <ProtectedRoute module="biometric_verification" action="execute" >
        <StudentVerification />
      </ProtectedRoute>
    )
  },
  {
    path: "/admin/notifications", element:
      <NotificationList />
  },

];

export default AdminRoutes;
