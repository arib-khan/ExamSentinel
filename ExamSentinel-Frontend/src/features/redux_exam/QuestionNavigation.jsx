// import { useExamAuditLogger, useOptionAuditLogger } from "@/hooks/auditLogger/useExamAuditLogger";
// import { useExam } from "@/hooks/redux";
// import {
//   setCurrentQuestionIndex,
//   fetchQuestion,
//   resetQuestionTime,
// } from "@/store/slices/examSlice";

// export default function QuestionNavigation({ questions }) {
//   const { logExamEvent } = useExamAuditLogger();
//   const { optionEvents } = useOptionAuditLogger();
//   const {
//     totalQuestions,
//     currentQuestionIndex,
//     visitedIndices,
//     answeredIndices,
//     markedForReviewIndices,
//     dispatch,
//     currentQuestion,
//     visitedQuestions,
//   } = useExam();

//   const handleQuestionSelect = async (questionIndex) => {
//     if (questionIndex !== currentQuestionIndex) {

//       optionEvents(`QUESTION_NAVIGATION ${currentQuestionIndex + 1} to ${questionIndex + 1}`, {
//         student_question_map: currentQuestionIndex + 1,
//         from_ques: currentQuestionIndex + 1,
//         to_ques: questionIndex + 1,
//       });
//       dispatch(setCurrentQuestionIndex(questionIndex));
//       try {
//         await dispatch(fetchQuestion(questionIndex)).unwrap();
//         dispatch(resetQuestionTime());
//       } catch (error) {
//         console.error("Failed to fetch question:", error);
//       }
//     }
//   };

//   const getQuestionStatus = (index) => {
//     const isAnswered = answeredIndices.includes(index);
//     const isMarkedForReview = markedForReviewIndices.includes(index);
//     const isVisited = visitedIndices.includes(index);
//     const isCurrent = index === currentQuestionIndex;

//     if (isCurrent) return "current";
//     if (isAnswered && isMarkedForReview) return "answered-marked";
//     if (isAnswered) return "answered";
//     if (isMarkedForReview) return "marked";
//     if (isVisited) return "visited";
//     return "not-visited";
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "current":
//         return "bg-blue-600 text-white border-blue-600";
//       case "answered":
//         return "bg-green-600 text-white border-green-600";
//       case "answered-marked":
//         return "bg-orange-600 text-white border-orange-600";
//       case "marked":
//         return "bg-yellow-500 text-white border-yellow-500";
//       case "visited":
//         return "bg-gray-300 text-gray-800 border-gray-400";
//       default:
//         return "bg-white text-gray-700 border-gray-300 hover:bg-gray-50";
//     }
//   };

//   console.log(questions);

//   const questionNumbers = Array.from({ length: questions }, (_, i) => i);

//   return (
//     <div className="p-4 space-y-4 overflow-y-auto max-h-[100vh]">
//       {/* Title */}
//       <h3 className="text-sm font-semibold text-gray-700">Question Palette</h3>

//       {/* Grid of question buttons */}
//       <div className="grid grid-cols-6 gap-2">
//         {questionNumbers.map((questionIndex) => {
//           const status = getQuestionStatus(questionIndex);
//           const colorClass = getStatusColor(status);

//           return (
//             <button
//               key={questionIndex}
//               onClick={() => handleQuestionSelect(questionIndex)}
//               className={`w-8 h-8 text-sm font-medium rounded border-2 transition-all duration-200 cursor-pointer ${colorClass}`}
//               title={`Question ${questionIndex + 1}`}
//             >
//               {questionIndex + 1}
//             </button>
//           );
//         })}
//       </div>

