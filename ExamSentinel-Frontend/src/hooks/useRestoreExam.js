import { useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  updateAnswer,
  setCurrentQuestionIndex,
  forceSubmitExam,
} from "@/store/slices/examSlice";
import axios from "axios";
import { toast } from "sonner";

export const useRestoreExam = (studentId, token) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const restore = async () => {
      const localData = localStorage.getItem("exam_draft");
      if (localData) {
        const parsed = JSON.parse(localData);
        parsed.answers.forEach((ans, index) => {
          if (ans) {
            dispatch(updateAnswer({ index, answerData: ans }));
          }
        });
        dispatch(setCurrentQuestionIndex(parsed.currentQuestionIndex));
        toast.info("Exam restored from local data.");
        return;
      }

      // Else fetch from server
      try {
        const res = await axios.get(
          `http://localhost:3001/api/exam/get-draft?student_id=${studentId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const { answers, time_left, current_question_index } = res.data;

        answers.forEach((ans, index) => {
          if (ans) {
            dispatch(updateAnswer({ index, answerData: ans }));
          }
        });
        dispatch(setCurrentQuestionIndex(current_question_index));
        toast.success("Draft loaded from server.");
      } catch (err) {
        toast.warning("No draft found, starting fresh.");
      }
    };

    restore();
  }, [dispatch, studentId, token]);
};
