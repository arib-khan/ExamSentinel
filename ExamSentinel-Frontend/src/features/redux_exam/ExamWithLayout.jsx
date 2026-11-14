// components/ExamWithLayout.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth, useExam } from "@/hooks/redux";
import { verifyToken } from "@/store/slices/authSlice";
import {
  startExam,
  resetQuestionTime,
  submitExam,
} from "@/store/slices/examSlice";
import StudentLayout from "./StudentLayout";
import Exam from "./Exam";
import { useExamAuditLogger } from "@/hooks/auditLogger/useExamAuditLogger";

export default function ExamWithLayout() {
  const navigate = useNavigate();
  const { isAuthenticated, dispatch: authDispatch } = useAuth();
  const { logExamEvent } = useExamAuditLogger();
  const {
    isExamStarted,
    isExamSubmitted,
    error,
    examTimeLeft,
    dispatch: examDispatch,
  } = useExam();



  useEffect(() => {
    // Verify authentication
    if (!isAuthenticated) {
      authDispatch(verifyToken())
        .unwrap()
        .catch(() => {
          toast.error("Authentication failed. Please login again.");
          navigate("/");
        });
    }
  }, [isAuthenticated, authDispatch, navigate]);

  useEffect(() => {
    // Start exam if not already started
    if (isAuthenticated && !isExamStarted && !isExamSubmitted) {
      examDispatch(startExam())
        .unwrap()
        .then(() => {
          examDispatch(resetQuestionTime());
        })
        .catch((error) => {
          toast.error(error || "Failed to start exam");
          logExamEvent("EXAM_START_FAILED", { error });
          navigate("/exam-instructions");
        });
    }
  }, [isAuthenticated, isExamStarted, isExamSubmitted, examDispatch, navigate]);

  useEffect(() => {
    // Handle exam time expiry
    if (examTimeLeft <= 0 && isExamStarted && !isExamSubmitted) {
      toast.warning("Time's up! Exam will be submitted automatically.");
      logExamEvent("EXAM_TIME_EXPIRED");
      // Auto-submit exam when time expires
      examDispatch(submitExam())
        .unwrap()
        .then(() => {
          navigate("/exam-result");
        })
        .catch(() => {
          toast.error("Failed to submit exam");
          logExamEvent("EXAM_SUBMIT_FAILED", { error: err?.message });
        });
    }
  }, [examTimeLeft, isExamStarted, isExamSubmitted, examDispatch, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Redirect if exam is submitted
  useEffect(() => {
    if (isExamSubmitted) {
      navigate("/exam-result");
    }
  }, [isExamSubmitted, navigate]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <StudentLayout>
      <Exam />
    </StudentLayout>
  );
}
