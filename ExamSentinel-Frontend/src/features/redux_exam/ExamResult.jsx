// // // import { useEffect } from "react";
// // // import { useNavigate } from "react-router-dom";
// // // import { useExam, useAuth } from "@/hooks/redux";
// // // import { Button } from "@/components/ui/button";
// // // import { useExamAuditLogger } from "@/hooks/auditLogger/useExamAuditLogger";

// // // export default function ExamResult() {
// // //   const { student } = useAuth();
// // //   const { examResult, isExamSubmitted, isCacheCleanedUp, examName } = useExam();
// // //   const { logExamEvent } = useExamAuditLogger();
// // //   const navigate = useNavigate();
// // //   console.log(examResult, "Result");


// // //   useEffect(() => {
// // //     if (!isExamSubmitted) {
// // //       navigate("/exam");
// // //     }
// // //   }, [isExamSubmitted, navigate]);


// // //   // In your ExamResult component
// // //   useEffect(() => {
// // //     if (isExamSubmitted && isCacheCleanedUp) {
// // //       console.log('✅ Exam submitted and cache cleaned up successfully.');
// // //     } else if (isExamSubmitted && !isCacheCleanedUp) {
// // //       console.warn('⚠️ Exam submitted, but cache cleanup may have failed.');
// // //       // You could display a warning toast here for the user.
// // //     }
// // //   }, [isExamSubmitted, isCacheCleanedUp]);



// // //   useEffect(() => {
// // //     if (examResult?.data?.[0]) {
// // //       logExamEvent("EXAM_RESULT_VIEWED", {
// // //         examId: examResult.data[0].student_exam_id,
// // //         totalQuestions: examResult.data[0].total_questions,
// // //         attempted: examResult.data[0].attempt,
// // //         unattempted: examResult.data[0].unattempted,
// // //       });
// // //     }
// // //   }, [examResult]);

// // //   if (!examResult) {
// // //     return <div className="text-center text-gray-500">Loading result...</div>;
// // //   }

// // //   const {
// // //     student_exam_id,
// // //     total_questions,
// // //     unattempted,
// // //     attempt: attempted,
// // //   } = examResult?.data?.[0] || {};

// // //   return (
// // //     <div className="min-h-screen flex items-center justify-center ">
// // //       <div className="max-w-3xl w-full mx-auto p-6 bg-white shadow rounded">
// // //         <h1 className="text-2xl font-bold text-center text-green-700 mb-4">
// // //           Exam Result - {examName}
// // //         </h1>

// // //         <div className="grid grid-cols-2 gap-4 text-lg text-gray-900">
// // //           <div>
// // //             <span className="font-semibold text-gray-700">Name:</span>{" "}
// // //             {student?.name}
// // //           </div>
// // //           <div>
// // //             <span className="font-semibold text-gray-700">Roll Number:</span>{" "}
// // //             {student?.roll_number}
// // //           </div>
// // //           <div>
// // //             <span className="font-semibold text-gray-700">Exam Name:</span>{" "}
// // //             {examName}
// // //           </div>
// // //           <div>
// // //             <span className="font-semibold text-gray-700">
// // //               Total Questions:
// // //             </span>{" "}
// // //             {total_questions}
// // //           </div>
// // //           <div>
// // //             <span className="font-semibold text-gray-700">Attempted:</span>{" "}
// // //             {attempted}
// // //           </div>
// // //           <div>
// // //             <span className="font-semibold text-gray-700">Unattempted:</span>{" "}
// // //             {unattempted}
// // //           </div>
// // //         </div>

// // //         <div className="mt-6 text-center">
// // //           <Button
// // //             className="cursor-pointer"
// // //             onClick={() => {
// // //               logExamEvent("NAVIGATE_HOME_FROM_RESULT", {
// // //                 studentId: student?.id,
// // //                 studentName: student?.name,
// // //               });
// // //               navigate("/");
// // //             }}
// // //           >
// // //             Back to Home
// // //           </Button>
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // }


import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useExam, useAuth } from "@/hooks/redux";
import { Button } from "@/components/ui/button";
import { useExamAuditLogger } from "@/hooks/auditLogger/useExamAuditLogger";
import { X, CheckCircle, XCircle } from "lucide-react";
import { resetExam } from "@/store/slices/examSlice";

