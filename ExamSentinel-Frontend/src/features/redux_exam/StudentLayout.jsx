// // // components/StudentLayout.jsx
// // import { useEffect, useState } from "react";
// // import { useNavigate } from "react-router-dom";
// // import { Clock, User, LogOut, Menu, X } from "lucide-react";
// // import { toast } from "sonner";
// // import { useAuth, useExam, useUI } from "@/hooks/redux";
// // import { logout } from "@/store/slices/authSlice";
// // import {
// //   submitExam,
// //   forceSubmitExam,
// //   fetchExamInstructions,
// //   decrementExamTime,
// //   updateSocketStatus,
// // } from "@/store/slices/examSlice";
// // import {
// //   toggleSidebar,
// //   showSubmitConfirmation,
// //   hideSubmitConfirmation,
// //   showTimeWarning,
// //   hideTimeWarning,
// //   setIsMobile,
// //   hideLogoutConfirmation,
// //   showLogoutConfirmation,
// // } from "@/store/slices/uiSlice";
// // import ConfirmDialog from "./ConfirmDialog";
// // import QuestionNavigation from "./QuestionNavigation";
// import { usePreventUnload } from "@/hooks/usePreventUnload";
// import useBlockBackNavigation from "@/hooks/useBlockBackNavigation";
// import { useDisableInspect } from "@/hooks/useDisableInspect";
// import { useBlockClipboard } from "@/hooks/useBlockClipboard";
// import { useTabSwitchDetector } from "@/hooks/useTabSwitchDetector";
// // import {
// //   connectExamSocket,
// //   sendSocketMessage,
// // } from "@/store/slices/examSocket";
// // import { Progress } from "@/components/ui/progress";
// // import { useFullscreenMonitor } from "@/hooks/useFullScreenMonitor";

// // export default function StudentLayout({ children }) {
// //   usePreventUnload();
// //   useBlockBackNavigation();
// //   useDisableInspect();
// //   useBlockClipboard();
// //   // useTabSwitchDetector();
// //   // useFullscreenMonitor();
// //   const navigate = useNavigate();
// //   const { student, dispatch: authDispatch } = useAuth();
// //   const {
// //     instructions,
// //     examTimeLeft,
// //     examTimeLimit,
// //     questionTimeLeft,
// //     isExamSubmitted,
// //     examName,
// //     isSubmitting,
// //     totalQuestions,
// //     attemptedCount,
// //     socketStatus, // 🟢 NEW
// //     usedMinutes, // 🟢 NEW
// //     remainingMinutes, // 🟢 NEW
// //     dispatch: examDispatch,
// //   } = useExam();
// //   const {
// //     sidebarCollapsed,
// //     showSubmitConfirmation: showSubmitModal,
// //     showLogoutConfirmation: showLogoutModal,
// //     showTimeWarning,
// //     isMobile,
// //     dispatch: uiDispatch,
// //   } = useUI();

// //   const [showWarning, setShowWarning] = useState(false);

// //   // Handle mobile detection
// //   useEffect(() => {
// //     const checkMobile = () => {
// //       uiDispatch(setIsMobile(window.innerWidth < 768));
// //     };

// //     checkMobile();
// //     window.addEventListener("resize", checkMobile);
// //     return () => window.removeEventListener("resize", checkMobile);
// //   }, [uiDispatch]);

// //   useEffect(() => {
// //     if (student?.id) {
// //       // Connect WebSocket if not already
// //       connectExamSocket(student.id, (socketData) => {
// //         console.log("📨 Got WebSocket data:", socketData);
// //         examDispatch(updateSocketStatus(socketData)); // updates Redux
// //       });

// //       // Send periodic status check every 30s
// //       const interval = setInterval(() => {
// //         sendSocketMessage("status");
// //       }, 10000);

// //       // First ping immediately
// //       sendSocketMessage("status");

// //       return () => clearInterval(interval);
// //     }
// //   }, [student?.id, examDispatch]);

// //   // Show warning when time is running low
// //   useEffect(() => {
// //     if (examTimeLeft <= 300 && examTimeLeft > 0 && !showWarning) {
// //       // 5 minutes
// //       setShowWarning(true);
// //       uiDispatch(showTimeWarning());
// //       toast.warning("Only 5 minutes left!");
// //     }
// //   }, [examTimeLeft, showWarning, uiDispatch]);

// //   // Format time display
// //   const formatTime = (seconds) => {
// //     const mins = Math.floor(seconds / 60);
// //     const secs = seconds % 60;
// //     return `${mins.toString().padStart(2, "0")}:${secs
// //       .toString()
// //       .padStart(2, "0")}`;
// //   };

// //   const handleLogout = () => {
// //     uiDispatch(showLogoutConfirmation());
// //   };

// //   const confirmLogout = () => {
// //     uiDispatch(hideLogoutConfirmation());
// //     authDispatch(logout())
// //       .unwrap()
// //       .then(() => {
// //         navigate("/");
// //       })
// //       .catch(() => {
// //         toast.error("Logout failed");
// //       });
// //   };

// //   const cancelLogout = () => {
// //     uiDispatch(hideLogoutConfirmation());
// //   };

// //   const handleSubmitExam = () => {
// //     uiDispatch(showSubmitConfirmation());
// //   };

// //   useEffect(() => {
// //     if (!instructions) {
// //       examDispatch(fetchExamInstructions());
// //     }
// //   }, [instructions, examDispatch]);

// //   const confirmSubmit = () => {
// //     uiDispatch(hideSubmitConfirmation());
// //     examDispatch(submitExam())
// //       .unwrap()
// //       .then(() => {
// //         toast.success("Exam submitted successfully!");
// //         navigate("/exam-result");
// //       })
// //       .catch((error) => {
// //         toast.error(error || "Failed to submit exam");
// //       });
// //   };

// //   const cancelSubmit = () => {
// //     uiDispatch(hideSubmitConfirmation());
// //   };

// //   useEffect(() => {
// //     const interval = setInterval(() => {
// //       if (!isExamSubmitted && examTimeLeft > 0) {
// //         examDispatch(decrementExamTime());
// //       }
// //     }, 1000);

// //     return () => clearInterval(interval);
// //   }, [isExamSubmitted, examTimeLeft, examDispatch]);

// //   // Auto-submit when time expires
// //   useEffect(() => {
// //     if (examTimeLeft <= 0 && !isExamSubmitted) {
// //       examDispatch(forceSubmitExam());
// //       examDispatch(submitExam())
// //         .unwrap()
// //         .then(() => {
// //           toast.warning("Time expired! Exam submitted automatically.");
// //           navigate("/exam-result");
// //         });
// //     }
// //   }, [examTimeLeft, isExamSubmitted, examDispatch, navigate]);

// //   if (isExamSubmitted) {
// //     return null; // Will redirect to results
// //   }

