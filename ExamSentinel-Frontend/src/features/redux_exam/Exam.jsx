// // components/Exam.jsx
// import { useEffect, useState } from "react";
// import { Calculator, ChevronLeft, ChevronRight, Delete, Flag, RotateCcw } from "lucide-react";
// import { Card, CardContent } from "@/components/ui/card";
// import { toast } from "sonner";
// import { useAuth, useExam, useUI } from "@/hooks/redux";
// import {
//   fetchQuestion,
//   setCurrentQuestionIndex,
//   setSelectedOption,
//   updateAnswer,
//   saveAnswer,
//   clearSelectedOption,
//   resetQuestionTime,
// } from "@/store/slices/examSlice";
// import { useAutoSaveToServer } from "@/hooks/useAutoSaveToServer";
// import { showSubmitConfirmation } from "@/store/slices/uiSlice";
// import {
//   useExamAuditLogger,
//   useOptionAuditLogger,
// } from "@/hooks/auditLogger/useExamAuditLogger";

// export default function Exam() {
//   const { logExamEvent } = useExamAuditLogger();
//   const { optionEvents } = useOptionAuditLogger();
//   const [answerText, setAnswerText] = useState('');
//   const [isLarge, setIsLarge] = useState(false);
//   useAutoSaveToServer();
//   const {
//     currentQuestion,
//     currentQuestionIndex,
//     selectedOption,
//     totalQuestions,
//     answers,
//     questionTimeLeft,
//     examTimeLeft,
//     isLoading,
//     isSavingAnswer,
//     dispatch,
//     examName,
//   } = useExam();
//   const { student } = useAuth();
//   const { dispatch: uiDispatch } = useUI();
//   const [showSubmitButton, setShowSubmitButton] = useState(false);
//   const [markedForReview, setMarkedForReview] = useState(false);
//   const [imageUrls, setImageUrls] = useState({});

//   useEffect(() => {
//     const cache = window.examImageCache;
//     if (!cache || typeof cache.getImage !== "function" || !currentQuestion) {
//       setImageUrls({}); // Clear images if no question or cache is available
//       return;
//     }
//     const imageRefs = [];
//     // Add question image ref
//     if (currentQuestion.imageRef) {
//       imageRefs.push(currentQuestion.imageRef);
//     }
//     // Add option image refs
//     [
//       "option_a_image",
//       "option_b_image",
//       "option_c_image",
//       "option_d_image",
//     ].forEach((key) => {
//       if (currentQuestion[key]) {
//         imageRefs.push(currentQuestion[key]);
//       }
//     });

//     const newImageUrls = {};
//     imageRefs.forEach((ref) => {
//       const imageData = cache.getImage(ref);
//       if (imageData) {
//         newImageUrls[ref] = imageData.url;
//       }
//     });

//     setImageUrls(newImageUrls);
//   }, [currentQuestion]);

//   useEffect(() => {
//     const currentAnswer = answers[currentQuestionIndex];
//     if (currentAnswer) {
//       dispatch(setSelectedOption(currentAnswer.selected_option));
//       setMarkedForReview(currentAnswer.marked_for_review || false);
//     } else {
//       dispatch(clearSelectedOption());
//       setMarkedForReview(false);
//     }
//   }, [currentQuestionIndex, answers, dispatch]);

//   const handleOptionSelect = (letter) => {
//     dispatch(setSelectedOption(letter)); // e.g., "A", "B"
//     optionEvents("OPTION_SELECTED", {
//       student_question_map: currentQuestionIndex + 1,
//       selected_option: letter,
//       is_final_submission: false,
//     });
//   };

//   const handleSaveAndNext = async () => {
//     // if (!selectedOption) {
//     //   toast.warning("Please select an option before proceeding.");
//     //   return;
//     // }
//     if (currentQuestion.question_type === "MCQ" && !selectedOption) {
//       toast.warning("Please select an option before proceeding.");
//       return;
//     }

//     if (currentQuestion.question_type === "NUMERICAL" && !answerText) {
//       toast.warning("Please enter a numerical answer before proceeding.");
//       return;
//     }
//     // await saveCurrentAnswer(markedForReview, false, true); // showToast = true
//     // optionEvents("SAVE_AND_NEXT", {
//     //   question_id: currentQuestion.id,
//     //   selected_option: selectedOption,
//     //   // markedForReview,
//     // });

//     if (currentQuestionIndex === totalQuestions - 1) {
//       setShowSubmitButton(true); // show submit button after saving last question
//     }
//     else {
//       handleSaveNext();
//     }
//   };

//   const handleMarkForReview = async () => {
//     const newMarkedState = !markedForReview;
//     setMarkedForReview(newMarkedState);
//     await saveCurrentAnswer(newMarkedState, true, false); // showToast = true


//     optionEvents("MARK_FOR_REVIEW_TOGGLE", {
//       student_question_map: currentQuestionIndex + 1,
//       mark_for_review: !markedForReview,
//     });
//   };

//   // const handleClearResponse = async () => {
//   //   dispatch(setSelectedOption(null));
//   //   await saveCurrentAnswer(false, true, true, true);

//   //   optionEvents("CLEAR_RESPONSE", {
//   //     student_question_map: currentQuestionIndex + 1,
//   //   });
//   // };

//   const handleClearResponse = async () => {
//     if (currentQuestion.question_type === "MCQ") {
//       dispatch(setSelectedOption(null));
//     }

//     if (currentQuestion.question_type === "NUMERICAL") {
//       setAnswerText(""); // clear numeric input
//     }

//     await saveCurrentAnswer(false, true, true, true); // forceClear = true

//     optionEvents("CLEAR_RESPONSE", {
//       student_question_map: currentQuestionIndex + 1,
//     });
//   };


