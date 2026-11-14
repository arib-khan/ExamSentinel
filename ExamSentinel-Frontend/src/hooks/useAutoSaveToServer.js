import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { saveDraft } from "@/store/slices/examSlice";

export const useAutoSaveToServer = () => {
  const dispatch = useDispatch();
  const {
    isExamStarted,
    isExamSubmitted,
    answers,
    examTimeLeft,
    currentQuestionIndex,
  } = useSelector((state) => state.exam);

  useEffect(() => {
    if (!isExamStarted || isExamSubmitted) return;

    const interval = setInterval(() => {
      // ✅ Save to server
      dispatch(saveDraft());

      // ✅ Also store locally
      const localDraft = {
        answers,
        examTimeLeft,
        currentQuestionIndex,
        lastSavedAt: new Date().toISOString(),
      };
      localStorage.setItem("exam_draft", JSON.stringify(localDraft));
    }, 15000);

    return () => clearInterval(interval);
  }, [
    dispatch,
    isExamStarted,
    isExamSubmitted,
    answers,
    examTimeLeft,
    currentQuestionIndex,
  ]);
};