// //   return (
// //     <div className="min-h-screen bg-gray-50 flex select-none">
// //       {/* Sidebar */}
// //       <div
// //         className={`fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
// //           sidebarCollapsed || isMobile ? "-translate-x-full" : "translate-x-0"
// //         } lg:translate-x-0 lg:static lg:inset-0`}
// //       >
// //         <div className="flex flex-col h-full">
// //           {/* Header */}
// //           <div className="flex items-center justify-between p-4 border-b">
// //             <h2 className="text-lg font-semibold text-gray-800">Navigation</h2>
// //             <button
// //               onClick={() => uiDispatch(toggleSidebar())}
// //               className="lg:hidden p-1 rounded-md hover:bg-gray-100"
// //             >
// //               <X size={20} />
// //             </button>
// //           </div>

// //           {/* Student Info */}
// //           <div className="p-4 border-b bg-gray-50">
// //             <div className="flex items-center space-x-3">
// //               <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
// //                 <User size={20} className="text-white" />
// //               </div>
// //               <div>
// //                 <p className="font-medium text-gray-800">{student?.name}</p>
// //                 <p className="text-sm text-gray-600">{student?.roll_number}</p>
// //               </div>
// //             </div>
// //           </div>

// //           {/* Timer */}
// //           <div className="p-4 border-b">
// //             <div className="space-y-3">
// //               <div className="flex items-center justify-between">
// //                 <span className="text-sm font-medium text-gray-700">
// //                   Exam Time
// //                 </span>
// //                 <div
// //                   className={`flex items-center space-x-1 ${
// //                     examTimeLeft <= 300 ? "text-red-600" : "text-green-600"
// //                   }`}
// //                 >
// //                   <Clock size={16} />
// //                   <span>
// //                     {formatTime(examTimeLeft)} / {formatTime(examTimeLimit)}
// //                   </span>
// //                 </div>
// //               </div>

// //               {/* Progress bar */}
// //               <Progress
// //                 value={((examTimeLimit - examTimeLeft) / examTimeLimit) * 100}
// //                 className={`h-2 transition-all duration-300 ${
// //                   examTimeLeft <= 300 ? "bg-red-400" : "bg-green-600"
// //                 }`}
// //               />
// //             </div>
// //           </div>

// //           {/* Question Navigation */}
// //           <div className="flex-1 overflow-y-auto">
// //             <QuestionNavigation />
// //           </div>

// //           {/* Submit Button */}
// //           <div className="p-4 border-t">
// //             <button
// //               onClick={handleSubmitExam}
// //               disabled={isSubmitting}
// //               className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-2 px-4 rounded transition duration-300"
// //             >
// //               {isSubmitting ? "Submitting..." : "Submit Exam"}
// //             </button>

// //             <div className="mt-2 text-center text-sm text-gray-600">
// //               {attemptedCount} of {totalQuestions} questions attempted
// //             </div>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Main Content */}
// //       <div className="flex-1 flex flex-col lg:ml-0">
// //         {/* Top Bar */}
// //         <div className="bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between">
// //           <div className="flex items-center space-x-4">
// //             <button
// //               onClick={() => uiDispatch(toggleSidebar())}
// //               className="lg:hidden p-2 rounded-md hover:bg-gray-100"
// //             >
// //               <Menu size={20} />
// //             </button>

// //             <div className="flex items-center gap-2">
// //               <h1 className="text-xl font-semibold text-gray-800">
// //                 {examName || "Online Examination System"}
// //               </h1>

// //               {/* Connection Status Indicator */}
// //               {socketStatus === "connected" && (
// //                 <span className="text-green-600 text-sm font-medium flex items-center gap-1">
// //                   🟢 Connected
// //                 </span>
// //               )}
// //               {socketStatus === "active" && (
// //                 <span className="text-green-600 text-sm font-medium flex items-center gap-1">
// //                   🟢 Active
// //                 </span>
// //               )}
// //               {socketStatus === "paused" && (
// //                 <span className="text-orange-500 text-sm font-medium flex items-center gap-1">
// //                   ⏸️ Paused
// //                 </span>
// //               )}
// //               {socketStatus === "connecting" && (
// //                 <span className="text-blue-500 text-sm font-medium flex items-center gap-1">
// //                   🔄 Connecting...
// //                 </span>
// //               )}
// //               {socketStatus === "disconnected" && (
// //                 <span className="text-red-500 text-sm font-medium flex items-center gap-1">
// //                   🔴 Disconnected
// //                 </span>
// //               )}
// //               {socketStatus === "error" && (
// //                 <span className="text-red-600 text-sm font-medium flex items-center gap-1">
// //                   ❌ Connection Error
// //                 </span>
// //               )}
// //               {!socketStatus && (
// //                 <span className="text-gray-400 text-sm font-medium flex items-center gap-1">
// //                   ⚪ Initializing...
// //                 </span>
// //               )}
// //             </div>
// //           </div>

// //           <div className="flex items-center space-x-4">
// //             {/* Time warning indicator */}
// //             {examTimeLeft <= 300 && (
// //               <div className="flex items-center space-x-1 text-red-600 animate-pulse">
// //                 <Clock size={16} />
// //                 <span className="text-sm font-medium">Time Running Out!</span>
// //               </div>
// //             )}

// //             <button
// //               onClick={handleLogout}
// //               className="flex items-center space-x-2 px-3 py-1 text-red-600 hover:bg-red-50 rounded-md transition duration-300"
// //             >
// //               <LogOut size={16} />
// //               <span className="hidden sm:inline">Logout</span>
// //             </button>
// //           </div>
// //         </div>

// //         {/* Content Area */}
// //         <div className="flex-1 p-4">{children}</div>
// //       </div>

// //       {/* Mobile Overlay */}
// //       {!sidebarCollapsed && isMobile && (
// //         <div
// //           className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
// //           onClick={() => uiDispatch(toggleSidebar())}
// //         />
// //       )}

// //       <ConfirmDialog
// //         isOpen={showLogoutModal}
// //         title="Logout"
// //         message="Are you sure you want to logout? Your exam progress will be lost."
// //         confirmText="Logout"
// //         cancelText="Cancel"
// //         onConfirm={confirmLogout}
// //         onCancel={cancelLogout}
// //         type="danger"
// //       />

// //       {/* Submit Confirmation Dialog */}
// //       <ConfirmDialog
// //         isOpen={showSubmitModal}
// //         title="Submit Exam"
// //         message={`Are you sure you want to submit the exam? You have attempted ${attemptedCount} out of ${totalQuestions} questions.`}
// //         confirmText="Submit Exam"
// //         cancelText="Continue Exam"
// //         onConfirm={confirmSubmit}
// //         onCancel={cancelSubmit}
// //         type="warning"
// //       />

