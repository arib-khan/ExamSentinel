// routes/RoleBasedRoutes.jsx
import { lazy } from "react";
import ProtectedRoute from "./ProtectedRoute";
import ExamControls from "@/features/admin/Exam_Controls/Exam_controls";
import QuestionForm from "@/features/questions/create/QuestionForm";
import ObjectPermission from "@/features/users/objectPermission/ObjectPermission";
import AddObjPermission from "@/features/users/objectPermission/Create/AddObjPermission";
import SystemObjectList from "@/features/users/objectPermission/SystemObject/SystemObjectList";
import AddSystemObject from "@/features/users/objectPermission/SystemObject/Create/AddSystemObject";
import MasterDataWizard from "@/features/class-invigilator/DataDownload/MasterDataWizard";
import ExamPWControl from "@/features/admin/Exam_Controls/ExamPWControl";
import MasterControls from "@/features/admin/Exam_Controls/MasterControls";
import SeatMapping from "@/features/mapping/SeatMapping/SeatMapping";
import ClientPreference from "@/features/client/ClientPreferences/ClientPreference";
import { liveInterviewAdminRoutes, liveInterviewCandidateRoutes, CANDIDATE_ROLE_ID } from "@/features/liveInterview/liveInterviewRoutes";


// Lazy load components
const Dashboard = lazy(() => import("../features/admin/DashboardTabs"));
const ClassInvigilatorDashboard = lazy(() => import("../features/class-invigilator/LiveExamDetails/LiveExamDetails"));
const ClientDashboard = lazy(() => import("../features/client/ClientDashboard"));

const InstitutionForm = lazy(() => import("../features/institute/create/AddInstitute"));
const InstitutionList = lazy(() => import("../features/institute/list/InstitutionList"));
const ExamForm = lazy(() => import("../features/exams/create/CreateExam"));
const ExamList = lazy(() => import("../features/exams/list/examList"));
const StudentList = lazy(() => import("../features/student/list/studentList"));
const RegistrationForm = lazy(() => import("../features/student/create/Registration"));
const BulkUpload = lazy(() => import("../features/student/bulk/StudentBulkMaster"));
const QuestionBulkMaster = lazy(() => import("../features/questions/bulk/QuestionBulkMaster"));
const AddQuestionForm = lazy(() => import("../features/questions/create/addQuestions"));
const CentreForm = lazy(() => import("../features/center/create/CenterForm"));
const NotificationList = lazy(() => import("../components/UserManagement/notification"));
const QuestionList = lazy(() => import("../features/questions/list/questionList"));
const CenterList = lazy(() => import("../features/center/list/centerList"));
const CenterInventoryList = lazy(() => import("../features/center/importList/centerList"));
const UserForm = lazy(() => import("../features/users/create/UserForm"));
const StudentVerificationList = lazy(() => import("../features/verification/StudentVerificationList"));
const UserList = lazy(() => import("../features/users/list/userList"));
const UserRoleForm = lazy(() => import("../features/users/userRole/create/UserRoleForms"));
const UserRoleList = lazy(() => import("../features/users/userRole/list/userList"));
const StudentVerification = lazy(() => import("../features/verification/Biometric_Verification/StudentVerificationList"));
const SeatRearrangment = lazy(() => import("../features/seat-rearrangment/SeatDataFetching"));
const StudentRegistration = lazy(() => import("../features/verification/Biometric_Registration/BiometricRegistration"));
const BiometricDashboard = lazy(() => import("../features/verification/Biometric_Verification/BiometricDashboard"));
const ActivityLogs = lazy(() => import("@/features/admin/Management/ActivityLog"));
const ChangePassword = lazy(() => import("@/features/admin/Management/ChangePassword"));
const Profile = lazy(() => import("@/features/admin/Management/Profile"));
const ExamStudentMapForm = lazy(() => import("@/features/mapping/create/ExamStudentMapForm"));
const Reports = lazy(() => import("@/features/Reports/Reports"));
const FingerprintCapture = lazy(() => import("@/features/verification/biometric-verificaion/Fingerprint"));
const QuestionDownload = lazy(() => import("@/features/class-invigilator/QuestionPaperDownload/QuestionDownload"));
const StudentDataDownload = lazy(() => import("@/features/class-invigilator/StudentDataDownload/StudentDataDownload"));
const CenterInventory = lazy(() => import("@/features/center/import/CenterInventory"));
const Mapping = lazy(() => import("@/features/mapping/CenteralMapping/Mapping"));
const ExportData = lazy(() => import("@/features/data-export/ExportData"));
const ImportData = lazy(() => import("@/features/data-export/ImportData"));
const DataImportWizard = lazy(() => import("@/features/class-invigilator/DataDownload/DataImportWizard"));