//       {/* Summary (inline with legend now) */}
//       <div className="grid grid-cols-2 gap-2 text-xs mt-4">
//         <div className="flex items-center space-x-2">
//           <div className="w-4 h-4 bg-green-600 rounded border"></div>
//           <span className="text-gray-700 font-bold">
//             Answered: {answeredIndices.length}
//           </span>
//         </div>
//         <div className="flex items-center space-x-2">
//           <div className="w-4 h-4 bg-gray-400 rounded border"></div>
//           <span className="text-gray-700 font-bold">
//             Visited:{visitedIndices.length}
//           </span>
//         </div>
//         <div className="flex items-center space-x-2">
//           <div className="w-4 h-4 bg-yellow-500 rounded border"></div>
//           <span className="text-gray-700 font-bold">
//             Reviewed: {markedForReviewIndices.length}
//           </span>
//         </div>
//         <div className="flex items-center space-x-2">
//           <div className="w-4 h-4 bg-orange-600 rounded border"></div>
//           <span className="text-gray-700 font-bold">Answered & Marked</span>
//         </div>
//         <div className="flex items-center space-x-2">
//           <div className="w-4 h-4 bg-white border border-gray-300 rounded"></div>
//           <span className="text-gray-700 font-bold">
//             Not Visited: {totalQuestions - visitedIndices.length}
//           </span>
//         </div>
//         <div className="flex items-center space-x-2">
//           <div className="w-4 h-4 bg-blue-600 rounded border"></div>
//           <span className="text-gray-700 font-bold">Current</span>
//         </div>
//       </div>
//     </div>
//   );
// }

// components/QuestionNavigation.jsx - Enhanced with Subject/Section Support
import { useExamAuditLogger, useOptionAuditLogger } from "@/hooks/auditLogger/useExamAuditLogger";
import { useExam } from "@/hooks/redux";
import {
  setCurrentQuestionIndex,
  fetchQuestion,
  resetQuestionTime,
  findQuestionLocation,
} from "@/store/slices/examSlice";

