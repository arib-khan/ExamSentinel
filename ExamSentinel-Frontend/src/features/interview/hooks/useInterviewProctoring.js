import { useEffect, useRef } from "react";
import { interviewApi } from "@/services/InterviewServices/interviewService";

/**
 * Interview-only browser monitoring. The existing exam hooks (useTabSwitchDetector, useFullScreenMonitor, ...)
 * are tied to the exam Redux slice (they dispatch submitExam/forceSubmitExam), so they cannot be reused
 * here without touching Exam code. This hook only OBSERVES browser events and reports them to
 * POST /api/interview-attempts/:id/events. It never submits or blocks anything by itself;
 * the evaluator decides what the flags mean.
 */
export default function useInterviewProctoring(attemptId, enabled, onFlag) {
  const last = useRef({});
  useEffect(() => {
    if (!enabled || !attemptId) return undefined;

    const report = (type, details) => {
      const now = Date.now();
      if (now - (last.current[type] || 0) < 2000) return; // de-bounce bursts
      last.current[type] = now;
      interviewApi.sendEvent(attemptId, type, details).catch(() => {});
      onFlag && onFlag(type);
    };
    const onVisibility = () => { if (document.hidden) report("tab_switch"); };
    const onBlur = () => { if (!document.hidden) report("window_blur"); };
    const onFullscreen = () => { if (!document.fullscreenElement) report("fullscreen_exit"); };
    const onContext = () => report("right_click");
    const onClip = (e) => report("copy_paste", { action: e.type });
    const onOffline = () => report("network_offline");
    const onOnline = () => report("network_online");

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    document.addEventListener("fullscreenchange", onFullscreen);
    document.addEventListener("contextmenu", onContext);
    document.addEventListener("copy", onClip); document.addEventListener("paste", onClip); document.addEventListener("cut", onClip);
    window.addEventListener("offline", onOffline); window.addEventListener("online", onOnline);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("fullscreenchange", onFullscreen);
      document.removeEventListener("contextmenu", onContext);
      document.removeEventListener("copy", onClip); document.removeEventListener("paste", onClip); document.removeEventListener("cut", onClip);
      window.removeEventListener("offline", onOffline); window.removeEventListener("online", onOnline);
    };
  }, [attemptId, enabled, onFlag]);
}

/**
 * Integration point for camera / face verification.
 * ExamSentinel has no face-detection library or camera pipeline today (only seat biometric capture for
 * exam students), so nothing is faked here. When one exists, call
 *   interviewApi.sendEvent(attemptId, "face_not_detected" | "multiple_faces" | "camera_denied", {...})
 * from it; the backend, evaluator screen and mobile app already understand those event types.
 */
export const reportCameraEvent = (attemptId, type, details) => interviewApi.sendEvent(attemptId, type, details);
