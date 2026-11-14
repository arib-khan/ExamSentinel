// // hooks/useFullscreenMonitor.js
// import { useEffect } from "react";
// import { toast } from "sonner";
// import { useNavigate } from "react-router-dom";
// import { useExam } from "@/hooks/redux";
// import { forceSubmitExam, submitExam } from "@/store/slices/examSlice";

// export const useFullscreenMonitor = () => {
//   const { isExamSubmitted, dispatch } = useExam();
//   const navigate = useNavigate();

//   useEffect(() => {
//     const handleFullScreenChange = () => {
//       if (!document.fullscreenElement && !isExamSubmitted) {
//         toast.error("You exited fullscreen. Exam is being auto-submitted.");

//         dispatch(forceSubmitExam());
//         dispatch(submitExam())
//           .unwrap()
//           .then(() => navigate("/exam-result"))
//           .catch(() => toast.error("Failed to auto-submit exam."));
//       }
//     };

//     document.addEventListener("fullscreenchange", handleFullScreenChange);

//     return () => {
//       document.removeEventListener("fullscreenchange", handleFullScreenChange);
//     };
//   }, [isExamSubmitted, dispatch, navigate]);
// };
// hooks/useFullScreenMonitor.js
// hooks/useFullScreenMonitor.js
// hooks/useFullScreenMonitor.js
import { useEffect, useState } from "react";
import { useExamAuditLogger } from "./auditLogger/useExamAuditLogger";

export const useFullscreenMonitor = (onLimitReached, maxExits = 3) => {
  const { logExamEvent } = useExamAuditLogger();
  const [isFullscreen, setIsFullscreen] = useState(
    document.fullscreenElement !== null
  );
  const [fullscreenExitCount, setFullscreenExitCount] = useState(0);
  const [showFullscreenWarning, setShowFullscreenWarning] = useState(false);

  const enterFullscreen = () => {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el.msRequestFullscreen) el.msRequestFullscreen();
  };

  const handleFullscreenChange = () => {
    const fs = document.fullscreenElement !== null;
    setIsFullscreen(fs);

    if (!fs) {
      setFullscreenExitCount((prev) => {
        const newCount = prev + 1;

        logExamEvent("FULLSCREEN_EXIT", {
          exitCount: newCount,
          limitReached: newCount >= maxExits,
        });
        if (newCount >= maxExits) {
          onLimitReached?.(); // Auto-submit callback
        } else {
          setShowFullscreenWarning(true);
        }
        return newCount;
      });
    }
  };

  useEffect(() => {
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  return {
    isFullscreen,
    fullscreenExitCount,
    showFullscreenWarning,
    setShowFullscreenWarning,
    enterFullscreen,
    hasExceededLimit: fullscreenExitCount >= maxExits,
  };
};