// //       {/* Time Warning Dialog */}
// //       <ConfirmDialog
// //         isOpen={showTimeWarning}
// //         title="Time Warning"
// //         message="You have less than 5 minutes remaining. Please review your answers and submit the exam."
// //         confirmText="OK"
// //         onConfirm={() => uiDispatch(hideTimeWarning())}
// //         type="warning"
// //         showCancel={false}
// //       />
// //     </div>
// //   );
// // }
// // components/StudentLayout.jsx
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Clock, User, LogOut, Menu, X, AlertTriangle, ChevronDown, ChevronUp, ArrowLeft, ArrowRight, Eye, EyeOff, ArrowLeftToLine, ArrowRightFromLine } from "lucide-react";
// import { toast } from "sonner";
// import { useAuth, useExam, useUI } from "@/hooks/redux";
// import { logout } from "@/store/slices/authSlice";
// import {
//   submitExam,
//   forceSubmitExam,
//   fetchExamInstructions,
//   decrementExamTime,
//   updateSocketStatus,
// } from "@/store/slices/examSlice";
// import {
//   toggleSidebar,
//   showSubmitConfirmation,
//   hideSubmitConfirmation,
//   showTimeWarning,
//   hideTimeWarning,
//   setIsMobile,
// } from "@/store/slices/uiSlice";
// import ConfirmDialog from "./ConfirmDialog";
// import QuestionNavigation from "./QuestionNavigation";
// import { usePreventUnload } from "@/hooks/usePreventUnload";
// import useBlockBackNavigation from "@/hooks/useBlockBackNavigation";
// import { useDisableInspect } from "@/hooks/useDisableInspect";
// import { useBlockClipboard } from "@/hooks/useBlockClipboard";
// import { useTabSwitchDetector } from "@/hooks/useTabSwitchDetector";
// import {
//   connectExamSocket,
//   sendSocketMessage,
// } from "@/store/slices/examSocket";
// import { Progress } from "@/components/ui/progress";
// import { useFullscreenMonitor } from "@/hooks/useFullScreenMonitor";
// import { useExamAuditLogger, useOptionAuditLogger } from "@/hooks/auditLogger/useExamAuditLogger";
// import { useExamEnvironmentMonitor } from "@/hooks/auditLogger/useExamEnvironmentMonitor";
// const demoSubjects = [
//   {
//     subject: "Physics",
//     sections: [
//       { section: "Section A", questionCount: 10 },
//       { section: "Section B", questionCount: 8 },
//     ],
//   },
//   {
//     subject: "Chemistry",
//     sections: [
//       { section: "Section A", questionCount: 12 },
//       { section: "Section B", questionCount: 9 },
//     ],
//   },
//   {
//     subject: "Maths",
//     sections: [
//       { section: "Section A", questionCount: 15 },
//       { section: "Section B", questionCount: 10 },
//     ],
//   },
// ];
// export default function StudentLayout({ children }) {
//   const [selectedSubject, setSelectedSubject] = useState(demoSubjects[0]);
//   const [selectedSection, setSelectedSection] = useState(
//     demoSubjects[0].sections[0]
//   );
//   const [activeSection, setActiveSection] = useState(
//     demoSubjects[0].sections[0]
//   );

//   const { logExamEvent } = useExamAuditLogger();


//   // usePreventUnload();
//   // useBlockBackNavigation();
//   // useDisableInspect();
//   // useBlockClipboard();

//   // useExamEnvironmentMonitor();

//   // const {
//   //   tabSwitchCount,
//   //   showWarningPopup,
//   //   warningMessage,
//   //   handleWarningAcknowledge,
//   // } = useTabSwitchDetector();

//   // const {
//   //   fullscreenExitCount,
//   //   showFullscreenWarning,
//   //   setShowFullscreenWarning,
//   //   enterFullscreen,
//   //   hasExceededLimit,
//   // } = useFullscreenMonitor(() => {
//   //   // Auto-submit the exam here when 3 exits happen
//   //   logExamEvent("FULLSCREEN_EXIT_LIMIT_EXCEEDED");
//   //   examDispatch(forceSubmitExam());
//   //   examDispatch(submitExam())
//   //     .unwrap()
//   //     .then(() => {
//   //       toast.error("Exam submitted due to repeated fullscreen violations.");
//   //       navigate("/exam-result");
//   //     });
//   // });

//   const navigate = useNavigate();
//   const { student, profilePhoto, dispatch: authDispatch } = useAuth();
//   const { optionEvents } = useOptionAuditLogger();
//   const {
//     instructions,
//     currentQuestion,
//     examTimeLeft,
//     examTimeLimit,
//     questionTimeLeft,
//     isExamSubmitted,
//     examName,
//     isSubmitting,
//     totalQuestions,
//     attemptedCount,
//     socketStatus,
//     usedMinutes,
//     remainingMinutes,
//     examSection,
//     dispatch: examDispatch,
//   } = useExam();
//   const {
//     sidebarCollapsed,
//     showSubmitConfirmation: showSubmitModal,
//     showTimeWarning,
//     isMobile,
//     dispatch: uiDispatch,
//   } = useUI();

//   const [showWarning, setShowWarning] = useState(false);

//   // Simple state management for sidebar preferences
//   const [isNavbarVisible, setIsNavbarVisible] = useState(true);
//   const [navbarPosition, setNavbarPosition] = useState('left'); // 'left' or 'right'


//   // Handle mobile detection
//   useEffect(() => {
//     const checkMobile = () => {
//       uiDispatch(setIsMobile(window.innerWidth < 768));
//     };

//     checkMobile();
//     window.addEventListener("resize", checkMobile);
//     return () => window.removeEventListener("resize", checkMobile);
//   }, [uiDispatch]);

//   // Load user preferences
//   useEffect(() => {
//     const savedPosition = localStorage.getItem('navbarPosition');
//     const savedVisibility = localStorage.getItem('navbarVisible');

//     if (savedPosition) {
//       setNavbarPosition(savedPosition);
//     }
//     if (savedVisibility !== null) {
//       setIsNavbarVisible(JSON.parse(savedVisibility));
//     }
//   }, []);

//   // Toggle navbar visibility
//   const toggleNavbarVisibility = () => {
//     const newVisibility = !isNavbarVisible;
//     setIsNavbarVisible(newVisibility);
//     localStorage.setItem('navbarVisible', JSON.stringify(newVisibility));
//   };

//   // Switch navbar position
//   const switchNavbarPosition = () => {
//     const newPosition = navbarPosition === 'left' ? 'right' : 'left';
//     setNavbarPosition(newPosition);
//     localStorage.setItem('navbarPosition', newPosition);
//   };


//   useEffect(() => {
//     if (student?.id) {
//       connectExamSocket(student.id, (socketData) => {
//         examDispatch(updateSocketStatus(socketData));
//       });

//       const interval = setInterval(() => {
//         sendSocketMessage("status");
//       }, 10000);

//       sendSocketMessage("status");

//       return () => clearInterval(interval);
//     }
//   }, [student?.id, examDispatch]);

//   // Show warning when time is running low
//   useEffect(() => {
//     if (examTimeLeft <= 300 && examTimeLeft > 0 && !showWarning) {
//       setShowWarning(true);
//       uiDispatch(showTimeWarning());
//       toast.warning("Only 5 minutes left!");
//     }
//   }, [examTimeLeft, showWarning, uiDispatch]);

//   // Format time display
//   const formatTime = (seconds) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins.toString().padStart(2, "0")}:${secs
//       .toString()
//       .padStart(2, "0")}`;
//   };



//   useEffect(() => {
//     if (!instructions) {
//       examDispatch(fetchExamInstructions());
//     }
//   }, [instructions, examDispatch]);