export default function QuestionNavigation({
  questions,
  selectedSubject,
  selectedSection,
  isSubjectSectionMode
}) {
  const { logExamEvent } = useExamAuditLogger();
  const { optionEvents } = useOptionAuditLogger();
  const {
    totalQuestions,
    currentQuestionIndex,
    visitedIndices,
    answeredIndices,
    markedForReviewIndices,
    answeredMarkedForReviewIndices,
    dispatch,
    currentQuestion,
    visitedQuestions,
    subjectStructure,
  } = useExam();

  // const handleQuestionSelect = async (questionIndex) => {
  //   if (questionIndex !== currentQuestionIndex) {
  //     // optionEvents(`QUESTION_NAVIGATION ${currentQuestionIndex + 1} to ${questionIndex + 1}`, {
  //     //   student_question_map: currentQuestionIndex + 1,
  //     //   from_ques: currentQuestionIndex + 1,
  //     //   to_ques: questionIndex + 1,
  //     //   question_subject: selectedSubject?.subject || null,
  //     //   section: selectedSection?.section || null,
  //     // });

  //     let fromQuestionNumber, toQuestionNumber;

  //     // Determine the question numbers to log based on the mode
  //     if (isSubjectSectionMode) {
  //       // Get locations for both the current and the new question
  //       const fromLocation = findQuestionLocation(currentQuestionIndex, subjectStructure);
  //       const toLocation = findQuestionLocation(questionIndex, subjectStructure);

  //       // Use the local number if available, otherwise fall back to global
  //       fromQuestionNumber = fromLocation ? fromLocation.localQuestionIndex + 1 : currentQuestionIndex + 1;
  //       toQuestionNumber = toLocation ? toLocation.localQuestionIndex + 1 : questionIndex + 1;
  //     } else {
  //       // In default mode, always use the global question index
  //       fromQuestionNumber = currentQuestionIndex + 1;
  //       toQuestionNumber = questionIndex + 1;
  //     }

  //     optionEvents(`QUESTION_NAVIGATION from ${fromQuestionNumber} to ${toQuestionNumber}`, {
  //       student_question_map: fromQuestionNumber, // This is the starting point
  //       from_ques: fromQuestionNumber,
  //       to_ques: toQuestionNumber,
  //       question_subject: selectedSubject?.subject || null,
  //       from_section: selectedSection?.section || null,
  //       to_section: selectedSection?.section || null,
  //     });
  //     dispatch(setCurrentQuestionIndex(questionIndex));
  //     try {
  //       await dispatch(fetchQuestion(questionIndex)).unwrap();
  //       dispatch(resetQuestionTime());
  //     } catch (error) {
  //       console.error("Failed to fetch question:", error);
  //     }
  //   }
  // };

  const handleQuestionSelect = async (questionIndex) => {
    if (questionIndex !== currentQuestionIndex) {
      let fromQuestionNumber, toQuestionNumber;
      let fromSubject = null, fromSection = null;
      let toSubject = null, toSection = null;

      if (isSubjectSectionMode) {
        const fromLocation = findQuestionLocation(currentQuestionIndex, subjectStructure);
        const toLocation = findQuestionLocation(questionIndex, subjectStructure);

        fromQuestionNumber = fromLocation ? fromLocation.localQuestionIndex + 1 : currentQuestionIndex + 1;
        toQuestionNumber = toLocation ? toLocation.localQuestionIndex + 1 : questionIndex + 1;

        // Get the subject and section from the location objects
        fromSubject = fromLocation ? fromLocation.subject : null;
        fromSection = fromLocation ? fromLocation.section : null;
        toSubject = toLocation ? toLocation.subject : null;
        toSection = toLocation ? toLocation.section : null;

      } else {
        fromQuestionNumber = currentQuestionIndex + 1;
        toQuestionNumber = questionIndex + 1;
      }

      optionEvents(`QUESTION_NAVIGATION from ${fromQuestionNumber} to ${toQuestionNumber}`, {
        student_question_map: fromQuestionNumber,
        from_ques: fromQuestionNumber,
        to_ques: toQuestionNumber,
        // Use the variables determined above
        question_subject: fromSubject,
        from_section: fromSection,
        // to_subject: toSubject,
        to_section: toSection,
      });

      dispatch(setCurrentQuestionIndex(questionIndex));
      try {
        await dispatch(fetchQuestion(questionIndex)).unwrap();
        dispatch(resetQuestionTime());
      } catch (error) {
        console.error("Failed to fetch question:", error);
      }
    }
  };
  const getQuestionStatus = (index) => {
    const isAnswered = answeredIndices.includes(index);
    const isMarkedForReview = markedForReviewIndices.includes(index);
    const isVisited = visitedIndices.includes(index);
    const isCurrent = index === currentQuestionIndex;

    if (isCurrent) return "current";
    if (isAnswered && isMarkedForReview) return "answered-marked";
    if (isAnswered) return "answered";
    if (isMarkedForReview) return "marked";
    if (isVisited) return "visited";
    return "not-visited";
  };



  const getStatusColor = (status) => {
    switch (status) {
      case "current":
        return "bg-blue-600 text-white border-blue-600";
      case "answered":
        return "bg-green-600 text-white border-green-600";
      case "answered-marked":
        return "bg-orange-600 text-white border-orange-600";
      case "marked":
        return "bg-yellow-500 text-white border-yellow-500";
      case "visited":
        return "bg-gray-300 text-gray-800 border-gray-400";
      default:
        return "bg-white text-gray-700 border-gray-300 hover:bg-gray-50";
    }
  };

  // Generate question numbers based on mode
  const getQuestionNumbers = () => {
    if (!isSubjectSectionMode || !selectedSection) {
      // Legacy mode: show all questions from 0 to totalQuestions-1
      return Array.from({ length: questions }, (_, i) => i);
    }

    // Subject/Section mode: show questions for selected section
    const startIndex = selectedSection.startIndex;
    const endIndex = selectedSection.endIndex;
    return Array.from({ length: endIndex - startIndex + 1 }, (_, i) => startIndex + i);
  };

  // Get question display number (what user sees)
  const getDisplayNumber = (globalIndex) => {
    if (!isSubjectSectionMode || !selectedSection) {
      return globalIndex + 1;
    }

    // Show local question number within section
    return globalIndex - selectedSection.startIndex + 1;
  };

  // Get section-specific answered count
  const getSectionAnsweredCount = () => {
    if (!isSubjectSectionMode || !selectedSection) {
      return answeredIndices.length;
    }

    const startIndex = selectedSection.startIndex;
    const endIndex = selectedSection.endIndex;
    return answeredIndices.filter(index => index >= startIndex && index <= endIndex).length;
  };

  // Get section-specific visited count
  const getSectionVisitedCount = () => {
    if (!isSubjectSectionMode || !selectedSection) {
      return visitedIndices.length;
    }

    const startIndex = selectedSection.startIndex;
    const endIndex = selectedSection.endIndex;
    return visitedIndices.filter(index => index >= startIndex && index <= endIndex).length;
  };

  // Get section-specific marked count
  const getSectionMarkedCount = () => {
    if (!isSubjectSectionMode || !selectedSection) {
      return markedForReviewIndices.length;
    }

    const startIndex = selectedSection.startIndex;
    const endIndex = selectedSection.endIndex;
    return markedForReviewIndices.filter(index => index >= startIndex && index <= endIndex).length;
  };

  // Get section-specific not visited count
  const getSectionNotVisitedCount = () => {
    if (!isSubjectSectionMode || !selectedSection) {
      return totalQuestions - visitedIndices.length;
    }

    return selectedSection.questionCount - getSectionVisitedCount();
  };

  const questionNumbers = getQuestionNumbers();
  const sectionAnsweredCount = getSectionAnsweredCount();
  const sectionVisitedCount = getSectionVisitedCount();
  const sectionMarkedCount = getSectionMarkedCount();
  const sectionNotVisitedCount = getSectionNotVisitedCount();

  return (
    <div className="p-4 space-y-4 overflow-y-auto max-h-[100vh]">
      {/* Title */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-700">Question Palette</h3>
      </div>

      {/* Grid of question buttons */}
      <div className="grid grid-cols-6 gap-2">
        {questionNumbers.map((globalQuestionIndex) => {
          const status = getQuestionStatus(globalQuestionIndex);
          const colorClass = getStatusColor(status);
          const displayNumber = getDisplayNumber(globalQuestionIndex);

          return (
            <button
              key={globalQuestionIndex}
              onClick={() => handleQuestionSelect(globalQuestionIndex)}
              className={`w-8 h-8 text-sm font-medium rounded border-2 transition-all duration-200 cursor-pointer ${colorClass}`}
              title={`Question ${globalQuestionIndex + 1}${isSubjectSectionMode ? ` (${selectedSubject?.subject} - ${selectedSection?.section})` : ''}`}
            >
              {displayNumber}
            </button>
          );
        })}
      </div>


      {/* Summary (inline with legend now) */}
      <div className="grid grid-cols-2 gap-2 text-xs mt-4">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-600 rounded border"></div>
          <span className="text-gray-700 font-bold">
            Answered: {sectionAnsweredCount}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-400 rounded border"></div>
          <span className="text-gray-700 font-bold">
            Visited: {sectionVisitedCount}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-500 rounded border"></div>
          <span className="text-gray-700 font-bold">
            Reviewed: {sectionMarkedCount}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-orange-600 rounded border"></div>
          <span className="text-gray-700 font-bold">Answered & Marked</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-white border border-gray-300 rounded"></div>
          <span className="text-gray-700 font-bold">

            Not Visited: {sectionNotVisitedCount}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-600 rounded border"></div>
          <span className="text-gray-700 font-bold">Current</span>

        </div>
      </div>
    </div>
  );
}