// Define routes for each role
export const RoleBasedRoutes = {
    // Admin routes (role_id: 1)
    admin: [
        ...liveInterviewAdminRoutes, // Live interview module
        {
            path: "/admin/dashboard",
            element: (
                <ProtectedRoute module="dashboard" action="create">
                    <Dashboard />
                </ProtectedRoute>
            )
        },
        {
            path: "/admin/institution/profile",
            element: (
                <ProtectedRoute module="institution" action="create">
                    <InstitutionForm />
                </ProtectedRoute>
            )
        },
        {
            path: "/admin/institution/list",
            element: (
                <ProtectedRoute module="institution" action="read">
                    <InstitutionList type="admin" />
                </ProtectedRoute>
            )
        },
        {
            path: "/admin/institution/exam-preferences",
            element: (
                <ProtectedRoute module="institution" action="create">
                    <ClientPreference />
                </ProtectedRoute>
            )
        },
        {
            path: "/admin/exams/create",
            element: (
                <ProtectedRoute module="exams" action="create">
                    <ExamForm />
                </ProtectedRoute>
            )
        },
        {
            path: "/admin/exams/list",
            element: (
                <ProtectedRoute module="exams" action="read">
                    <ExamList />
                </ProtectedRoute>
            )
        },
        {
            path: "/admin/students/list",
            element: (
                <ProtectedRoute module="students" action="read">
                    <StudentList />
                </ProtectedRoute>
            )
        },
        {
            path: "/admin/students/register",
            element: (
                <ProtectedRoute module="students" action="create">
                    <RegistrationForm />
                </ProtectedRoute>
            )
        },
        {
            path: "/admin/students/bulk-upload",
            element: (
                <ProtectedRoute module="students" action="execute">
                    <BulkUpload />
                </ProtectedRoute>
            )
        },
        {
            path: "/admin/questions/bulk-upload",
            element: (
                <ProtectedRoute module="questions" action="execute">
                    <QuestionBulkMaster />
                </ProtectedRoute>
            )
        },
        {
            path: "/admin/questions/add",
            element: (
                <ProtectedRoute module="questions" action="create">
                    {/* <AddQuestionForm /> */}
                    <QuestionForm />
                </ProtectedRoute>
            )
        },
        {
            path: "/admin/center/profile",
            element: (
                <ProtectedRoute module="center" action="create">
                    <CentreForm />
                </ProtectedRoute>
            )
        },
        {
            path: "/admin/questions",
            element: (
                <ProtectedRoute module="questions" action="read">
                    <QuestionList />
                </ProtectedRoute>
            )
        },
        {
            path: "/admin/center/list",
            element: (
                <ProtectedRoute module="center" action="read">
                    <CenterList />
                </ProtectedRoute>
            )
        },
        {
            path: "/admin/center-inventroy/list",
            element: (
                <ProtectedRoute module="center" action="read">
                    <CenterInventoryList />
                </ProtectedRoute>
            )
        },
        {
            path: "/admin/center/inventory-upload",
            element: (
                <ProtectedRoute module="center" action="execute">
                    <CenterInventory />
                </ProtectedRoute>
            )
        },
        {
            path: "/admin/exams/schedule",
            element: (
                <ProtectedRoute module="exams" action="execute">
                    <ExamStudentMapForm />
                </ProtectedRoute>
            )
        },
        {
            path: "/admin/mapping/details",
            element: (
                <ProtectedRoute module="exams" action="execute">
                    <Mapping />
                </ProtectedRoute>
            )
        },
        {
            path: "/admin/seat-mapping/details",
            element: (
                <ProtectedRoute module="exams" action="execute">
                    <SeatMapping />
                </ProtectedRoute>
            )
        },
        // Not in Use 
        // {
        //     path: "/admin/export/data",
        //     element: (
        //         <ProtectedRoute module="data_export" action="execute">
        //             <ExportData />
        //         </ProtectedRoute>
        //     )
        // },
        {
            path: "/admin/profile",
            element: (
                <ProtectedRoute module="user_management" action="read">
                    <Profile />
                </ProtectedRoute>
            )
        },
        {
            path: "/admin/change-password",
            element: (
                <ProtectedRoute module="user_management" action="update">
                    <ChangePassword />
                </ProtectedRoute>
            )
        },
        {
            path: "/admin/activity",
            element: (
                <ProtectedRoute module="user_management" action="read">
                    <ActivityLogs />
                </ProtectedRoute>
            )
        },
        {
            path: "/admin/reports",
            element: (
                <ProtectedRoute module="results" action="execute">
                    <Reports />
                </ProtectedRoute>
            )
        },
        {
            path: "/admin/users/create",
            element: (
                <ProtectedRoute module="user_management" action="create">
                    <UserForm />
                </ProtectedRoute>
            )
        },

        {
            path: "/admin/user-managment",
            element: (
                <ProtectedRoute module="user_management" action="create">
                    <UserList />
                </ProtectedRoute>
            )
        },
        {
            path: "/admin/user-role/create",
            element: (
                <ProtectedRoute module="user_management" action="create">
                    <UserRoleForm />
                </ProtectedRoute>
            )
        },
        {
            path: "/admin/user-role/list",
            element: (
                <ProtectedRoute module="user_management" action="create">
                    <UserRoleList />
                </ProtectedRoute>
            )
        },
        {
            path: "/admin/object-permission/add",
            element: (
                <ProtectedRoute module="object_permission" action="create">
                    <AddObjPermission />
                </ProtectedRoute>
            )
        },
        {
            path: "/admin/object-permission/list",
            element: (
                <ProtectedRoute module="object_permission" action="update">
                    <ObjectPermission />
                </ProtectedRoute>
            )
        },
        {
            path: "/admin/system-objects/add",
            element: (
                <ProtectedRoute module="system_object" action="create">
                    <AddSystemObject />
                </ProtectedRoute>
            )
        },
        {
            path: "/admin/system-objects/list",
            element: (
                <ProtectedRoute module="system_object" action="execute">
                    <SystemObjectList />
                </ProtectedRoute>
            )
        },
        {
            path: "/admin/biometric/dashboard",
            element: (
                <ProtectedRoute module="biometric_verification" action="execute">
                    <BiometricDashboard />
                </ProtectedRoute>
            )
        },
        {
            path: "/admin/biometric/list",
            element: (
                <ProtectedRoute module="biometric_verification" action="execute">
                    <StudentRegistration />
                </ProtectedRoute>
            )
        },
        {
            path: "/admin/verification/form",
            element: (
                <ProtectedRoute module="biometric_verification" action="execute">
                    <StudentVerification />
                </ProtectedRoute>
            )
        },
        {
            path: "/admin/notifications",
            element: (
                <ProtectedRoute module="notifications" action="read">
                    <NotificationList />
                </ProtectedRoute>
            )
        },
        {
            path: "/admin/exam/controls",
            element: (
                <ProtectedRoute module="admin_controls" action="create">
                    {/* <ExamControls /> */}
                    <MasterControls />
                </ProtectedRoute>
            )
        },
        // {
        //     path: "/admin/exam-password/control",
        //     element: (
        //         <ProtectedRoute module="admin_controls" action="create">
        //             <ExamPWControl />
        //         </ProtectedRoute>
        //     )
        // },
    ],

    // Class Invigilator routes (role_id: 3)
    classInvigilator: [
        {
            path: "/class-invigilator/dashboard",
            element: (
                <ProtectedRoute module="class_invigilator_dashboard" action="create">
                    <ClassInvigilatorDashboard />
                </ProtectedRoute>
            )
        },
        {
            path: "/class-invigilator/profile",
            element: (
                <ProtectedRoute module="user_management" action="read">
                    <Profile />
                </ProtectedRoute>
            )
        },
        {
            path: "/class-invigilator/questions/download",
            element: (
                <ProtectedRoute module="questions" action="execute">
                    <QuestionDownload />
                </ProtectedRoute>
            )
        },
        {
            path: "/class-invigilator/students/download",
            element: (
                <ProtectedRoute module="students" action="execute">
                    <StudentDataDownload />
                </ProtectedRoute>
            )
        },
        {
            path: "/class-invigilator/change-password",
            element: (
                <ProtectedRoute module="user_management" action="update">
                    <ChangePassword />
                </ProtectedRoute>
            )
        },
        {
            path: "/class-invigilator/notifications",
            element: (
                <ProtectedRoute module="notifications" action="read">
                    <NotificationList />
                </ProtectedRoute>
            )
        },
        {
            path: "/class-invigilator/import/data",
            element: (
                <ProtectedRoute module="data_import" action="execute">
                    {/* <ImportData /> */}
                    {/* <DataImportWizard /> */}
                    <MasterDataWizard />
                </ProtectedRoute>
            )
        },
        {
            path: "/class-invigilator/biometric-dashboard",
            element: (
                <ProtectedRoute module="biometric_verification" action="execute">
                    <BiometricDashboard />
                </ProtectedRoute>
            )
        },
        {
            path: "/class-invigilator/biometric-registration",
            element: (
                <ProtectedRoute module="biometric_verification" action="execute">
                    <StudentRegistration />
                </ProtectedRoute>
            )
        },
        {
            path: "/class-invigilator/verification",
            element: (
                <ProtectedRoute module="biometric_verification" action="execute">
                    <StudentVerification />
                </ProtectedRoute>
            )
        },
        {
            path: "/class-invigilator/seat-rearrangment",
            element: (
                <ProtectedRoute module="seat_rearrangment" action="execute">
                    <SeatRearrangment />
                </ProtectedRoute>
            )
        },
    ],
    // Operator routes (role_id: 5)
    candidate: liveInterviewCandidateRoutes, // Live interview module
    operator: [
        {
            path: "/operator/dashboard",
            element: (
                <ProtectedRoute module="operator_dashboard" action="create">
                    <BiometricDashboard />
                </ProtectedRoute>
            )
        },
        // {
        //     path: "/operator/biometric-dashboard",
        //     element: (
        //         <ProtectedRoute module="biometric_verification" action="execute">
        //             <BiometricDashboard />
        //         </ProtectedRoute>
        //     )
        // },
        {
            path: "/operator/biometric-registration",
            element: (
                <ProtectedRoute module="biometric_verification" action="execute">
                    <StudentRegistration />
                </ProtectedRoute>
            )
        },
        {
            path: "/operator/verification",
            element: (
                <ProtectedRoute module="biometric_verification" action="execute">
                    <StudentVerification />
                </ProtectedRoute>
            )
        },
    ],

    // Client routes (role_id: 2)
    client: [
        {
            path: "/client/dashboard",
            element: (
                <ProtectedRoute module="client_dashboard" action="create">
                    <ClientDashboard />
                </ProtectedRoute>
            )
        },
        {
            path: "/client/students/list",
            element: (
                <ProtectedRoute module="students" action="read">
                    <StudentList />
                </ProtectedRoute>
            )
        },
        {
            path: "/client/students/bulk-upload",
            element: (
                <ProtectedRoute module="students" action="execute">
                    <BulkUpload />
                </ProtectedRoute>
            )
        },
        {
            path: "/client/questions",
            element: (
                <ProtectedRoute module="questions" action="read">
                    <QuestionList />
                </ProtectedRoute>
            )
        },
        {
            path: "/client/questions/bulk-upload",
            element: (
                <ProtectedRoute module="questions" action="execute">
                    <QuestionBulkMaster />
                </ProtectedRoute>
            )
        },
        {
            path: "/client/institution/profile",
            element: (
                <ProtectedRoute module="institution" action="create">
                    <InstitutionForm />
                </ProtectedRoute>
            )
        },
        {
            path: "/client/institution/list",
            element: (
                <ProtectedRoute module="institution" action="read">
                    <InstitutionList />
                </ProtectedRoute>
            )
        },
        {
            path: "/client/institution/exam-preferences",
            element: (
                <ProtectedRoute module="institution" action="create">
                    <ClientPreference />
                </ProtectedRoute>
            )
        },
        {
            path: "/client/reports",
            element: (
                <ProtectedRoute module="results" action="execute">
                    <Reports />
                </ProtectedRoute>
            )
        },
        {
            path: "/client/profile",
            element: (
                <ProtectedRoute module="user_management" action="read">
                    <Profile />
                </ProtectedRoute>
            )
        },
        {
            path: "/client/change-password",
            element: (
                <ProtectedRoute module="user_management" action="update">
                    <ChangePassword />
                </ProtectedRoute>
            )
        },
        {
            path: "/client/notifications",
            element: (
                <ProtectedRoute module="notifications" action="read">
                    <NotificationList />
                </ProtectedRoute>
            )
        }
    ]
};

// Get routes based on user role
export const getRoleBasedRoutes = (userRole) => {
    const roleMap = {
        1: 'admin',
        2: 'client',
        3: 'classInvigilator',
        5: 'operator',
        [CANDIDATE_ROLE_ID]: 'candidate'
    };

    const roleName = roleMap[userRole];
    return RoleBasedRoutes[roleName] || [];
};