//   const confirmSubmit = () => {
//     uiDispatch(hideSubmitConfirmation());
//     logExamEvent("EXAM_SUBMIT_TRIGGERED");
//     examDispatch(submitExam())
//       .unwrap()
//       .then(() => {
//         logExamEvent("EXAM_SUBMITTED_SUCCESS");
//         optionEvents("EXAM_SUBMITTED_SUCCESS", {
//           is_final_submission: true,
//           student_question_map: currentQuestion?.id,
//         });
//         toast.success("Exam submitted successfully!");
//         navigate("/exam-result");
//       })
//       .catch((error) => {
//         logExamEvent("EXAM_SUBMIT_FAILED", { error });
//         toast.error(error || "Failed to submit exam");
//       });
//   };

//   const cancelSubmit = () => {
//     uiDispatch(hideSubmitConfirmation());
//   };

//   useEffect(() => {
//     const interval = setInterval(() => {
//       if (!isExamSubmitted && examTimeLeft > 0) {
//         // 👇 Stop time when socket is paused or disconnected
//         if (
//           socketStatus === "paused" ||
//           socketStatus === "disconnected" ||
//           socketStatus === "error"
//         ) {
//           toast.warning(
//             "Timer paused due to network issue. Please check your connection."
//           );
//           return;
//         }

//         examDispatch(decrementExamTime());
//       }
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [isExamSubmitted, examTimeLeft, socketStatus, examDispatch]);

//   useEffect(() => {
//     if (socketStatus === "active") {
//       // toast.success("Successfully connected to exam server!");
//       logExamEvent("SOCKET_RESTORED");
//     }
//     // if (socketStatus === "disconnected") {
//     //   logExamEvent("SOCKET_DISCONNECTED");
//     // }
//     if (socketStatus === "paused") {
//       logExamEvent("SOCKET_STATUS_PAUSED");
//     }
//   }, [socketStatus]);

//   // Auto-submit when time expires
//   useEffect(() => {
//     if (examTimeLeft <= 0 && !isExamSubmitted) {
//       logExamEvent("EXAM_TIME_EXPIRED");
//       examDispatch(forceSubmitExam());
//       examDispatch(submitExam())
//         .unwrap()
//         .then(() => {
//           optionEvents("TIME EXPIRED EXAM_SUBMITTED_SUCCESS", {
//             is_final_submission: true,
//             student_question_map: currentQuestion?.id,
//           });
//           // toast.warning("Time expired! Exam submitted automatically.");
//           navigate("/exam-result");
//         });
//     }
//   }, [examTimeLeft, isExamSubmitted, examDispatch, navigate]);

//   if (isExamSubmitted) {
//     return null;
//   }

//   // Determine layout based on position and visibility
//   const containerClass = navbarPosition === 'right' ? 'flex-row-reverse' : 'flex-row';
//   const navbarClass = navbarPosition === 'right'
//     ? `fixed inset-y-0 right-0 z-50 w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${(!isNavbarVisible || sidebarCollapsed || isMobile) ? "translate-x-full" : "translate-x-0"
//     } lg:translate-x-0 lg:static lg:inset-0`
//     : `fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${(!isNavbarVisible || sidebarCollapsed || isMobile) ? "-translate-x-full" : "translate-x-0"
//     } lg:translate-x-0 lg:static lg:inset-0`;

//   return (
//     <div className={`h-screen bg-gray-50 flex select-none ${containerClass}`}>
//       {/* Navigation Sidebar */}
//       {isNavbarVisible && (
//         <div className={navbarClass}>
//           <div className="flex flex-col h-full">



//             {/* Student Info */}
//             {/* <div className="p-4 border-b bg-gray-50">
//               <div className="flex items-center space-x-3">
//                 <div className="rounded-full flex items-center justify-center">
//                   {profilePhoto ? (
//                     <img
//                       src={profilePhoto || "https://via.placeholder.com/80"} // fallback image
//                       alt={student.name}
//                       className="w-16 h-16 lg:w-30 lg:h-30 rounded-full object-cover border"
//                     />
//                   ) : (
//                     <User size={20} className="text-white" />
//                   )
//                   }
//                 </div>
//                 <div>
//                   <p className="font-medium text-gray-800">{student?.name}</p>
//                   <p className="text-sm text-gray-600">{student?.roll_number}</p>
//                 </div>
//                 <div className="flex items-center gap-1">
//                   <button
//                     onClick={switchNavbarPosition}
//                     className="p-1.5 rounded-md text-black hover:bg-gray-200 transition-colors"
//                     title={`Move to ${navbarPosition === 'left' ? 'right' : 'left'}`}
//                   >
//                     {navbarPosition === 'left' ? (
//                       <div>    Right <ArrowRight size={16} className="text-gray-600" /></div>
//                     ) : (
//                       <ArrowLeft size={16} className="text-gray-600" />
//                     )}
//                   </button>

//                   <button
//                     onClick={() => uiDispatch(toggleSidebar())}
//                     className="lg:hidden p-1.5 rounded-md hover:bg-gray-200"
//                   >
//                     <X size={16} />
//                   </button>
//                 </div>
//               </div>
//             </div> */}
//             <div className="p-4 border-b bg-gray-50 relative">
//               {/* Student Info */}
//               <div className="flex items-center space-x-3">
//                 <div className="rounded-full flex items-center justify-center">
//                   {profilePhoto ? (
//                     <img
//                       src={profilePhoto || "https://via.placeholder.com/80"}
//                       alt={student.name}
//                       className="w-16 h-16 lg:w-30 lg:h-30 rounded-full object-cover border"
//                     />
//                   ) : (
//                     <User size={20} className="text-white" />
//                   )}
//                 </div>
//                 <div>
//                   <p className="font-medium text-gray-800">{student?.name}</p>
//                   <p className="text-sm text-gray-600">{student?.roll_number}</p>
//                 </div>
//               </div>

//               {/* Top-right corner buttons */}
//               <div className="absolute top-2 right-2 flex items-center gap-2">
//                 {/* Position Switch Button */}
//                 <button
//                   onClick={switchNavbarPosition}
//                   className="p-1.5  text-xs  bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md transition-colors flex items-center gap-1"
//                   title={`Move to ${navbarPosition === 'left' ? 'right' : 'left'}`}
//                 >
//                   {navbarPosition === 'left' ? (
//                     <>
//                       Right Navigation <ArrowRightFromLine size={16} />
//                     </>
//                   ) : (
//                     <>
//                       Left Navigation <ArrowLeftToLine size={16} />
//                     </>
//                   )}
//                 </button>

//                 {/* Mobile Close Button */}
//                 <button
//                   onClick={() => uiDispatch(toggleSidebar())}
//                   className="lg:hidden p-1.5 rounded-md hover:bg-gray-200"
//                 >
//                   <X size={16} />
//                 </button>
//               </div>
//             </div>




