// Interview module :: route guard for the candidate interview flow.
// Uses its own session keys so the exam candidate flow (authToken /
// studentData / examStarted) is never touched.
import { Navigate } from "react-router-dom";

export const hasInterviewSession = () =>
  Boolean(sessionStorage.getItem("interviewToken"));

export default function ProtectedInterviewRoute({ children }) {
  if (!hasInterviewSession()) {
    return <Navigate to="/interview-login" replace />;
  }
  return children;
}
