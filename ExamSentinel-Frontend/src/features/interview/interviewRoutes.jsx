import { createElement, lazy } from "react";
import { MessagesSquare } from "lucide-react";
import ProtectedRoute from "@/routes/ProtectedRoute";

/**
 * Everything the app shell needs to know about the Interview module, in ONE file.
 * The shared files (RoleBasedRoutes, menuConfig, login redirect) only import from here.
 *
 * Permission modules (backend: system_objects):  interviews | interview_evaluations | interview_portal
 */
export const CANDIDATE_ROLE_ID = 6; // created by migrations/interview/002_interview_permissions.sql

const InterviewList = lazy(() => import("./admin/InterviewList"));
const InterviewForm = lazy(() => import("./admin/InterviewForm"));
const InterviewOverview = lazy(() => import("./admin/InterviewOverview"));
const InterviewQuestions = lazy(() => import("./admin/InterviewQuestions"));
const InterviewCandidates = lazy(() => import("./admin/InterviewCandidates"));
const InterviewAttempts = lazy(() => import("./admin/InterviewAttempts"));
const InterviewResults = lazy(() => import("./admin/InterviewResults"));
const InterviewEvaluationPage = lazy(() => import("./admin/InterviewEvaluationPage"));
const CandidateInterviewList = lazy(() => import("./candidate/CandidateInterviewList"));
const CandidateInterviewDetail = lazy(() => import("./candidate/CandidateInterviewDetail"));
const InterviewAttemptPage = lazy(() => import("./candidate/InterviewAttemptPage"));
const InterviewResultPage = lazy(() => import("./candidate/InterviewResultPage"));

const admin = (path, module, action, El) => ({
  path, element: <ProtectedRoute module={module} action={action}>{createElement(El)}</ProtectedRoute>,
});
const cand = (path, El) => ({
  path, element: <ProtectedRoute module="interview_portal" action="read" fallbackPath="/">{createElement(El)}</ProtectedRoute>,
});

export const interviewAdminRoutes = [
  admin("/admin/interviews", "interviews", "read", InterviewList),
  admin("/admin/interviews/create", "interviews", "create", InterviewForm),
  admin("/admin/interviews/:id", "interviews", "read", InterviewOverview),
  admin("/admin/interviews/:id/edit", "interviews", "update", InterviewForm),
  admin("/admin/interviews/:id/questions", "interviews", "read", InterviewQuestions),
  admin("/admin/interviews/:id/candidates", "interviews", "read", InterviewCandidates),
  admin("/admin/interviews/:id/attempts", "interview_evaluations", "read", InterviewAttempts),
  admin("/admin/interviews/:id/results", "interview_evaluations", "read", InterviewResults),
  admin("/admin/interview-attempts/:attemptId/evaluation", "interview_evaluations", "read", InterviewEvaluationPage),
];

export const interviewCandidateRoutes = [
  cand("/candidate/interviews", CandidateInterviewList),
  cand("/candidate/interviews/:id", CandidateInterviewDetail),
  cand("/candidate/interview-attempts/:attemptId", InterviewAttemptPage),
  cand("/candidate/interview-attempts/:attemptId/result", InterviewResultPage),
];

export const interviewAdminMenu = {
  id: "interviews", title: "Interviews", icon: MessagesSquare,
  permission: { module: "interviews", actions: ["read", "create"] },
  items: [
    { title: "Interview List", url: "/admin/interviews", permission: { module: "interviews", action: "read" } },
    { title: "Create Interview", url: "/admin/interviews/create", permission: { module: "interviews", action: "create" } },
  ],
};

export const interviewCandidateMenu = {
  id: "my-interviews", title: "Interviews", icon: MessagesSquare,
  items: [{ title: "My Interviews", url: "/candidate/interviews", permission: { module: "interview_portal", action: "read" } }],
};