//             {/* Question Navigation */}
//             <div className="p-2 space-y-4  " >
//               {/* Subject Selector */}
//               <div className="flex gap-2 flex-wrap">
//                 {demoSubjects.map((subj, i) => (
//                   <button
//                     key={i}
//                     onClick={() => {
//                       setSelectedSubject(subj);
//                       setSelectedSection(subj.sections[0]); // default to first section
//                     }}
//                     className={`px-3 py-1 rounded-md border text-sm font-medium 
//               ${selectedSubject.subject === subj.subject
//                         ? "bg-blue-600 text-white"
//                         : "bg-gray-500 hover:bg-gray-400"}`}
//                   >
//                     {subj.subject}
//                   </button>
//                 ))}
//               </div>

//               {/* Section Selector */}
//               <div className="flex gap-2 flex-wrap">
//                 {selectedSubject.sections.map((sec, j) => (
//                   <button
//                     key={j}
//                     onClick={() => setSelectedSection(sec)}
//                     className={`px-3 py-1 rounded-md border text-sm 
//               ${selectedSection.section === sec.section
//                         ? "bg-green-600 text-white"
//                         : "bg-gray-500 hover:bg-gray-600"}`}
//                   >
//                     {sec.section}
//                   </button>
//                 ))}
//               </div>
//             </div>
//             <div className="flex-1 overflow-y-auto">
//               <QuestionNavigation questions={selectedSection.questionCount} />
//             </div>


//             <div className="mb-2 text-center text-sm text-gray-600">
//               {attemptedCount} of {totalQuestions} questions attempted
//             </div>
//           </div>
//         </div>
//       )}


//       {/* Main Content */}
//       <div className="flex-1 flex flex-col">
//         {/* Top Bar */}
//         <div className="bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between">
//           <div className="flex items-center space-x-4">
//             {/* Navigation Toggle Buttons */}
//             <div className="flex items-center gap-2">
//               {/* Mobile menu button */}
//               <button
//                 onClick={() => uiDispatch(toggleSidebar())}
//                 className="lg:hidden p-2 rounded-md hover:bg-gray-100"
//               >
//                 <Menu size={20} />
//               </button>



//             </div>

//             <div className="flex items-center gap-2">
//               <h1 className="text-xl font-semibold text-gray-800">
//                 {examName || "Online Examination System"}
//               </h1>

//               {/* Connection Status Indicator */}
//               {socketStatus === "connected" && (
//                 <span className="text-green-600 text-sm font-medium flex items-center gap-1">
//                   🟢 Connected
//                 </span>
//               )}
//               {socketStatus === "active" && (
//                 <span className="text-green-600 text-sm font-medium flex items-center gap-1">
//                   🟢 Active
//                 </span>
//               )}
//               {socketStatus === "paused" && (
//                 <span className="text-orange-500 text-sm font-medium flex items-center gap-1">
//                   ⏸️ Paused
//                 </span>
//               )}
//               {socketStatus === "connecting" && (
//                 <span className="text-blue-500 text-sm font-medium flex items-center gap-1">
//                   🔄 Connecting...
//                 </span>
//               )}
//               {socketStatus === "disconnected" && (
//                 <span className="text-red-500 text-sm font-medium flex items-center gap-1">
//                   🔴 Disconnected
//                 </span>
//               )}
//               {socketStatus === "error" && (
//                 <span className="text-red-600 text-sm font-medium flex items-center gap-1">
//                   ❌ Connection Error
//                 </span>
//               )}
//               {!socketStatus && (
//                 <span className="text-gray-400 text-sm font-medium flex items-center gap-1">
//                   ⚪ Initializing...
//                 </span>
//               )}
//             </div>
//           </div>

//           <div className="flex items-center space-x-4">
//             {/* Tab Switch Warning in Header */}
//             {/* {tabSwitchCount > 0 && (
//               <div
//                 className={`flex items-center space-x-1 px-2 py-1 rounded-md ${tabSwitchCount >= 2
//                     ? "bg-red-100 text-red-700"
//                     : "bg-yellow-100 text-yellow-700"
//                   }`}
//               >
//                 <AlertTriangle size={14} />
//                 <span className="text-xs font-medium">
//                   Tab Switches: {tabSwitchCount}/3
//                 </span>
//               </div>
//             )} */}
//             {/* Timer */}
//             <div className="w-[300px] border-b">
//               <div className="space-y-3">
//                 <div className="flex items-center justify-between gap-4">
//                   <span className="text-sm font-medium text-gray-700">
//                     Exam Time
//                   </span>
//                   <div
//                     className={`flex items-center space-x-1 ${examTimeLeft <= 300 ? "text-red-600" : "text-green-600"
//                       }`}
//                   >
//                     <Clock size={16} />
//                     <span>
//                       {formatTime(examTimeLeft)} / {formatTime(examTimeLimit)}
//                     </span>
//                   </div>
//                 </div>

//                 <Progress
//                   value={((examTimeLimit - examTimeLeft) / examTimeLimit) * 100}
//                   className={`h-2 transition-all duration-300 ${examTimeLeft <= 300 ? "bg-red-400" : "bg-green-600"
//                     }`}
//                 />
//               </div>
//             </div>

//             {/* Time warning indicator */}
//             {examTimeLeft <= 300 && (
//               <div className="flex items-center space-x-1 text-red-600 animate-pulse">
//                 <Clock size={16} />
//                 <span className="text-sm font-medium">Time Running Out!</span>
//               </div>
//             )}


//           </div>
//         </div>

//         {/* Content Area */}
//         <div className="flex-1 p-4">{children}</div>
//       </div>

//       {/* Mobile Overlay */}
//       {!sidebarCollapsed && isMobile && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
//           onClick={() => uiDispatch(toggleSidebar())}
//         />
//       )}



//       <ConfirmDialog
//         isOpen={showSubmitModal}
//         title="Submit Exam"
//         message={`Are you sure you want to submit the exam? You have attempted ${attemptedCount} out of ${totalQuestions} questions.`}
//         confirmText="Submit Exam"
//         cancelText="Continue Exam"
//         onConfirm={confirmSubmit}
//         onCancel={cancelSubmit}
//         type="warning"
//       />

//       <ConfirmDialog
//         isOpen={showTimeWarning}
//         title="Time Warning"
//         message="You have less than 5 minutes remaining. Please review your answers and submit the exam."
//         confirmText="OK"
//         onConfirm={() => uiDispatch(hideTimeWarning())}
//         type="warning"
//         showCancel={false}
//       />

//       {/* Tab Switch Warning Popup */}
//       {/* <ConfirmDialog
//         isOpen={showWarningPopup}
//         title="Tab Switch Detected"
//         message={
//           warningMessage ||
//           "You have switched tabs. Repeated tab switching may result in disqualification."
//         }
//         confirmText="I Understand"
//         onConfirm={handleWarningAcknowledge}
//         showCancel={false}
//         type={tabSwitchCount >= 3 ? "danger" : "warning"}
//       />
//       <ConfirmDialog
//         isOpen={showFullscreenWarning}
//         title="Fullscreen Required"
//         message={`You exited fullscreen mode. Please return to fullscreen to continue. Attempts left: ${
//           3 - fullscreenExitCount
//         }`}
//         confirmText="Re-enter Fullscreen"
//         onConfirm={() => {
//           setShowFullscreenWarning(false);
//           enterFullscreen();
//         }}
//         type="warning"
//         showCancel={false}
//       /> */}
//     </div>
//   );
// }

