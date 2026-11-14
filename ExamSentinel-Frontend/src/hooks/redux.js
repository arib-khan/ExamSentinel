// hooks/redux.js
import { resetExam } from '@/store/slices/examSlice';
import { useDispatch, useSelector } from 'react-redux';

export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

export const useAuth = () => {
  const auth = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();
  
  return {
    ...auth,
    dispatch,
  };
};

export const useExam = () => {
  const exam = useAppSelector(state => state.exam);
  const dispatch = useAppDispatch();

  const attemptedCount = exam.answers.filter(a => a && a.selected_option != null).length;
  const remainingCount = exam.totalQuestions - attemptedCount;

  // const visitedIndices = exam.answers
  //   .map((ans, idx) => (ans ? idx : null))
  //   .filter(v => v !== null);

  const visitedIndices = exam.visitedQuestions;
  // console.log(visitedIndices, "visitedIndices in useExam");
  


  // const answeredIndices = exam.answers
  //   .map((ans, idx) => (ans && ans.selected_option != null ? idx : null))
  //   .filter(v => v !== null);

  // const answeredIndices = exam.answers
  // .map((ans, idx) => {
  //   if (!ans) return null;
  //   const hasMCQAnswer = ans.selected_option !== null && ans.selected_option !== undefined;
  //   const hasNumericAnswer = ans.answer_text !== null && ans.answer_text !== "";
  //   return hasMCQAnswer || hasNumericAnswer ? idx : null;
  // })
  // .filter(v => v !== null);
  

const answeredIndices = exam.answers
  .map((ans, idx) => {
    if (!ans) return null;

    const hasMCQAnswer =
      ans.selected_option !== null &&
      ans.selected_option !== undefined &&
      ans.selected_option !== "";

    const hasNumericAnswer =
      typeof ans.answer_text === "string" && ans.answer_text.trim() !== "";

    return (hasMCQAnswer || hasNumericAnswer) ? idx : null;
  })
  .filter(v => v !== null);


  // console.log(answeredIndices, "answeredIndices in useExam");
  


  const notAnsweredIndices = visitedIndices.filter(
    i => !answeredIndices.includes(i)
  );

  const markedForReviewIndices = exam.answers
    .map((ans, idx) => (ans?.marked_for_review ? idx : null))
    .filter(v => v !== null);

  // const answeredMarkedForReviewIndices = exam.answers
  //   .map((ans, idx) =>
  //     ans?.marked_for_review && ans?.selected_option != null ? idx : null
  //   )
  //   .filter(v => v !== null);

  const answeredMarkedForReviewIndices = exam.answers
  .map((ans, idx) => {
    if (!ans) return null;
    const hasAnswer = (ans.selected_option !== null && ans.selected_option !== undefined) || (ans.answer_text && ans.answer_text.trim() !== "");
    return ans.marked_for_review && hasAnswer ? idx : null;
  })
  .filter(v => v !== null);

    const resetExamState = () => dispatch(resetExam());


  return {
    ...exam,
    dispatch,
    attemptedCount,
    remainingCount,
    visitedIndices,
    answeredIndices,
    notAnsweredIndices,
    markedForReviewIndices,
    answeredMarkedForReviewIndices,
    resetExam: resetExamState,
  };
};

export const useUI = () => {
  const ui = useAppSelector(state => state.ui);
  const dispatch = useAppDispatch();
  
  return {
    ...ui,
    dispatch,
  };
};