//   const saveCurrentAnswer = async (
//     reviewState = markedForReview,
//     stayOnQuestion = false,
//     showToast = false,
//     forceClear = false,
//     markSeen = false
//   ) => {
//     const answerData = {
//       id: currentQuestionIndex + 1,
//       // selected_option: forceClear ? null : selectedOption,
//       marked_for_review: reviewState,
//       que_seen: markSeen || true,
//       time_spent: examTimeLeft, // Time spent on this question
//       stayOnQuestion,
//       selected_option: currentQuestion.question_type === "MCQ"
//         ? (forceClear ? null : selectedOption)
//         : null,
//       answer_text: currentQuestion.question_type === "NUMERICAL"
//         ? (forceClear ? "" : answerText)
//         : null,
//     };

//     // Update local state immediately
//     dispatch(
//       updateAnswer({
//         index: currentQuestionIndex,
//         answerData,
//       })
//     );

//     // Save to backend
//     try {
//       await dispatch(saveAnswer(answerData)).unwrap();

//     } catch (error) {
//       toast.error("Failed to save answer");
//     }
//   };

//   const navigateToQuestion = async (questionIndex, click) => {
//     if (questionIndex >= 0 && questionIndex < totalQuestions) {
//       // Save current answer before navigating (without toast)
//       // if (selectedOption !== null || markedForReview) {
//       //   await saveCurrentAnswer(markedForReview, false, false, false, true); // showToast = false
//       // }
//       if (
//         currentQuestion.question_type === "MCQ" && selectedOption !== null ||
//         currentQuestion.question_type === "NUMERICAL" && answerText !== "" ||
//         markedForReview
//       ) {
//         await saveCurrentAnswer(markedForReview, false, false, false, true);
//       }

//       optionEvents(`${click} - QUESTION_NAVIGATED from ${currentQuestionIndex + 1} to ${questionIndex + 1}`, {
//         from_ques: currentQuestionIndex + 1,
//         to_ques: questionIndex + 1,
//         selected_option: selectedOption,
//         student_question_map: currentQuestionIndex + 1,
//       });

//       // Navigate to new question
//       dispatch(setCurrentQuestionIndex(questionIndex));

//       // Fetch question if not cached
//       if (!currentQuestion || currentQuestionIndex !== questionIndex) {
//         try {
//           await dispatch(fetchQuestion(questionIndex)).unwrap();
//         } catch (error) {
//           toast.error("Failed to load question");
//         }
//       }

//       // Reset question timer
//       dispatch(resetQuestionTime());
//     }
//   };

//   const handlePrevious = () => {
//     if (currentQuestionIndex > 0) {
//       const click = "Previous";
//       navigateToQuestion(currentQuestionIndex - 1, click);
//     }
//   };

//   const handleSaveNext = () => {
//     if (currentQuestionIndex < totalQuestions - 1) {
//       const click = "Save & Next";
//       navigateToQuestion(currentQuestionIndex + 1, click);
//     }
//   };
//   const handleNext = () => {
//     if (currentQuestionIndex < totalQuestions - 1) {
//       const click = "Next";
//       navigateToQuestion(currentQuestionIndex + 1, click);
//     }
//   };
//   //  for Calculator keypad
//   const handleNumericInput = (value) => {
//     setAnswerText(value);
//   };

//   useEffect(() => {
//     if (currentQuestionIndex !== totalQuestions - 1) {
//       setShowSubmitButton(false);
//     }
//   }, [currentQuestionIndex, totalQuestions]);

//   const handleSubmitExam = () => {
//     logExamEvent("EXAM_SUBMIT_CLICKED", {
//       student_question_map: currentQuestionIndex + 1,
//     });

//     uiDispatch(showSubmitConfirmation());
//   };

//   if (!currentQuestion) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <div className="text-center">
//           <p className="text-red-500">Failed to load question</p>
//           <button
//             onClick={() => dispatch(fetchQuestion(currentQuestionIndex))}
//             className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="h-[87vh] flex flex-col max-w-5xl mx-auto">
//       {/* Question Header - Fixed height */}
//       <Card className="flex-shrink-0 bg-transparent text-black">
//         <CardContent className="">
//           <div className="flex items-center justify-between">
//             <h2 className="text-lg font-semibold">
//               Question {currentQuestionIndex + 1} of {totalQuestions}
//             </h2>

//             <h2 className="text-lg font-semibold">
//               Question Type: {currentQuestion.question_type}
//             </h2>


//             <div className="flex items-center space-x-2">
//               {markedForReview && (
//                 <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
//                   <Flag size={12} className="mr-1" />
//                   Marked for Review
//                 </span>
//               )}

//               {/* <div
//                 className={`text-sm font-medium ${examTimeLeft <= 300 ? "text-red-600" : "text-black"
//                   }`}
//               >
//                 Time Left : {Math.floor(examTimeLeft / 60)}:
//                 {(examTimeLeft % 60).toString().padStart(2, "0")}
//               </div> */}
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Scrollable Content Area */}
//       <Card className="relative flex-1 flex flex-col min-h-0 mt-1 bg-transparent text-black overflow-hidden">
//         {/* Watermark */}
//         <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">

//           <div className="absolute inset-0 pointer-events-none select-none text-gray-300" aria-hidden>
//             <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
//               <g transform="rotate(-40 50 50)" opacity="0.1">
//                 {/* textLength forces the text to occupy ~80% of card width */}
//                 <text
//                   x="50"
//                   y="50"
//                   dominantBaseline="middle"
//                   textAnchor="middle"
//                   fontWeight="700"
//                   fontSize="12"            /* adjust if you want thicker/thinner text */
//                   lengthAdjust="spacingAndGlyphs"
//                   textLength="80"          /* percent of viewBox width; 80 fits nicely */
//                 >
//                   {student?.roll_number || examName}
//                 </text>
//               </g>
//             </svg>
//           </div>
//         </div>

