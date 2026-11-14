// components/ProtectedExamRoute.jsx
import { Navigate } from "react-router-dom";
import { useExam } from "@/hooks/redux";

const ProtectedExamRoute = ({
  children,
  requireStarted = false,
  requireSubmitted = false,
  blockAfterSubmit = false,
}) => {
  const { hasStartedExam: reduxStarted, isExamSubmitted } = useExam();

  const hasStartedExam =
    reduxStarted || sessionStorage.getItem("examStarted") === "true";

  if (requireStarted && !hasStartedExam) {
    return <Navigate to="/exam-instructions" replace />;
  }

  if (requireSubmitted && !isExamSubmitted) {
    return <Navigate to="/start-exam" replace />;
  }

  // ✅ Block instructions page after submission
  if (blockAfterSubmit && isExamSubmitted) {
    return <Navigate to="/exam-result" replace />;
  }
  // ✅ Block instructions page after submission
  if (blockAfterSubmit && isExamSubmitted) {
    return <Navigate to="/exam-end" replace />;
  }

  return children;
};

export default ProtectedExamRoute;