// components/StudentLayout.jsx - Enhanced with Subject/Section Support
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, User, LogOut, Menu, X, AlertTriangle, ChevronDown, ChevronUp, ArrowLeft, ArrowRight, Eye, EyeOff, ArrowLeftToLine, ArrowRightFromLine, Calculator } from "lucide-react";
import { toast } from "sonner";
import { useAuth, useExam, useUI } from "@/hooks/redux";
import { logout } from "@/store/slices/authSlice";
import {
  submitExam,
  forceSubmitExam,
  fetchExamInstructions,
  decrementExamTime,
  updateSocketStatus,
  setCurrentSubjectSection,
  fetchQuestion,
} from "@/store/slices/examSlice";
import {
  toggleSidebar,
  showSubmitConfirmation,
  hideSubmitConfirmation,
  showTimeWarning,
  hideTimeWarning,
  setIsMobile,
  setShowCalculator,
  toggleCalculator
} from "@/store/slices/uiSlice";
import ConfirmDialog from "./ConfirmDialog";
import QuestionNavigation from "./QuestionNavigation";
import { usePreventUnload } from "@/hooks/usePreventUnload";
import useBlockBackNavigation from "@/hooks/useBlockBackNavigation";
import { useDisableInspect } from "@/hooks/useDisableInspect";
import { useBlockClipboard } from "@/hooks/useBlockClipboard";
import { useTabSwitchDetector } from "@/hooks/useTabSwitchDetector";
import {
  connectExamSocket,
  restartExamSocket,
  sendSocketMessage,
} from "@/store/slices/examSocket";
import { useExamSocket } from "@/store/context/ExamSocketContext";
import { Progress } from "@/components/ui/progress";
import { useFullscreenMonitor } from "@/hooks/useFullScreenMonitor";
import { useExamAuditLogger, useOptionAuditLogger } from "@/hooks/auditLogger/useExamAuditLogger";
import { useExamEnvironmentMonitor } from "@/hooks/auditLogger/useExamEnvironmentMonitor";
import useProctoring from "@/hooks/userInactivity";
import ConnectionStatusOverlay from "./ConnectionStatusOverlay";
import ExamCalculator from "./ExamCalculator";
import PeriodicTableViewer from "./PeriodicTableViewer";
import dummyPersonImg from "/Dummy_Person_img.png"