//         <CardContent className="flex-1 flex flex-col min-h-0">
//           {currentQuestion && (
//             <>
//               {/* Question Section - Flexible based on content */}
//               <div className="flex flex-col min-h-0 max-h-[40%]">
//                 {/* Question Text - Scrollable if needed */}
//                 <div className="flex-1 min-h-0 mb-3">
//                   <div className=" text-base font-medium leading-relaxed h-full overflow-y-auto pr-2">
//                     <span className="text-lg font-bold mr-1">
//                       {" "}
//                       {currentQuestionIndex + 1}.
//                     </span>{" "}
//                     {currentQuestion.question}
//                   </div>
//                 </div>

//                 {/* Question Image - Responsive size */}
//                 {currentQuestion.imageRef &&
//                   imageUrls[currentQuestion.imageRef] && (
//                     <div className="flex-shrink-0">
//                       <img
//                         src={imageUrls[currentQuestion.imageRef]}
//                         alt="Question"
//                         // className="max-w-full h-auto max-h-30 object-contain rounded-sm shadow-md"
//                         className={`rounded-sm shadow-md cursor-pointer transition-all duration-300 
//         ${isLarge ? "fixed top-0 left-0 w-full h-full object-contain bg-black z-50" : "max-w-full h-auto max-h-30 object-contain"}
//       `}
//                         onClick={() => setIsLarge(!isLarge)}
//                       />
//                     </div>
//                   )}
//               </div>