export default function ExamResult() {
  const { student } = useAuth();
  const { examResult, isExamSubmitted, isCacheCleanedUp, examName } = useExam();
  const { logExamEvent } = useExamAuditLogger();
  const navigate = useNavigate();
  const [activeSubjectTab, setActiveSubjectTab] = useState(0);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const result = examResult?.data.reduce(
    (acc, item) => {
      if (item.is_correct === "Y") acc.correct++;
      if (item.is_correct === "N") acc.incorrect++;
      return acc;
    },
    { correct: 0, incorrect: 0 }
  );
  useEffect(() => {
    if (!isExamSubmitted) {
      navigate("/exam");
    }
  }, [isExamSubmitted, navigate]);

  useEffect(() => {
    if (isExamSubmitted && isCacheCleanedUp) {
      console.log('✅ Exam submitted and cache cleaned up successfully.');
      sessionStorage.removeItem("examLanguage");
      sessionStorage.clear();
      resetExam(); // 
    } else if (isExamSubmitted && !isCacheCleanedUp) {
      console.warn('⚠️ Exam submitted, but cache cleanup may have failed.');
    }
  }, [isExamSubmitted, isCacheCleanedUp]);

  useEffect(() => {
    if (examResult?.data?.[0]) {
      logExamEvent("EXAM_RESULT_VIEWED", {
        examId: examResult.data[0].student_exam_id,
        totalQuestions: examResult.data[0].total_questions,
        attempted: examResult.data[0].attempt,
        unattempted: examResult.data[0].unattempted,
      });
    }
  }, [examResult]);

  if (!examResult) {
    return <div className="text-center text-gray-500">Loading result...</div>;
  }

  const {
    student_exam_id,
    total_questions,
    unattempted,
    attempt: attempted,
  } = examResult?.data?.[0] || {};

  // Process the exam result data to organize by subject and section
  const processResultData = () => {
    const questions = examResult?.data || [];

    // Check if any question has subject or section
    const hasSubjectsOrSections = questions.some(
      q => q.question_subject !== null || q.section !== null
    );

    if (!hasSubjectsOrSections) {
      // Return flat structure without subjects/sections
      return {
        hasSubjects: false,
        questions: questions.map(q => ({
          id: q.student_question_id,
          subject: q.question_subject,
          section: q.section,
          compositeKey: `${q.student_question_id}-${q.question_subject}-${q.section}`,
          uniqueId: q.question_id,
          isCorrect: q.is_correct === 'Y',
          selectedOption: q.selected_option || 'Not Attempted',
          correctAnswer: q.correct_answer,
          questionData: q
        }))

      };
    }

    // Group by subject and section
    const subjectsMap = new Map();

    questions.forEach(q => {
      const subject = q.question_subject || 'General';
      const section = q.section || 'I';

      if (!subjectsMap.has(subject)) {
        subjectsMap.set(subject, new Map());
      }

      const sectionsMap = subjectsMap.get(subject);
      if (!sectionsMap.has(section)) {
        sectionsMap.set(section, []);
      }

      sectionsMap.get(section).push({
        id: q.student_question_id,
        subject,
        section,
        compositeKey: `${q.student_question_id}-${subject}-${section}`,
        uniqueId: q.question_id,
        isCorrect: q.is_correct === 'Y',
        selectedOption: q.selected_option || 'Not Attempted',
        correctAnswer: q.correct_answer,
        questionData: q
      });

    });

    // Convert to array structure
    const subjects = Array.from(subjectsMap.entries()).map(([subjectName, sectionsMap]) => ({
      name: subjectName,
      sections: Array.from(sectionsMap.entries()).map(([sectionName, questions]) => ({
        name: sectionName,
        questions: questions
      }))
    }));

    return {
      hasSubjects: true,
      subjects: subjects
    };
  };

  const resultData = processResultData();

  // Question Box Component
  const QuestionBox = ({ question }) => (
    <div
      onClick={() =>
        setSelectedQuestion(
          selectedQuestion?.compositeKey === question.compositeKey
            ? null
            : question
        )
      }
      className={`w-12 h-12 flex items-center justify-center rounded-lg font-bold text-white text-lg shadow-md transition-all cursor-pointer hover:scale-110
      ${question.isCorrect ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}
      ${selectedQuestion?.compositeKey === question.compositeKey ? 'ring-4 ring-blue-400' : ''}
    `}
    >
      {question.id}
    </div>
  );


  // Question Details Card Component
  const QuestionDetailsCard = () => {
    if (!selectedQuestion) return null;

    return (
      <div className="bg-white rounded-lg shadow-lg border-2 border-blue-400 p-4 mt-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          {selectedQuestion.isCorrect ? (
            <CheckCircle className="w-8 h-8 text-green-500 flex-shrink-0" />
          ) : (
            <XCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
          )}

          {/* Content */}
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                Question {selectedQuestion.id}
              </h3>
              <p className={`text-sm font-semibold ${selectedQuestion.isCorrect ? 'text-green-600' : 'text-red-600'
                }`}>
                {selectedQuestion.isCorrect ? 'Correct Answer' : 'Incorrect Answer'}
              </p>
            </div>

            {/* Your Answer */}
            <div className="bg-gray-50 rounded p-3">
              <p className="text-xs font-semibold text-gray-600 mb-1">Your Answer:</p>
              <p className={`text-base font-bold ${selectedQuestion.selectedOption === 'Not Attempted'
                ? 'text-gray-400 italic'
                : selectedQuestion.isCorrect
                  ? 'text-green-600'
                  : 'text-red-600'
                }`}>
                {selectedQuestion.selectedOption}
              </p>
            </div>

            {/* Correct Answer - Only show if incorrect or not attempted */}
            {(!selectedQuestion.isCorrect && selectedQuestion.correctAnswer) && (
              <div className="bg-green-50 rounded p-3 border border-green-200">
                <p className="text-xs font-semibold text-gray-600 mb-1">Correct Answer:</p>
                <p className="text-base font-bold text-green-600">
                  {selectedQuestion.correctAnswer}
                </p>
              </div>
            )}
          </div>

          {/* Close Button */}
          <button
            onClick={() => setSelectedQuestion(null)}
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-5xl w-full mx-auto p-6 space-y-6">
        {/* Student Info Card */}
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-center text-green-700 mb-4">
            Exam Result - {examName}
          </h1>

          <div className="grid grid-cols-2 gap-4 text-lg text-gray-900">
            <div>
              <span className="font-semibold text-gray-700">Name:</span>{" "}
              {student?.name}
            </div>
            <div>
              <span className="font-semibold text-gray-700">Roll Number:</span>{" "}
              {student?.roll_number}
            </div>
            <div>
              <span className="font-semibold text-gray-700">Exam Name:</span>{" "}
              {examName}
            </div>
            {/* add check before showing the total */}
            {
              examResult && examResult?.data.length > 0 && result && <div>
                <span className="font-semibold text-gray-700">
                  Total Obtain Marks:
                </span>{" "}
                {result?.correct}/{examResult.data.length}
              </div>
            }
            <div>
              <span className="font-semibold text-gray-700">Correct:</span>{" "}
              <span className="text-green-600 font-bold">{result.correct}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Incorrect:</span>{" "}
              <span className="text-red-600 font-bold">{result.incorrect}</span>
            </div>
          </div>
        </div>

        {/* Results Display */}
        {resultData.hasSubjects ? (
          // Display with subjects/sections using tabs
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Tabs Header */}
            <div className="flex border-b border-gray-200 bg-gray-50 overflow-x-auto">
              {resultData.subjects.map((subject, index) => (
                <button
                  key={index}
                  onClick={() => setActiveSubjectTab(index)}
                  className={`flex-1 px-6 py-4 font-semibold text-lg transition-all whitespace-nowrap ${activeSubjectTab === index
                    ? 'bg-white text-indigo-600 border-b-4 border-indigo-600'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                    }`}
                >
                  {subject.name}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {resultData.subjects[activeSubjectTab] && (
                <div className="space-y-5">
                  {resultData.subjects[activeSubjectTab].sections.map((section, sectionIndex) => (
                    <div key={sectionIndex}>
                      <h3 className="text-xl font-semibold text-gray-700 mb-3">
                        {section.name}
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {section.questions.map((question) => (
                          <QuestionBox
                            key={question.uniqueId}
                            question={question}
                          />
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Question Details Card */}
                  <QuestionDetailsCard />
                </div>
              )}
            </div>
          </div>
        ) : (
          // Display without subjects (flat list)
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-indigo-200">
              All Questions
            </h2>
            <div className="flex flex-wrap gap-3">
              {resultData.questions.map((question) => (
                <QuestionBox
                  key={question.uniqueId}
                  question={question}
                />
              ))}
            </div>

            {/* Question Details Card */}
            <QuestionDetailsCard />
          </div>
        )}

        {/* Back Button */}
        {/* <div className="text-center">
          <Button
            className="cursor-pointer"
            onClick={() => {
              logExamEvent("NAVIGATE_EXAM_END_FROM_RESULT", {
                studentId: student?.id,
                studentName: student?.name,
              });
              navigate("/exam-end");
            }}
          >
            Exist
          </Button>
        </div> */}
      </div>
    </div>
  );
}