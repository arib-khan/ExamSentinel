// hooks/useDetectDevTools.js
import { useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { forceSubmitExam, submitExam } from "@/store/slices/examSlice";
import { useExam } from "../store/slices/examSlice";

export const useDetectDevTools = () => {
  const { isExamSubmitted, dispatch } = useExam();
  const navigate = useNavigate();

  useEffect(() => {
    let devToolsOpen = false;

    const checkDevTools = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold =
        window.outerHeight - window.innerHeight > threshold;

      if (widthThreshold || heightThreshold) {
        if (!devToolsOpen && !isExamSubmitted) {
          devToolsOpen = true;
          toast.error("DevTools detected! Exam will be auto-submitted.");
          dispatch(forceSubmitExam());
          dispatch(submitExam())
            .unwrap()
            .then(() => navigate("/exam-result"));
        }
      } else {
        devToolsOpen = false;
      }
    };

    const interval = setInterval(checkDevTools, 1000);

    return () => clearInterval(interval);
  }, []);
};