//               <div className="flex-1 min-h-0 mt-3">
//                 <div className="h-full overflow-y-auto p-2">
//                   {
//                     (currentQuestion.question_type === "MCQ" && (
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                         {["option_a", "option_b", "option_c", "option_d"].map(
//                           (key, index) => {
//                             const optionText = currentQuestion[key];
//                             const optionImageRefKey = `${key}_image`;
//                             const optionImageRef =
//                               currentQuestion[optionImageRefKey];
//                             const optionLetter = String.fromCharCode(65 + index);
//                             const isSelected = selectedOption === optionLetter;

//                             return (
//                               <div
//                                 key={optionLetter}
//                                 className={`flex items-start space-x-3 p-3 rounded-md shadow-sm border transition 
//               ${isSelected
//                                     ? "bg-blue-50 border-blue-500 ring-2 ring-blue-400"
//                                     : "bg-gray-50 border-gray-200"
//                                   }`}
//                               >
//                                 <input
//                                   type="radio"
//                                   id={`option-${optionLetter}`}
//                                   name="answer"
//                                   value={optionLetter}
//                                   checked={isSelected}
//                                   onChange={() => handleOptionSelect(optionLetter)}
//                                   className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 flex-shrink-0"
//                                 />

//                                 <label
//                                   htmlFor={`option-${optionLetter}`}
//                                   className="flex flex-col text-gray-800 text-sm cursor-pointer w-full min-w-0"
//                                 >
//                                   <span className="flex items-center">
//                                     <span className="font-semibold mr-4 flex-shrink-0">
//                                       {optionLetter}.
//                                     </span>
//                                     {optionText && (
//                                       <span className="text-base font-medium leading-snug break-words">
//                                         {optionText}
//                                       </span>
//                                     )}
//                                   </span>

//                                   {optionImageRef && imageUrls[optionImageRef] && (
//                                     <div className="mt-2 ml-6">
//                                       <img
//                                         src={imageUrls[optionImageRef]}
//                                         alt={`Option ${optionLetter}`}
//                                         className="max-w-sm max-h-20 object-contain rounded-md shadow"
//                                       />
//                                     </div>
//                                   )}
//                                 </label>
//                               </div>
//                             );
//                           }
//                         )}
//                       </div>
//                     )
//                     )}
//                   {
//                     currentQuestion.question_type === "NUMERICAL" && (
//                       <NumericKeypad
//                         value={answerText}
//                         onChange={handleNumericInput}
//                         onClear={handleClearResponse}
//                         disabled={isSavingAnswer}
//                       />
//                     )
//                   }

//                   {/* <NumericKeypad
//                     value={answerText}
//                     // onChange={handleNumericInput}
//                     // onClear={handleClearNumericInput}
//                     onChange={handleNumericInput}
//                     onClear={handleClearResponse}
//                     disabled={isSavingAnswer}
//                   /> */}

//                 </div>
//               </div>
//             </>
//           )}
//         </CardContent>
//       </Card>

//       {/* Action Buttons - Fixed at bottom */}
//       <div className="flex-shrink-0 mt-4">
//         <div className="flex flex-wrap items-center justify-between gap-3">
//           <div className="flex items-center space-x-2">
//             <button
//               onClick={handlePrevious}
//               disabled={currentQuestionIndex === 0}
//               className="flex items-center space-x-1 px-3 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded text-sm transition duration-300"
//             >
//               <ChevronLeft size={16} />
//               <span>Previous</span>
//             </button>

//             <button
//               onClick={handleNext}
//               disabled={currentQuestionIndex === totalQuestions - 1}
//               className="flex items-center space-x-1 px-3 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded text-sm transition duration-300"
//             >
//               <span>Next</span>
//               <ChevronRight size={16} />
//             </button>
//           </div>

//           <div className="flex items-center space-x-2">
//             <button
//               onClick={handleClearResponse}
//               disabled={selectedOption === null}
//               className="flex items-center space-x-1 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded text-sm transition duration-300"
//             >
//               <RotateCcw size={14} />
//               <span>Clear</span>
//             </button>

//             <button
//               onClick={handleMarkForReview}
//               disabled={isSavingAnswer}
//               className={`flex items-center space-x-1 px-3 py-2 rounded text-sm transition duration-300 ${markedForReview
//                 ? "bg-yellow-600 hover:bg-yellow-700 text-white"
//                 : "bg-yellow-100 hover:bg-yellow-200 text-yellow-800"
//                 }`}
//             >
//               <Flag size={14} />
//               <span>{markedForReview ? "Unreview" : "Review"}</span>
//             </button>


//             {currentQuestionIndex === totalQuestions - 1 ? (
//               showSubmitButton ? (
//                 <button
//                   onClick={handleSubmitExam}
//                   className="w-40 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-2 px-4 rounded transition duration-300"
//                 >
//                   <span>Submit Exam</span>
//                 </button>
//               ) : (
//                 <button
//                   onClick={handleSaveAndNext}
//                   disabled={isSavingAnswer}
//                   className="flex items-center space-x-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded text-sm transition duration-300"
//                 >
//                   <span>{isSavingAnswer ? "Saving..." : "Save"}</span>
//                 </button>
//               )
//             ) : (
//               <button
//                 onClick={handleSaveAndNext}
//                 disabled={isSavingAnswer}
//                 className="flex items-center space-x-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded text-sm transition duration-300"
//               >
//                 <span>{isSavingAnswer ? "Saving..." : "Save & Next"}</span>
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


// // Numeric Keypad Component
// const NumericKeypad = ({ value, onChange, onClear, disabled }) => {
//   const handleKeyClick = (key) => {
//     if (disabled) return;

//     if (key === 'clear') {
//       onClear();
//     } else if (key === 'backspace') {
//       onChange(value.slice(0, -1));
//     } else if (key === '.') {
//       if (!value.includes('.')) {
//         onChange(value + key);
//       }
//     } else {
//       // Prevent leading zeros except for decimal numbers
//       if (value === '0' && key !== '.') {
//         onChange(key);
//       } else {
//         onChange(value + key);
//       }
//     }
//   };

//   const keypadButtons = [
//     ['7', '8', '9'],
//     ['4', '5', '6'],
//     ['1', '2', '3'],
//     ['clear', '0', '.'],
//     ['backspace']
//   ];

//   return (
//     <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-w-xs mx-auto">
//       <div className="mb-3 flex items-center justify-center">
//         <Calculator size={16} className="mr-2 text-gray-600" />
//         <span className="text-sm font-medium text-gray-700">Numeric Keypad</span>
//       </div>

//       {/* Input Display */}
//       <div className="mb-3 p-3 bg-white border border-gray-300 rounded text-right text-lg font-mono min-h-[2.5rem] flex items-center justify-end">
//         <span className={value ? "text-black" : "text-gray-400"}>
//           {value || "0"}
//         </span>
//       </div>

//       {/* Keypad Buttons */}
//       <div className="grid gap-2">
//         {keypadButtons.map((row, rowIndex) => (
//           <div key={rowIndex} className={`grid gap-2 ${row.length === 1 ? 'grid-cols-1' : 'grid-cols-3'}`}>
//             {row.map((key) => (
//               <button
//                 key={key}
//                 onClick={() => handleKeyClick(key)}
//                 disabled={disabled}
//                 className={`h-10 rounded text-sm font-medium transition-colors duration-200 ${key === 'clear'
//                   ? 'bg-red-500 hover:bg-red-600 text-white disabled:bg-red-300'
//                   : key === 'backspace'
//                     ? 'bg-orange-500 hover:bg-orange-600 text-white disabled:bg-orange-300'
//                     : 'bg-blue-500 hover:bg-blue-600 text-white disabled:bg-blue-300'
//                   } disabled:cursor-not-allowed`}
//               >
//                 {key === 'clear' ? 'Clear' : key === 'backspace' ? (<div className="flex justify-center items-center gap-2"><span>Backspace</span><Delete size={16} /> </div>) : key}
//               </button>
//             ))}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };
// components/Exam.jsx
import { useEffect, useState } from "react";
import {
  Calculator,
  ChevronLeft,
  ChevronRight,
  Delete,
  Flag,
  RotateCcw,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth, useExam, useUI } from "@/hooks/redux";
import {
  fetchQuestion,
  setCurrentQuestionIndex,
  setSelectedOption,
  setAnswerText,
  updateAnswer,
  saveAnswer,
  clearSelectedOption,
  clearCurrentAnswer,
  resetQuestionTime,
  selectCurrentQuestionInfo, // NEW: Import the selector
  selectNavigationInfo,
  findQuestionLocation, // NEW: Import the selector
} from "@/store/slices/examSlice";
// import { useAutoSaveToServer } from "@/hooks/useAutoSaveToServer";
import { showSubmitConfirmation, setShowCalculator, toggleCalculator, } from "@/store/slices/uiSlice";
import {
  useExamAuditLogger,
  useOptionAuditLogger,
} from "@/hooks/auditLogger/useExamAuditLogger";
import ImageModal from "./ImageModel";

export default function Exam() {
  const { logExamEvent } = useExamAuditLogger();
  const { optionEvents } = useOptionAuditLogger();
  // const [answerText, setAnswerText] = useState("");
  const [isLarge, setIsLarge] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState(null);
  // useAutoSaveToServer();

  // Updated destructuring to include new state from Redux
  const {
    currentQuestion,
    currentQuestionIndex,
    selectedOption,
    answerText,
    totalQuestions,
    answers,
    questionTimeLeft,
    examTimeLeft,
    isLoading,
    isSavingAnswer,
    dispatch,
    examName,
    isSubjectSectionMode, // NEW: Access the mode flag
    subjectStructure,
  } = useExam();

  const { student } = useAuth();
  const { dispatch: uiDispatch } = useUI();
  const [showSubmitButton, setShowSubmitButton] = useState(false);
  const [markedForReview, setMarkedForReview] = useState(false);
  const [imageUrls, setImageUrls] = useState({});

  // NEW: Use selectors to get dynamic information
  const questionInfo = selectCurrentQuestionInfo({ exam: useExam() });
  const navigationInfo = selectNavigationInfo({ exam: useExam() });

  // console.log("Question Info:", questionInfo);
  // console.log("Navigation Info:", navigationInfo);

  useEffect(() => {
    const cache = window.examImageCache;
    if (!cache || typeof cache.getImage !== "function" || !currentQuestion) {
      setImageUrls({});
      return;
    }
    const imageRefs = [];
    if (currentQuestion.imageRef) {
      imageRefs.push(currentQuestion.imageRef);
    }
    [
      "option_a_image",
      "option_b_image",
      "option_c_image",
      "option_d_image",
    ].forEach((key) => {
      if (currentQuestion[key]) {
        imageRefs.push(currentQuestion[key]);
      }
    });

    const newImageUrls = {};
    imageRefs.forEach((ref) => {
      const imageData = cache.getImage(ref);
      if (imageData) {
        newImageUrls[ref] = imageData.url;
      }
    });

    setImageUrls(newImageUrls);
  }, [currentQuestion]);


  // useEffect(() => {
  //   const currentAnswer = answers[currentQuestionIndex];
  //   if (currentAnswer) {
  //     dispatch(setSelectedOption(currentAnswer.selected_option));
  //     setMarkedForReview(currentAnswer.marked_for_review || false);
  //     if (currentQuestion && currentQuestion.question_type === 'NUMERICAL') {
  //       setAnswerText(currentAnswer.answer_text || '');
  //     }
  //   } else {
  //     dispatch(clearSelectedOption());
  //     setMarkedForReview(false);
  //     if (currentQuestion && currentQuestion.question_type === 'NUMERICAL') {
  //       setAnswerText('');
  //     }
  //   }
  // }, [currentQuestionIndex, answers, dispatch, currentQuestion]);

  // Updated useEffect - now handles both selectedOption and answerText from Redux
  useEffect(() => {
    const currentAnswer = answers[currentQuestionIndex];
    if (currentAnswer) {
      // These are now handled in the Redux store via setCurrentQuestionIndex
      // but we still need to sync markedForReview which is local
      setMarkedForReview(currentAnswer.marked_for_review || false);
    } else {
      setMarkedForReview(false);
      // Clear both option and text when no saved answer - handled by Redux
    }
  }, [currentQuestionIndex, answers]);
  const handleOptionSelect = (letter) => {
    dispatch(setSelectedOption(letter));
    const questionNumber = isSubjectSectionMode
      ? questionInfo.localQuestionNumber
      : currentQuestionIndex + 1;
    optionEvents("OPTION_SELECTED", {
      student_question_map: questionNumber,
      selected_option: letter,
      is_final_submission: false,
      question_subject: questionInfo.subject || null,
      from_section: questionInfo.section || null,
    });
  };

  const handleSaveAndNext = async () => {
    if (currentQuestion.question_type === "MCQ" && !selectedOption) {
      toast.warning("Please select an option before proceeding.");
      return;
    }

    if (currentQuestion.question_type === "NUMERICAL" && !answerText) {
      toast.warning("Please enter a numerical answer before proceeding.");
      return;
    }

    if (currentQuestionIndex === totalQuestions - 1) {
      // to save the last question
      // Save the current answer to the database
      await saveCurrentAnswer(markedForReview, true, false, false, true);

      // Log the save event
      const questionNumber = isSubjectSectionMode
        ? questionInfo.localQuestionNumber
        : currentQuestionIndex + 1;

      optionEvents("LAST_QUESTION_SAVED", {
        student_question_map: questionNumber,
        selected_option: currentQuestion.question_type === "MCQ" ? selectedOption : null,
        answer_text: currentQuestion.question_type === "NUMERICAL" ? answerText : null,
        question_subject: questionInfo.subject || null,
        from_section: questionInfo.section || null,
      });

      // Now show the submit button
      setShowSubmitButton(true);
    } else {
      handleSaveNext();
    }
  };

  const handleMarkForReview = async () => {
    const newMarkedState = !markedForReview;
    setMarkedForReview(newMarkedState);
    await saveCurrentAnswer(newMarkedState, true, false);

    const questionNumber = isSubjectSectionMode
      ? questionInfo.localQuestionNumber
      : currentQuestionIndex + 1;
    optionEvents("MARK_FOR_REVIEW_TOGGLE", {
      student_question_map: questionNumber,
      mark_for_review: newMarkedState,
      question_subject: questionInfo.subject || null,
      from_section: questionInfo.section || null,
    });
  };

  const handleClearResponse = async () => {
    // if (currentQuestion.question_type === "MCQ") {
    //   dispatch(setSelectedOption(null));
    // }

    // if (currentQuestion.question_type === "NUMERICAL") {
    //   setAnswerText("");
    // }
    // NEW: Use Redux action to clear both selectedOption and answerText
    dispatch(clearCurrentAnswer());

    await saveCurrentAnswer(false, true, true, true);


    const questionNumber = isSubjectSectionMode
      ? questionInfo.localQuestionNumber
      : currentQuestionIndex + 1;
    optionEvents("CLEAR_RESPONSE", {
      student_question_map: questionNumber,
      question_subject: questionInfo.subject || null,
      from_section: questionInfo.section || null,
    });
  };

  const saveCurrentAnswer = async (
    reviewState = markedForReview,
    stayOnQuestion = false,
    showToast = false,
    forceClear = false,
    markSeen = false
  ) => {
    const answerData = {
      id: currentQuestionIndex + 1,
      marked_for_review: reviewState,
      que_seen: markSeen || true,
      time_spent: examTimeLeft,
      stayOnQuestion,
      selected_option:
        currentQuestion.question_type === "MCQ"
          ? forceClear
            ? null
            : selectedOption
          : null,
      answer_text:
        currentQuestion.question_type === "NUMERICAL"
          ? forceClear
            ? ""
            : answerText
          : null,
    };

    dispatch(
      updateAnswer({
        index: currentQuestionIndex,
        answerData,
      })
    );

    try {
      await dispatch(saveAnswer(answerData)).unwrap();
    } catch (error) {
      toast.error("Failed to save answer");
    }
  };

  const navigateToQuestion = async (questionIndex, click) => {
    if (questionIndex >= 0 && questionIndex < totalQuestions) {
      if (
        (currentQuestion.question_type === "MCQ" && selectedOption !== null) ||
        (currentQuestion.question_type === "NUMERICAL" && answerText !== "") ||
        markedForReview
      ) {
        await saveCurrentAnswer(markedForReview, false, false, false, true);
      }

      // optionEvents(
      //   `${click} - QUESTION_NAVIGATED from ${currentQuestionIndex + 1} to ${questionIndex + 1
      //   }`,
      //   {
      //     from_ques: currentQuestionIndex + 1,
      //     to_ques: questionIndex + 1,
      //     selected_option: selectedOption,
      //     student_question_map: currentQuestionIndex + 1,
      //     question_subject: questionInfo.subject || null,
      //     section: questionInfo.section || null,
      //   }
      // );
      // let fromQuestionNumber, toQuestionNumber;

      // // Pass the subjectStructure you got from useSelector
      // if (isSubjectSectionMode && subjectStructure) {
      //   const fromLocation = findQuestionLocation(currentQuestionIndex, subjectStructure);
      //   const toLocation = findQuestionLocation(questionIndex, subjectStructure);

      //   fromQuestionNumber = fromLocation ? fromLocation.localQuestionIndex + 1 : currentQuestionIndex + 1;
      //   toQuestionNumber = toLocation ? toLocation.localQuestionIndex + 1 : questionIndex + 1;
      // } else {
      //   fromQuestionNumber = currentQuestionIndex + 1;
      //   toQuestionNumber = questionIndex + 1;
      // }

      // optionEvents(
      //   `${click} - QUESTION_NAVIGATED from ${fromQuestionNumber} to ${toQuestionNumber}`,
      //   {
      //     from_ques: fromQuestionNumber,
      //     to_ques: toQuestionNumber,
      //     selected_option: selectedOption,
      //     student_question_map: fromQuestionNumber,
      //     question_subject: questionInfo.subject || null,
      //     from_section: questionInfo.section || null,
      //     to_section: questionInfo.section || null,
      //   }
      // );
      let fromQuestionNumber, toQuestionNumber;
      let fromSection = null;
      let toSection = null;

      if (isSubjectSectionMode && subjectStructure) {
        const fromLocation = findQuestionLocation(currentQuestionIndex, subjectStructure);
        const toLocation = findQuestionLocation(questionIndex, subjectStructure);

        fromQuestionNumber = fromLocation ? fromLocation.localQuestionIndex + 1 : currentQuestionIndex + 1;
        toQuestionNumber = toLocation ? toLocation.localQuestionIndex + 1 : questionIndex + 1;

        // Extract the section information from the location objects
        fromSection = fromLocation ? fromLocation.section : null;
        toSection = toLocation ? toLocation.section : null;
      } else {
        // Fallback for default mode
        fromQuestionNumber = currentQuestionIndex + 1;
        toQuestionNumber = questionIndex + 1;
      }

      optionEvents(
        `${click} - QUESTION_NAVIGATED from ${fromQuestionNumber} to ${toQuestionNumber}`,
        {
          from_ques: fromQuestionNumber,
          to_ques: toQuestionNumber,
          selected_option: selectedOption,
          student_question_map: fromQuestionNumber,
          question_subject: questionInfo.subject || null,
          // Use the extracted from/to section variables
          from_section: fromSection,
          to_section: toSection,
        }
      );

      dispatch(setCurrentQuestionIndex(questionIndex));

      if (!currentQuestion || currentQuestionIndex !== questionIndex) {
        try {
          await dispatch(fetchQuestion(questionIndex)).unwrap();
        } catch (error) {
          toast.error("Failed to load question");
        }
      }

      dispatch(resetQuestionTime());
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      const click = "Previous";
      navigateToQuestion(currentQuestionIndex - 1, click);
    }
  };

  const handleSaveNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      const click = "Save & Next";
      navigateToQuestion(currentQuestionIndex + 1, click);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      const click = "Next";
      navigateToQuestion(currentQuestionIndex + 1, click);
    }
  };

  // const handleNumericInput = (value) => {
  //   setAnswerText(value);
  // };
  const handleNumericInput = (value) => {
    dispatch(setAnswerText(value));
  };


  useEffect(() => {
    if (currentQuestionIndex !== totalQuestions - 1) {
      setShowSubmitButton(false);
    }
  }, [currentQuestionIndex, totalQuestions]);

  const handleSubmitExam = () => {
    logExamEvent("EXAM_SUBMIT_CLICKED", {
      student_question_map: currentQuestionIndex + 1,
    });
    uiDispatch(showSubmitConfirmation());
  };

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-500">Failed to load question</p>
          <button
            onClick={() => dispatch(fetchQuestion(currentQuestionIndex))}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    // <div className="h-[87vh] flex flex-col max-w-5xl mx-auto">
    <div className="h-full flex flex-col max-w-5xl mx-auto">
      {/* Question Header - Fixed height */}
      <Card className="flex-shrink-0 bg-transparent text-black">
        <CardContent className="">
          <div className="flex items-center justify-between">
            {/* NEW: Conditional Header based on Exam Mode */}
            {isSubjectSectionMode && questionInfo ? (
              <div className="flex flex-col md:flex-row md:items-center space-y-1 md:space-y-0 md:space-x-4">
                <h2 className="text-lg font-semibold ">
                  <span className="text-gray-500">Subject:</span>{" "}
                  <span className=" px-3 py-1 rounded-md border text-sm transition-colors capitalize bg-blue-600 text-white border-blue-600">     {questionInfo.subject.toLowerCase()}</span>
                </h2>
                <h2 className="text-lg font-semibold">
                  <span className="text-gray-500">Section:</span>{" "}
                  <span className=" px-3 py-1 rounded-md border text-sm transition-colors bg-green-600 text-white border-green-600">  {questionInfo.section}</span>

                </h2>
                <h2 className="text-lg font-semibold">
                  <span className="text-gray-500">Question:</span>{" "}
                  {questionInfo.localQuestionNumber} of{" "}
                  {questionInfo.sectionQuestionCount}
                </h2>
                {/* <h2 className="text-lg font-semibold hidden md:block">
                  <span className="text-gray-500">Total:</span>{" "}
                  {currentQuestionIndex + 1} of {totalQuestions}
                </h2> */}
              </div>
            ) : (
              <h2 className="text-lg font-semibold">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </h2>
            )}



            <div className="flex items-center space-x-2">
              {markedForReview && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                  <Flag size={12} className="mr-1" />
                  Marked for Review
                </span>
              )}
            </div>
            <h2 className="text-lg font-semibold">
              Question Type: {currentQuestion.question_type}
            </h2>
          </div>
        </CardContent>
      </Card>

      {/* Scrollable Content Area */}
      <Card className="relative flex-1 flex flex-col min-h-0 mt-1 bg-transparent text-black overflow-hidden">
        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <div
            className="absolute inset-0 pointer-events-none select-none text-gray-300"
            aria-hidden
          >
            <svg
              className="w-full h-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <g transform="rotate(-40 50 50)" opacity="0.1">
                <text
                  x="50"
                  y="50"
                  dominantBaseline="middle"
                  textAnchor="middle"
                  fontWeight="700"
                  fontSize="12"
                  lengthAdjust="spacingAndGlyphs"
                  textLength="80"
                >
                  {student?.roll_number || examName}
                </text>
              </g>
            </svg>
          </div>
        </div>

        <CardContent className="flex-1 flex flex-col min-h-0  ">
          {currentQuestion && (
            <>
              {/* Question Section - Flexible based on content */}
              <div className="flex flex-col min-h-0 max-h-[50%]">
                <div className="flex-1 min-h-0 mb-3">
                  <div className=" text-base font-medium leading-relaxed h-full overflow-y-auto pr-2">
                    <span className="text-lg font-bold mr-1">
                      {" "}
                      {questionInfo && isSubjectSectionMode ? questionInfo.localQuestionNumber : currentQuestionIndex + 1}.
                    </span>{" "}
                    {currentQuestion.question}
                  </div>
                </div>

                {currentQuestion.imageRef &&
                  imageUrls[currentQuestion.imageRef] && (
                    <div className="flex-shrink-0">
                      <img
                        src={imageUrls[currentQuestion.imageRef]}
                        alt="Question"
                        className="rounded-sm shadow-md cursor-pointer transition-all duration-300 max-w-full h-auto max-h-30 object-contain"
                        onClick={() => setModalImageSrc(imageUrls[currentQuestion.imageRef])}
                      />
                    </div>
                  )}
              </div>

              <div className="flex-1 min-h-0 mt-3">
                <div className="h-full overflow-y-auto p-2">
                  {currentQuestion.question_type === "MCQ" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {["option_a", "option_b", "option_c", "option_d"].map(
                        (key, index) => {
                          const optionText = currentQuestion[key];
                          const optionImageRefKey = `${key}_image`;
                          const optionImageRef = currentQuestion[optionImageRefKey];
                          const optionLetter = String.fromCharCode(65 + index);
                          const isSelected = selectedOption === optionLetter;

                          return (
                            <div
                              key={optionLetter}
                              className={`flex items-start space-x-3 p-3 rounded-md shadow-sm border transition 
          ${isSelected
                                  ? "bg-blue-50 border-blue-500 ring-2 ring-blue-400"
                                  : "bg-gray-50 border-gray-200"
                                }`}
                            >
                              <input
                                type="radio"
                                id={`option-${optionLetter}`}
                                name="answer"
                                value={optionLetter}
                                checked={isSelected}
                                onChange={() => handleOptionSelect(optionLetter)}
                                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 flex-shrink-0"
                              />

                              <label
                                htmlFor={`option-${optionLetter}`}
                                className="flex flex-col text-gray-800 text-sm cursor-pointer w-full min-w-0"
                              >
                                <span className="flex items-center">
                                  <span className="font-semibold mr-4 flex-shrink-0">
                                    {optionLetter}.
                                  </span>
                                  {optionText && (
                                    <span className="text-base font-medium leading-snug break-words">
                                      {optionText}
                                    </span>
                                  )}
                                </span>

                                {optionImageRef && imageUrls[optionImageRef] && (
                                  <div className="mt-2 ml-6">
                                    {/* <img
                                      src={imageUrls[optionImageRef]}
                                      alt={`Option ${optionLetter}`}
                                      className="max-w-sm max-h-20 object-contain rounded-md shadow"
                                    /> */}
                                    <img
                                      src={imageUrls[optionImageRef]}
                                      alt={`Option ${optionLetter}`}
                                      className="max-w-sm max-h-20 object-contain rounded-md shadow cursor-pointer"
                                      onClick={(e) => {
                                        e.stopPropagation(); // Prevents radio button from being selected
                                        setModalImageSrc(imageUrls[optionImageRef]);
                                      }}
                                    />
                                  </div>
                                )}
                              </label>
                            </div>
                          );
                        }
                      )}
                    </div>
                  )}
                  {currentQuestion.question_type === "NUMERICAL" && (
                    <NumericKeypad
                      value={answerText}
                      onChange={handleNumericInput}
                      onClear={handleClearResponse}
                      disabled={isSavingAnswer}
                    />
                  )}
                </div>
              </div>
            </>
          )}
          {/* The modal component is rendered here */}
          <ImageModal src={modalImageSrc} onClose={() => setModalImageSrc(null)} />
        </CardContent>
      </Card>

      {/* Action Buttons - Fixed at bottom */}
      <div className="flex-shrink-0 mt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrevious}
              // NEW: Use selector info for disabled state
              // disabled={navigationInfo?.isFirstQuestion}
              disabled={!navigationInfo?.canGoPrevious}
              className="flex items-center space-x-1 px-3 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded text-sm transition duration-300"
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>

            <button
              onClick={handleNext}
              // NEW: Use selector info for disabled state
              // disabled={navigationInfo?.isLastQuestion}
              disabled={!navigationInfo?.canGoNext}
              className="flex items-center space-x-1 px-3 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded text-sm transition duration-300"
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {currentQuestion.question_type !== "NUMERICAL" && (
              <button
                onClick={handleClearResponse}
                disabled={
                  (currentQuestion?.question_type === "MCQ" && selectedOption === null) ||
                  (currentQuestion?.question_type === "NUMERICAL" && answerText === "")
                }
                className="flex items-center space-x-1 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded text-sm transition duration-300"
              >
                <RotateCcw size={14} />
                <span>Clear</span>
              </button>
            )}


            <button
              onClick={handleMarkForReview}
              disabled={isSavingAnswer}
              className={`flex items-center space-x-1 px-3 py-2 rounded text-sm transition duration-300 ${markedForReview
                ? "bg-yellow-500 hover:bg-yellow-500 text-white"
                : "bg-yellow-100 hover:bg-yellow-200 text-yellow-800"
                }`}
            >
              <Flag size={14} />
              <span>{markedForReview ? "Unreview" : "Review"}</span>
            </button>

            {currentQuestionIndex === totalQuestions - 1 ? (
              showSubmitButton ? (
                <button
                  onClick={handleSubmitExam}
                  className="w-40 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-2 px-4 rounded transition duration-300"
                >
                  <span>Submit Exam</span>
                </button>
              ) : (
                <button
                  onClick={handleSaveAndNext}
                  disabled={isSavingAnswer}
                  className="flex items-center space-x-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded text-sm transition duration-300"
                >
                  <span>{isSavingAnswer ? "Saving..." : "Save"}</span>
                </button>
              )
            ) : (
              <button
                onClick={handleSaveAndNext}
                disabled={isSavingAnswer}
                className="flex items-center space-x-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded text-sm transition duration-300"
              >
                <span>{isSavingAnswer ? "Saving..." : "Save & Next"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Your existing Numeric Keypad Component remains unchanged
const NumericKeypad = ({ value, onChange, onClear, disabled }) => {
  const handleKeyClick = (key) => {
    if (disabled) return;

    if (key === 'clear') {
      onClear();
    } else if (key === 'backspace') {
      onChange(value.slice(0, -1));
    } else if (key === '.') {
      if (!value.includes('.')) {
        onChange(value + key);
      }
    } else {
      if (value === '0' && key !== '.') {
        onChange(key);
      } else {
        onChange(value + key);
      }
    }
  };

  const keypadButtons = [
    ['7', '8', '9'],
    ['4', '5', '6'],
    ['1', '2', '3'],
    ['clear', '0', '.'],
    ['backspace']
  ];

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-w-xs mx-auto">
      <div className="mb-3 flex items-center justify-center">
        <Calculator size={16} className="mr-2 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">Numeric Keypad</span>
      </div>

      <div className="mb-3 p-3 bg-white border border-gray-300 rounded text-right text-lg font-mono min-h-[2.5rem] flex items-center justify-end">
        <span className={value ? "text-black" : "text-gray-400"}>
          {value || "0"}
        </span>
      </div>

      <div className="grid gap-2">
        {keypadButtons.map((row, rowIndex) => (
          <div key={rowIndex} className={`grid gap-2 ${row.length === 1 ? 'grid-cols-1' : 'grid-cols-3'}`}>
            {row.map((key) => (
              <button
                key={key}
                onClick={() => handleKeyClick(key)}
                disabled={disabled}
                className={`h-10 rounded text-sm font-medium transition-colors duration-200 ${key === 'clear'
                  ? 'bg-red-500 hover:bg-red-600 text-white disabled:bg-red-300'
                  : key === 'backspace'
                    ? 'bg-orange-500 hover:bg-orange-600 text-white disabled:bg-orange-300'
                    : 'bg-blue-500 hover:bg-blue-600 text-white disabled:bg-blue-300'
                  } disabled:cursor-not-allowed`}
              >
                {key === 'clear' ? 'Clear' : key === 'backspace' ? (<div className="flex justify-center items-center gap-2"><span>Backspace</span><Delete size={16} /> </div>) : key}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};