export default function StudentLayout({ children }) {
  // const { connect, restart, startHeartbeat, stopHeartbeat, socketData } = useExamSocket();
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const { socketData, connectionStatus } = useExamSocket();
  // console.log(socketData, "Data in studentlayout");
  const [messages, setMessages] = useState([]);


  const { logExamEvent } = useExamAuditLogger();

  const isInactive = useProctoring();
  usePreventUnload();
  useBlockBackNavigation();
  useDisableInspect();
  useBlockClipboard();
  useExamEnvironmentMonitor();

  const navigate = useNavigate();
  const { student, profilePhoto, dispatch: authDispatch } = useAuth();
  const { optionEvents } = useOptionAuditLogger();
  const {
    instructions,
    currentQuestion,
    examTimeLeft,
    examTimeLimit,
    questionTimeLeft,
    isExamSubmitted,
    examName,
    isSubmitting,
    totalQuestions,
    attemptedCount,
    socketStatus,
    usedMinutes,
    remainingMinutes,
    examSection,
    // New subject/section related state
    subjectStructure,
    isSubjectSectionMode,
    currentSubject,
    currentSection,
    questionInfo,
    dispatch: examDispatch,
  } = useExam();

  const {
    sidebarCollapsed,
    showSubmitConfirmation: showSubmitModal,
    showTimeWarning,
    isMobile,
    showCalculator,
    dispatch: uiDispatch,
  } = useUI();

  const [showWarning, setShowWarning] = useState(false);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [navbarPosition, setNavbarPosition] = useState('left');


  // Add retry handler
  const handleRetryConnection = () => {
    if (student?.id) {
      restartExamSocket(student.id, (socketData) => {
        examDispatch(updateSocketStatus(socketData));
      });
    }
  };


  // Use useEffect to sync local state with Redux state
  useEffect(() => {
    if (isSubjectSectionMode && subjectStructure && subjectStructure.length > 0) {
      if (!currentSubject) {
        // Initialize the Redux state if it's not set
        examDispatch(setCurrentSubjectSection({
          subjectIndex: 0,
          sectionIndex: 0,
          firstQuestionIndex: subjectStructure[0].sections[0].startIndex
        }));
      } else {
        // Sync local state with Redux state
        setSelectedSubject(subjectStructure[currentSubject.index]);
        setSelectedSection(subjectStructure[currentSubject.index].sections[currentSection.index]);
      }
    }
  }, [isSubjectSectionMode, subjectStructure, currentSubject, currentSection, examDispatch]);


  // Handle mobile detection
  useEffect(() => {
    const checkMobile = () => {
      uiDispatch(setIsMobile(window.innerWidth < 768));
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [uiDispatch]);

  // Load user preferences
  useEffect(() => {
    const savedPosition = localStorage.getItem('navbarPosition');
    const savedVisibility = localStorage.getItem('navbarVisible');

    if (savedPosition) {
      setNavbarPosition(savedPosition);
    }
    if (savedVisibility !== null) {
      setIsNavbarVisible(JSON.parse(savedVisibility));
    }
  }, []);

  const toggleNavbarVisibility = () => {
    const newVisibility = !isNavbarVisible;
    setIsNavbarVisible(newVisibility);
    localStorage.setItem('navbarVisible', JSON.stringify(newVisibility));
  };

  const switchNavbarPosition = () => {
    const newPosition = navbarPosition === 'left' ? 'right' : 'left';
    setNavbarPosition(newPosition);
    localStorage.setItem('navbarPosition', newPosition);
  };


  const handleSubjectSelect = async (subject) => {
    try {
      setSelectedSubject(subject);
      setSelectedSection(subject.sections[0]);

      const subjectIndex = subjectStructure.findIndex(s => s.subject === subject.subject);
      const firstQuestionIndex = subject.sections[0].startIndex;
      const index = questionInfo?.localQuestionNumber



      // Update Redux state
      examDispatch(setCurrentSubjectSection({
        subjectIndex,
        sectionIndex: 0
      }));

      // 🔥 KEY FIX: Fetch the actual question
      await examDispatch(fetchQuestion(firstQuestionIndex)).unwrap();
      // examDispatch(resetQuestionTime());

      // Logging and user feedback
      optionEvents("SUBJECT_SELECTED", {
        question_subject: subject.subject,
        from_section: section.section,  // section is not defined here, might need adjustment
        student_question_map: 1
      });

      // toast.success(`Switched to ${subject.subject} - ${subject.sections[0].section}`);
    } catch (error) {
      console.error("Failed to switch subject:", error);
      // toast.error("Failed to switch subject. Please try again.");
    }
  };


  const handleSectionSelect = async (section) => {
    try {
      setSelectedSection(section);

      const subjectIndex = subjectStructure.findIndex(s => s.subject === selectedSubject.subject);
      const sectionIndex = selectedSubject.sections.findIndex(sec => sec.section === section.section);
      const firstQuestionIndex = section.startIndex;

      examDispatch(setCurrentSubjectSection({
        subjectIndex,
        sectionIndex
      }));

      // 🔥 KEY FIX: Fetch the actual question
      await examDispatch(fetchQuestion(firstQuestionIndex)).unwrap();
      // examDispatch(resetQuestionTime());

      optionEvents("SECTION_SELECTED", {
        question_subject: selectedSubject.subject,
        from_section: section.section,
        student_question_map: 1
      });

      // toast.success(`Switched to ${selectedSubject.subject} - ${section.section}`);
    } catch (error) {
      console.error("Failed to switch section:", error);
      // toast.error("Failed to switch section. Please try again.");
    }
  };

  useEffect(() => {
    if (student?.id) {
      connectExamSocket(student.id, (socketData) => {
        setMessages(prev => [...prev, socketData]);
        examDispatch(updateSocketStatus(socketData));

      });

      const interval = setInterval(() => {
        sendSocketMessage({ status: "Active" });
      }, 10000);

      sendSocketMessage({ status: "Active" });

      return () => clearInterval(interval);
    }
  }, [student?.id, examDispatch]);

  // Show warning when time is running low
  useEffect(() => {
    if (examTimeLeft <= 300 && examTimeLeft > 0 && !showWarning) {
      setShowWarning(true);
      // uiDispatch(showTimeWarning);
      // toast.warning("Only 5 minutes left!");
    }
  }, [examTimeLeft, showWarning, uiDispatch]);

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!instructions) {
      examDispatch(fetchExamInstructions());
    }
  }, [instructions, examDispatch]);



  const confirmSubmit = () => {
    uiDispatch(hideSubmitConfirmation());
    logExamEvent("EXAM_SUBMIT_TRIGGERED");
    examDispatch(submitExam())
      .unwrap()
      .then(() => {
        logExamEvent("EXAM_SUBMITTED_SUCCESS");
        toast.success("Exam submitted successfully!");
        // navigate("/exam-result");
        // ✅ Check permission and redirect accordingly hasPermission('VIEW_EXAM_RESULTS')
        const canShowResults = true;
        if (canShowResults) {
          navigate("/exam-result");
        } else {
          navigate("/exam-end");
        }
      })
      .catch((error) => {
        logExamEvent("EXAM_SUBMIT_FAILED", { error });
        toast.error(error || "Failed to submit exam");
      });
  };

  const cancelSubmit = () => {
    uiDispatch(hideSubmitConfirmation());
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isExamSubmitted && examTimeLeft > 0) {
        if (
          socketStatus === "paused" ||
          socketStatus === "disconnected" ||
          socketStatus === "error"
        ) {
          // toast.warning(
          //   "Timer paused due to network issue. Please check your connection."
          // );
          return;
        }

        examDispatch(decrementExamTime());
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isExamSubmitted, examTimeLeft, socketStatus, examDispatch]);

  useEffect(() => {
    if (socketStatus === "active") {
      logExamEvent("SOCKET_RESTORED");
    }
    if (socketStatus === "paused") {
      logExamEvent("SOCKET_STATUS_PAUSED");
    }
  }, [socketStatus]);

  // Auto-submit when time expires
  useEffect(() => {
    if (examTimeLeft <= 0 && !isExamSubmitted) {
      logExamEvent("EXAM_TIME_EXPIRED");
      examDispatch(forceSubmitExam());
      examDispatch(submitExam())
        .unwrap()
        .then(() => {
          // optionEvents("TIME EXPIRED EXAM_SUBMITTED_SUCCESS", {
          //   is_final_submission: true,
          //   student_question_map: currentQuestion?.id,
          // });
          logExamEvent("TIME EXPIRED EXAM_SUBMITTED_SUCCESS");
          navigate("/exam-result");
        });
    }
  }, [examTimeLeft, isExamSubmitted, examDispatch, navigate]);


  const shouldShowConnectionOverlay =
    socketStatus === "disconnected" ||
    socketStatus === "paused" ||
    socketStatus === "error";

  if (isExamSubmitted) {
    return null;
  }

  // Get current question counts for display
  const getCurrentQuestionCounts = () => {
    if (!isSubjectSectionMode || !selectedSection) {
      return { current: totalQuestions, total: totalQuestions };
    }
    return {
      current: selectedSection.questionCount,
      total: totalQuestions
    };
  };

  const { current: currentSectionQuestions, total: totalExamQuestions } = getCurrentQuestionCounts();

  // Determine layout based on position and visibility
  const containerClass = navbarPosition === 'right' ? 'flex-row-reverse' : 'flex-row';
  // const navbarClass = navbarPosition === 'right'
  //   ? `fixed inset-y-0 right-0 z-50 w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${(!isNavbarVisible || sidebarCollapsed || isMobile) ? "translate-x-full" : "translate-x-0"
  //   } lg:translate-x-0 lg:static lg:inset-0`
  //   : `fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${(!isNavbarVisible || sidebarCollapsed || isMobile) ? "-translate-x-full" : "translate-x-0"
  //   } lg:translate-x-0 lg:static lg:inset-0`;

  const navbarClass = navbarPosition === 'right'
    ? `fixed inset-y-0 right-0 z-50 w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${(!isNavbarVisible || sidebarCollapsed) ? "translate-x-full" : "translate-x-0"
    } lg:translate-x-0 lg:static lg:inset-0`
    : `fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${(!isNavbarVisible || sidebarCollapsed) ? "-translate-x-full" : "translate-x-0"
    } lg:translate-x-0 lg:static lg:inset-0`;

  return (

    <>
      {/* Connection Status Overlay - Shows over everything */}
      <ConnectionStatusOverlay
        socketStatus={socketStatus}
        onRetry={handleRetryConnection}
      />
      <div className={`h-screen bg-gray-50 flex select-none ${containerClass}`}>
        {/* Navigation Sidebar */}
        {showCalculator ? (
          <div className={navbarClass}>
            <ExamCalculator onClose={() => uiDispatch(setShowCalculator(false))} />
          </div>
        ) : (
          <>
            {isNavbarVisible && (
              <div className={navbarClass}>
                <div className="flex flex-col h-full">
                  {/* Student Info */}
                  <div className="p-4 border-b bg-gray-50 relative">
                    <div className="flex items-center space-x-3">
                      <div className="rounded-full flex items-center justify-center">
                        {profilePhoto ? (
                          <img
                            src={profilePhoto || dummyPersonImg}
                            alt={student.name}
                            className="w-16 h-16 lg:w-30 lg:h-30 rounded-full  border"
                          />
                        ) : (
                          <User size={20} className="text-white" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{student?.name}</p>
                        <p className="text-sm text-gray-600">{student?.roll_number}</p>
                      </div>
                    </div>

                    {/* Top-right corner buttons */}
                    <div className="absolute top-2 right-2 flex items-center gap-2">
                      <button
                        onClick={switchNavbarPosition}
                        className="p-1.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md transition-colors flex items-center gap-1"
                        title={`Move to ${navbarPosition === 'left' ? 'right' : 'left'}`}
                      >
                        {navbarPosition === 'left' ? (
                          <>
                            Right Navigation <ArrowRightFromLine size={16} />
                          </>
                        ) : (
                          <>
                            Left Navigation <ArrowLeftToLine size={16} />
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => uiDispatch(toggleSidebar())}
                        className="lg:hidden p-1.5 rounded-md text-red-500 bg-gray-200 hover:bg-gray-200"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Subject and Section Selection */}
                  {isSubjectSectionMode && subjectStructure ? (
                    <div className="p-2 space-y-1">
                      {/* Subject Selector */}
                      <h1 className="text-gray-700 font-medium" > Subjects:</h1>
                      <div className="flex gap-2 flex-wrap">
                        {subjectStructure.map((subj, i) => (
                          <button
                            key={i}
                            onClick={() => handleSubjectSelect(subj)}
                            className={`px-3 py-1 rounded-md border text-sm font-medium transition-colors capitalize ${selectedSubject?.subject === subj.subject
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-gray-200 hover:bg-gray-300 text-gray-700 border-gray-300"
                              }`}
                          >
                            {subj.subject.toLowerCase()}
                          </button>
                        ))}
                      </div>

                      {/* Section Selector */}
                      {selectedSubject && (
                        <>
                          <h1 className="text-gray-700 font-medium" > Sections:</h1>
                          <div className="flex gap-2 flex-wrap">
                            {selectedSubject.sections.map((sec, j) => (
                              <button
                                key={j}
                                onClick={() => handleSectionSelect(sec)}
                                className={`px-3 py-1 rounded-md border text-sm transition-colors  ${selectedSection?.section === sec.section
                                  ? "bg-green-600 text-white border-green-600"
                                  : "bg-gray-200 hover:bg-gray-300 text-gray-700 border-gray-300"
                                  }`}
                              >
                                {sec.section}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    // Fallback for legacy mode (show demo subjects)
                    <div className="p-2 space-y-4">
                      <div className="text-xs text-gray-600 p-2 bg-gray-100 rounded">
                        Total Questions: {totalQuestions}
                      </div>
                    </div>
                  )}

                  {/* Question Navigation */}
                  <div className="flex-1 overflow-y-auto">
                    <QuestionNavigation
                      questions={currentSectionQuestions}
                      selectedSubject={selectedSubject}
                      selectedSection={selectedSection}
                      isSubjectSectionMode={isSubjectSectionMode}
                    />
                  </div>


                  <div className="flex items-center  mb-2  text-gray-600 p-2">
                    {(socketStatus === "Active" || socketStatus === "connected") && (
                      <div>
                        🟢
                      </div>)}
                    {socketStatus === "disconnected" && (
                      <div>
                        🔴
                      </div>)}
                    {
                      isInactive && (
                        <div>
                          🟡
                        </div>)
                    }

                  </div>
                </div>
              </div>
            )}
          </>

        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <div className="bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => uiDispatch(toggleSidebar())}
                  className={`lg:hidden p-2 rounded-md ${sidebarCollapsed ? 'text-blue-600 hover:bg-blue-800  transition-colors' : 'text-red-600 hover:bg-red-800  transition-colors'} `}
                >
                  {sidebarCollapsed ? <Menu size={20} /> : <X size={20} />}
                </button>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-2">
                <h1 className="text-xl font-semibold text-gray-800">
                  {examName || "Online Examination System"}
                </h1>

                {/* Connection Status Indicator */}
                {socketStatus === "connected" && (
                  <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                    🟢 Connected
                  </span>
                )}
                {socketStatus === "Active" && (
                  <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                    🟢 Active
                  </span>
                )}
                {socketStatus === "Paused" && (
                  <span className="text-orange-500 text-sm font-medium flex items-center gap-1">
                    ⏸️ Paused
                  </span>
                )}
                {socketStatus === "connecting" && (
                  <span className="text-blue-500 text-sm font-medium flex items-center gap-1">
                    🔄 Connecting...
                  </span>
                )}
                {socketStatus === "disconnected" && (
                  <span className="text-red-500 text-sm font-medium flex items-center gap-1">
                    🔴 Disconnected
                  </span>
                )}
                {socketStatus === "error" && (
                  <span className="text-red-600 text-sm font-medium flex items-center gap-1">
                    ❌ Connection Error
                  </span>
                )}
                {!socketStatus && (
                  <span className="text-gray-400 text-sm font-medium flex items-center gap-1">
                    ⚪ Initializing...
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex gap-2">
                {currentSubject?.name.toLowerCase() === "math" ? (
                  <button
                    onClick={() => uiDispatch(toggleCalculator())}
                    title="Scientific Calculator"
                    className="flex items-center space-x-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 cursor-pointer rounded-md text-sm transition duration-300"
                  >
                    <Calculator size={16} />
                    <span>Calculator</span>
                  </button>
                ) : null
                }

                {currentSubject?.name.toLowerCase() === "chemistry" ? (
                  <PeriodicTableViewer />
                ) : null
                }
              </div>
              {/* Timer */}
              <div className=" w-full  md:w-[300px] border-b">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-gray-700">
                      Exam Time
                    </span>
                    <div
                      className={`flex items-center space-x-1 ${examTimeLeft <= 300 ? "text-red-600" : "text-green-600"
                        }`}
                    >
                      <Clock size={16} />
                      <span>
                        {formatTime(examTimeLeft)} / {formatTime(examTimeLimit)}
                      </span>
                    </div>
                  </div>

                  <Progress
                    value={((examTimeLimit - examTimeLeft) / examTimeLimit) * 100}
                    className={`h-2 transition-all duration-300 ${examTimeLeft <= 300 ? "bg-red-400" : "bg-green-600"
                      }`}
                  />
                </div>
              </div>

              {/* Time warning indicator */}
              {examTimeLeft <= 300 && (
                <div className="flex items-center space-x-1 text-red-600 animate-pulse">
                  <Clock size={16} />
                  <span className="text-sm font-medium">Time Running Out!</span>
                </div>
              )}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-4">{children}</div>
        </div>

        {/* Mobile Overlay */}
        {!sidebarCollapsed && isMobile && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => uiDispatch(toggleSidebar())}
          />
        )}

        {/* Confirmation Dialogs */}
        <ConfirmDialog
          isOpen={showSubmitModal}
          title="Submit Exam"
          message={`Are you sure you want to submit the exam? You have attempted ${attemptedCount} out of ${totalQuestions} questions.`}
          confirmText="Submit Exam"
          cancelText="Continue Exam"
          onConfirm={confirmSubmit}
          onCancel={cancelSubmit}
          type="warning"
        />

        <ConfirmDialog
          isOpen={showTimeWarning}
          title="Time Warning"
          message="You have less than 5 minutes remaining. Please review your answers and submit the exam."
          confirmText="OK"
          onConfirm={() => uiDispatch(hideTimeWarning())}
          type="warning"
          showCancel={false}
        />
      </div>
    </>
  );
}