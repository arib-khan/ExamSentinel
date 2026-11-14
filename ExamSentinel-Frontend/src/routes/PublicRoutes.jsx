// routes/PublicRoutes.jsx
import { lazy } from "react";

const CandidateLogin = lazy(() => import("../pages/Candidate"));
const AdminLogin = lazy(() => import("../pages/AdminLogin"));

const PublicRoutes = [
  {
    path: "/login",
    element: <AdminLogin />,
  },
  {
    path: "/",
    element: <CandidateLogin />, // Or redirect from App.jsx
  },
];

export default PublicRoutes;
