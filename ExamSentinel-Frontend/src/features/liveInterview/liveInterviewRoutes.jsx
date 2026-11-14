import { createElement, lazy } from "react";
import { Video } from "lucide-react";
import ProtectedRoute from "@/routes/ProtectedRoute";

/**
 * Everything the app shell needs to know about the live interview module, in ONE file.
 * The shared files (RoleBasedRoutes, menuConfig, login redirect) only import from here.
 * Permission modules (backend: system_objects):  live_interviews (HR)  |  live_interview_portal (candidate)
 */
export const CANDIDATE_ROLE_ID = 6; // created by migrations/live-interview/002_live_interview_permissions.sql

const LiveInterviewList = lazy(() => import("./admin/LiveInterviewList"));
const LiveInterviewForm = lazy(() => import("./admin/LiveInterviewForm"));
const LiveInterviewRoom = lazy(() => import("./admin/LiveInterviewRoom"));
const CandidateLiveInterviewList = lazy(() => import("./candidate/CandidateLiveInterviewList"));
const CandidateLiveInterviewDetail = lazy(() => import("./candidate/CandidateLiveInterviewDetail"));
const CandidateLiveInterviewRoom = lazy(() => import("./candidate/CandidateLiveInterviewRoom"));
const MonitorCamera = lazy(() => import("./candidate/MonitorCamera"));

const hr = (path, action, El) => ({ path, element: <ProtectedRoute module="live_interviews" action={action}>{createElement(El)}</ProtectedRoute> });
const cand = (path, El) => ({ path, element: <ProtectedRoute module="live_interview_portal" action="read" fallbackPath="/">{createElement(El)}</ProtectedRoute> });

export const liveInterviewAdminRoutes = [
  hr("/admin/live-interviews", "read", LiveInterviewList),
  hr("/admin/live-interviews/create", "create", LiveInterviewForm),
  hr("/admin/live-interviews/:id/edit", "update", LiveInterviewForm),
  hr("/admin/live-interviews/:id/room", "execute", LiveInterviewRoom),
];
export const liveInterviewCandidateRoutes = [
  cand("/candidate/live-interviews", CandidateLiveInterviewList),
  cand("/candidate/live-interviews/:id", CandidateLiveInterviewDetail),
  cand("/candidate/live-interviews/:id/room", CandidateLiveInterviewRoom),
  cand("/candidate/live-interviews/:id/monitor", MonitorCamera),
];

export const liveInterviewAdminMenu = {
  id: "live-interviews", title: "Live Interviews", icon: Video,
  permission: { module: "live_interviews", actions: ["read", "create"] },
  items: [
    { title: "All Interviews", url: "/admin/live-interviews", permission: { module: "live_interviews", action: "read" } },
    { title: "Schedule Interview", url: "/admin/live-interviews/create", permission: { module: "live_interviews", action: "create" } },
  ],
};
export const liveInterviewCandidateMenu = {
  id: "my-live-interviews", title: "Interviews", icon: Video,
  items: [{ title: "My Interviews", url: "/candidate/live-interviews", permission: { module: "live_interview_portal", action: "read" } }],
};
