
// // Updated App.jsx
// import {
//   BrowserRouter,
//   HashRouter,
//   Routes,
//   Route,
//   Navigate,
// } from "react-router-dom";
// import { Suspense } from "react";

// import ExamInstruction from "./features/redux_exam/ExamInstruction";
// import ExamWithLayout from "./features/redux_exam/ExamWithLayout";
// import ExamResult from "./features/redux_exam/ExamResult";
// import NotFound from "./pages/NotFound";
// import Sidebar from "./features/sidebar/Sidebar";
// import AppRoutes from "./routes/App";
// import Loader from "./components/reusableComponets/Loader";
// import ProtectedExamRoute from "./routes/ProtectedExamRoute";
// import { Toaster } from "sonner";

// // ✅ Use HashRouter when running in Electron (file://), BrowserRouter in dev server
// const Router =
//   window?.location.protocol === "file:" ? HashRouter : BrowserRouter;

// function App() {
//   return (
//     <Router>
//       <Suspense fallback={<Loader />}>
//         <Routes>
//           {/* Public routes */}
//           {AppRoutes.filter(
//             (route) =>
//               !route.path.startsWith("/admin") &&
//               !route.path.startsWith("/dashboard")
//           ).map((route, index) => (
//             <Route key={index} path={route.path} element={route.element} />
//           ))}

//           {/* Exam flow routes */}
//           <Route
//             path="/exam-instructions"
//             element={
//               <ProtectedExamRoute blockAfterSubmit>
//                 <ExamInstruction />
//               </ProtectedExamRoute>
//             }
//           />

//           <Route
//             path="/start-exam"
//             element={
//               <ProtectedExamRoute requireStarted>
//                 <ExamWithLayout />
//               </ProtectedExamRoute>
//             }
//           />

//           <Route
//             path="/exam-result"
//             element={
//               <ProtectedExamRoute requireSubmitted>
//                 <ExamResult />
//               </ProtectedExamRoute>
//             }
//           />

//           {/* Routes with Sidebar - Now permission-protected */}
//           <Route element={<Sidebar />}>
//             {AppRoutes.filter(
//               (route) =>
//                 route.path.startsWith("/admin") || route.path === "/dashboard"
//             ).map((route, index) => (
//               <Route key={index} path={route.path} element={route.element} />
//             ))}
//           </Route>

//           {/* Redirect root */}
//           <Route path="/" element={<Navigate to="/login" />} />
//           <Route path="*" element={<NotFound />} />
//         </Routes>
//       </Suspense>
//       <Toaster richColors position="top-center" closeButton />
//     </Router>
//   );
// }

// export default App;

// Updated App.jsx
import {
  BrowserRouter,
  HashRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Suspense } from "react";

import ExamInstruction from "./features/redux_exam/ExamInstruction";
import ExamWithLayout from "./features/redux_exam/ExamWithLayout";
import ExamResult from "./features/redux_exam/ExamResult";
import ExamEnd from "./features/redux_exam/ExamEnd";
import NotFound from "./pages/NotFound";
import Sidebar from "./features/sidebar/Sidebar";
import PublicRoutes from "./routes/PublicRoutes";
import { getRoleBasedRoutes } from "./routes/RoleBasedRoutes";
import Loader from "./components/reusableComponets/Loader";
import ProtectedExamRoute from "./routes/ProtectedExamRoute";
import { Toaster } from "sonner";
import { usePermissions } from "./contexts/PermissionContext";

// ✅ Use HashRouter when running in Electron (file://), BrowserRouter in dev server
const Router = window?.location.protocol === "file:" ? HashRouter : BrowserRouter;

// here we change the login to / to comes if the password is wrong instead of going to /login again this goes to /

function App() {
  const { userRole, loading } = usePermissions();

  // Show loader while fetching user role and permissions
  if (loading) {
    return <Loader />;
  }

  // Get role-based routes
  const roleBasedRoutes = userRole ? getRoleBasedRoutes(userRole) : [];

  return (
    <Router>
      <Suspense fallback={<Loader />}>
        <Routes>
          {/* Public routes */}
          {PublicRoutes.map((route, index) => (
            <Route key={index} path={route.path} element={route.element} />
          ))}

          {/* Exam flow routes */}
          <Route
            path="/exam-instructions"
            element={
              <ProtectedExamRoute blockAfterSubmit>
                <ExamInstruction />
              </ProtectedExamRoute>
            }
          />

          <Route
            path="/start-exam"
            element={
              <ProtectedExamRoute requireStarted>
                <ExamWithLayout />
              </ProtectedExamRoute>
            }
          />

          <Route
            path="/exam-result"
            element={
              <ProtectedExamRoute requireSubmitted>
                <ExamResult />
              </ProtectedExamRoute>
            }
          />
          <Route
            path="/exam-end"
            element={
              <ProtectedExamRoute requireSubmitted>
                <ExamEnd />
              </ProtectedExamRoute>
            }
          />

          {/* Routes with Sidebar - Now role-based and permission-protected */}
          <Route element={<Sidebar />}>
            {roleBasedRoutes.map((route, index) => (
              <Route key={index} path={route.path} element={route.element} />
            ))}
          </Route>

          {/* Redirect root based on user role */}
          <Route
            path="/"
            element={
              userRole ? (
                <Navigate to={getDefaultRouteByRole(userRole)} replace />
              ) : (
                // <Navigate to="/login" replace />
                <Navigate to="/" replace />
              )
            }
          />

          {/* Fallback routes for role-based dashboards */}
          <Route
            path="/dashboard"
            element={
              userRole ? (
                <Navigate to={getDefaultRouteByRole(userRole)} replace />
              ) : (
                // <Navigate to="/login" replace />
                <Navigate to="/" replace />
              )
            }
          />

          {/* Catch all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Toaster richColors position="top-center" closeButton />
    </Router>
  );
}

// Helper function to get default route based on user role
const getDefaultRouteByRole = (roleId) => {
  switch (roleId) {
    case 1: // Admin
      return '/admin/dashboard';
    case 2: // Client (Institute)
      return '/client/dashboard';
    case 3: // Class Invigilator
      return '/class-invigilator/dashboard';
    case 6: // Interview candidate
      return '/candidate/live-interviews';
    default:
      // return '/login';
      return '/';
  }
};

export default App;