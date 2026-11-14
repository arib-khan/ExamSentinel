import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useExam } from "@/hooks/redux";
import { forceSubmitExam, submitExam } from "@/store/slices/examSlice";
import { useExamAuditLogger } from "./auditLogger/useExamAuditLogger";

export const useTabSwitchDetector = () => {
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showWarningPopup, setShowWarningPopup] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const { isExamSubmitted, dispatch } = useExam();
  const { logExamEvent } = useExamAuditLogger();
  const navigate = useNavigate();
  const isSubmittingRef = useRef(false);
  const lastBlurTime = useRef(0);

  const handleAutoSubmit = useCallback(() => {
    if (isSubmittingRef.current || isExamSubmitted) return;

    isSubmittingRef.current = true;

    toast.error("Exam auto-submitted due to excessive tab switching!");

    dispatch(forceSubmitExam());
    dispatch(submitExam())
      .unwrap()
      .then(() => {
        navigate("/exam-result");
      })
      .catch((error) => {
        toast.error(
          "Failed to auto-submit exam: " + (error?.message || "Unknown error")
        );
        isSubmittingRef.current = false;
      });
  }, [isExamSubmitted, dispatch, navigate]);

  const handleTabSwitch = useCallback(() => {
    // Prevent processing if exam is already submitted or currently submitting
    if (isExamSubmitted || isSubmittingRef.current) return;

    // Debounce rapid blur events (prevent multiple triggers within 1 second)
    const now = Date.now();
    if (now - lastBlurTime.current < 1000) return;
    lastBlurTime.current = now;

    setTabSwitchCount((prevCount) => {
      const newCount = prevCount + 1;

      logExamEvent("TAB_SWITCH_DETECTED", {
        count: newCount,
        status: newCount >= 3 ? "AUTO_SUBMITTED" : "WARNING",
      });

      console.log(`Tab switch detected! Count: ${newCount}/3`);

      if (newCount >= 3) {
        // Auto-submit on third violation
        handleAutoSubmit();
        return newCount;
      } else {
        // Show popup warning for first and second violations
        const message =
          newCount === 1
            ? "⚠️ First Warning: You switched tabs! Please stay on the exam screen. You have 2 more chances before your exam is auto-submitted."
            : "🚨 Final Warning: This is your last chance! One more tab switch will automatically submit your exam.";

        setWarningMessage(message);
        setShowWarningPopup(true);
        return newCount;
      }
    });
  }, [isExamSubmitted, handleAutoSubmit]);

  useEffect(() => {
    // Only attach listeners if exam is not submitted
    if (isExamSubmitted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleTabSwitch();
      }
    };

    const handleWindowBlur = () => {
      handleTabSwitch();
    };

    const handleBeforeUnload = (e) => {
      if (!isExamSubmitted && !isSubmittingRef.current) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };

    // Add multiple event listeners for better detection
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isExamSubmitted, handleTabSwitch]);

  // Reset count when exam is submitted
  useEffect(() => {
    if (isExamSubmitted) {
      setTabSwitchCount(0);
      setShowWarningPopup(false);
      isSubmittingRef.current = false;
    }
  }, [isExamSubmitted]);

  const handleWarningAcknowledge = useCallback(() => {
    setShowWarningPopup(false);
  }, []);

  return {
    tabSwitchCount,
    showWarningPopup,
    warningMessage,
    handleWarningAcknowledge,
    resetTabSwitchCount: () => setTabSwitchCount(0),
  };
};
