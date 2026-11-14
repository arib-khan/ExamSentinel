
// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import axios from "axios";
// import { closeExamSocket, connectExamSocket } from "./examSocket";
// import { convertUsedTimeToSeconds } from "@/utils/utils";
// import apiClient from "@/services/apiClient";

// // Async thunks
// export const fetchExamInstructions = createAsyncThunk(
//   "exam/fetchInstructions",
//   async (_, { getState, rejectWithValue }) => {
//     try {
//           const response = await apiClient.get("api/exam/instruction");
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data?.message || "Failed to fetch instructions"
//       );
//     }
//   }
// );

// // NEW: Check if exam can be resumed
// export const checkExamResume = createAsyncThunk(
//   "exam/checkResume",
//   async (_, { getState, rejectWithValue }) => {
//     try {
//       const { auth } = getState();
//       const response = await apiClient.get("api/studentAnswer/re_login");

//       // Check if response has previous exam data
//       if (response.data && Object.keys(response.data).length > 0) {
//         return {
//           canResume: true,
//           resumeData: response.data,
//           serverTime: new Date().toISOString(),
//         };
//       } else {
//         return {
//           canResume: false,
//           resumeData: null,
//           serverTime: new Date().toISOString(),
//         };
//       }
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data?.message || "Failed to check exam resume status"
//       );
//     }
//   }
// );

// // NEW: Resume exam with previous state
// export const resumeExam = createAsyncThunk(
//   "exam/resume",
//   async (resumeData, { getState, dispatch, rejectWithValue }) => {
//     try {
//       const { auth } = getState();

//       // Connect WebSocket
//       connectExamSocket(auth.student.id, (socketData) => {
//         dispatch(updateSocketStatus(socketData));
//       });

//       // Process resume data to restore exam state
//       const processedData = {
//         questions: {},
//         answers: [],
//         visitedQuestions: [],
//         currentQuestionIndex: 0,
//         lastQuestionId: 0,
//       };

//       console.log("resume data", resumeData);
      

      
//       resumeData.forEach((questionData, index) => {
//         const question = {
//           id: questionData.id,
//           question: questionData.question,
//           option_a: questionData.option_a,
//           option_b: questionData.option_b,
//           option_c: questionData.option_c,
//           option_d: questionData.option_d,
//         };

//         const questionIndex = questionData.id-1;

//         processedData.questions[questionIndex] = question;

//         processedData.answers[questionIndex] = {
//           question_id: questionData.id,
//           selected_option: questionData.selected_option || null,
//           marked_for_review: questionData.mark_for_review || false,
//           time_spent: 0,
//         };

//         processedData.visitedQuestions.push(questionIndex);
//         processedData.lastQuestionId = questionData.id;
//         processedData.currentQuestionIndex = questionIndex;
//       });

//       return processedData;
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data?.message || "Failed to resume exam"
//       );
//     }
//   }
// );

// export const startExam = createAsyncThunk(
//   "exam/start",
//   async (_, { getState, dispatch, rejectWithValue }) => {
//     try {
//        const selectedLanguage = sessionStorage.getItem("examLanguage");
//        // used this selectedLanguage to send in the backend
//       const { auth } = getState();
//       const response = await apiClient.post("api/exam/start",{
//         Languages :selectedLanguage
//       });

//       // Connect WebSocket
//       connectExamSocket(auth.student.id, (socketData) => {
//         dispatch(updateSocketStatus(socketData));
//       });

//       const questionData = response.data;
//       const actualQuestion = questionData?.question || questionData;

//       return actualQuestion;
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data?.message || "Failed to start exam"
//       );
//     }
//   }
// );

// export const fetchQuestion = createAsyncThunk(
//   "exam/fetchQuestion",
//   async (questionIndex, { getState, rejectWithValue }) => {
//     try {
//       const { auth } = getState();
//       const response = await apiClient.post(`api/question/ques_BYid`, {
//         id: questionIndex + 1,
//       });

//       const questionData = response.data;
//       const actualQuestion = questionData;

//       return { question: actualQuestion, index: questionIndex };
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data?.message || "Failed to fetch question"
//       );
//     }
//   }
// );

// export const saveAnswer = createAsyncThunk(
//   "exam/saveAnswer",
//   async (answerData, { getState, rejectWithValue }) => {
//     try {
//       const { auth } = getState();
//       const response = await apiClient.post("api/question/save_next", {
//         student_id: auth.student?.id,
//         ...answerData,
//       });


//       const nextQuestion = response.data;

//      if (nextQuestion?.status === false ) {
//         return { ...answerData, nextQuestion: null, isLastQuestion: true, success: true };
//       }
      
//       return { ...answerData, nextQuestion, success: true };
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data?.message || "Failed to save answer"
//       );
//     }
//   }
// );

// // ===== NEW: Cache Cleanup Utility =====
// const cleanupExamCache = async (examId) => {
//   try {
//     if (window.examImageCache && examId) {
//       console.log('🧹 Cleaning up exam cache for examId:', examId);
//       await window.examImageCache.cleanupExam(examId);
      
//       // Clear the global reference
//       window.examImageCache = null;
      
//       console.log('✅ Cache cleanup completed successfully');
//       return true;
//     }
//   } catch (error) {
//     console.error('❌ Cache cleanup failed:', error);
//     return false;
//   }
// };

// export const submitExam = createAsyncThunk(
//   "exam/submit",
//   async (_, { getState, rejectWithValue }) => {
//     try {
//       const { auth, exam } = getState();

//       const response = await apiClient.get("api/studentAnswer/submit");

//        const examId = exam.examId; 

      
//       const cleanupSuccess = await cleanupExamCache(examId);

//       return { result: response.data,
//          cacheCleanedUp: cleanupSuccess

//        };
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data?.message || "Failed to submit exam"
//       );
//     }
//   }
// );

// // Updated saveDraft to handle the response properly
// export const saveDraft = createAsyncThunk(
//   "exam/saveDraft",
//   async (_, { getState, rejectWithValue }) => {
//     try {
//       const { auth, exam } = getState();

//       const response = await apiClient.get("api/studentAnswer/re_login");

//       return {
//         serverTime: new Date().toISOString(),
//         draftData: response.data,
//       };
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data?.message || "Failed to save exam draft"
//       );
//     }
//   }
// );

// // Slice
// const examSlice = createSlice({
//   name: "exam",
//   initialState: {
//     socketStatus: "disconnected",
//     usedMinutes: 0,
//     remainingMinutes: 0,
//     totalQuestions: 100,
//     examTimeLimit: 100 * 60,
//     questionTimeLimit: 60,

//     isExamStarted: false,
//     isExamSubmitted: false,
//     examTimeLeft: 100 * 60,
//     questionTimeLeft: 60,

//     currentQuestion: null,
//     currentQuestionIndex: 0,
//     questions: {},
//     answers: [],
//     selectedOption: null,

//     instructions: null,
//     examName: null,
//     examId: null,

//     isLoading: false,
//     isSavingAnswer: false,
//     isSubmitting: false,
//     isCheckingResume: false,
//     isResuming: false,

//     error: null,

//     visitedQuestions: [],
//      examLanguages: [],
//      examSection: {},
//     lastDraftSavedAt: null,
//     examResult: null,

//     // NEW: Resume-related state
//     canResumeExam: false,
//     resumeData: null,
//     isResumedSession: false,
//     cacheCleanupStatus: null, // 'cleaning', 'success', 'failed'
//     isCacheCleanedUp: false,
//   },
//   reducers: {
//     decrementExamTime: (state) => {
//       if (state.examTimeLeft > 0 && !state.isExamSubmitted) {
//         state.examTimeLeft -= 1;
//       }
//     },
//     decrementQuestionTime: (state) => {
//       if (state.questionTimeLeft > 0 && !state.isExamSubmitted) {
//         state.questionTimeLeft -= 1;
//       }
//     },
//     resetQuestionTime: (state) => {
//       state.questionTimeLeft = state.questionTimeLimit;
//     },
//     setSelectedOption: (state, action) => {
//       state.selectedOption = action.payload;
//     },
//     updateAnswer: (state, action) => {
//       const { index, answerData } = action.payload;
//       const newAnswers = [...state.answers];
//       newAnswers[index] = answerData;
//       state.answers = newAnswers;
//     },
//     clearSelectedOption: (state) => {
//       state.selectedOption = null;
//     },
//     setCurrentQuestionIndex: (state, action) => {
//       const newIndex = action.payload;
//       if (newIndex >= 0 && newIndex < state.totalQuestions) {
//         state.currentQuestionIndex = newIndex;
//         if (!state.visitedQuestions.includes(newIndex)) {
//           state.visitedQuestions.push(newIndex);
//         }
//         const savedAnswer = state.answers[newIndex];
//         state.selectedOption = savedAnswer?.selected_option || null;
//       }
//     },
//     markQuestionVisited: (state, action) => {
//       const index = action.payload;
//       if (!state.visitedQuestions.includes(index)) {
//         state.visitedQuestions.push(index);
//       }
//     },
//     forceSubmitExam: (state) => {
//       state.isExamSubmitted = true;
//       state.examTimeLeft = 0;
//     },
//     clearError: (state) => {
//       state.error = null;
//     },
//     initializeExam: (state, action) => {
//       const { totalQuestions = 100, timeLimit } = action.payload || {};
//       state.totalQuestions = totalQuestions;
//       state.examTimeLimit = timeLimit * 60;
//       state.examTimeLeft = state.examTimeLimit;
//       state.answers = Array(totalQuestions).fill(null);
//       state.visitedQuestions = [];
//        state.isCacheCleanedUp = false;
//       state.cacheCleanupStatus = null;
//     },
//     resetExam: (state) => {
//       return {
//         ...state,
//         isExamStarted: false,
//         isExamSubmitted: false,
//         examTimeLeft: state.examTimeLimit,
//         questionTimeLeft: state.questionTimeLimit,
//         currentQuestion: null,
//         currentQuestionIndex: 0,
//         answers: Array(state.totalQuestions).fill(null),
//         selectedOption: null,
//         visitedQuestions: [],
//         error: null,
//         canResumeExam: false,
//         resumeData: null,
//         isResumedSession: false,
//         isCacheCleanedUp: false,
//         cacheCleanupStatus: null,
//       };
//     },
//     updateSocketStatus: (state, action) => {
//       const { type, status, usedInMin, remainingInMin } = action.payload;

//       if (type === "connection") {
//         state.socketStatus = status;
//       } else if (type === "status") {
//         state.socketStatus = status;
//         state.usedMinutes = usedInMin || 0;
//         state.remainingMinutes = remainingInMin || 0;
//       } else {
//         state.socketStatus = status;
//         state.usedMinutes = usedInMin || 0;
//         state.remainingMinutes = remainingInMin || 0;
//       }
//     },
//     // NEW: Clear resume data
//     clearResumeData: (state) => {
//       state.canResumeExam = false;
//       state.resumeData = null;
//     },
//     // ===== NEW: Manual cache cleanup status update =====
//     setCacheCleanupStatus: (state, action) => {
//       state.cacheCleanupStatus = action.payload;
//       if (action.payload === 'success') {
//         state.isCacheCleanedUp = true;
//       }
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchExamInstructions.pending, (state) => {
//         state.isLoading = true;
//         state.error = null;
//       })
//       .addCase(fetchExamInstructions.fulfilled, (state, action) => {
//         const totalQuestions = action.payload.total_questions;
//         const timeLimit = action.payload.exam_duration;

//         state.isLoading = false;
//         state.instructions = action.payload.instructions;
//         state.examName = action.payload.exam_name;
//         state.examId = action.payload.exam_id;
//         state.totalQuestions = totalQuestions;
//         state.examTimeLimit = timeLimit * 60;
//         state.examTimeLeft = state.examTimeLimit;
//         state.answers = Array(totalQuestions).fill(null);
//         state.visitedQuestions = [];
//         state.examLanguages = action.payload.Language;
//         state.examSection = action.payload.examsection;
//       })
//       .addCase(fetchExamInstructions.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload;
//       })

//       // NEW: Handle check resume
//       .addCase(checkExamResume.pending, (state) => {
//         state.isCheckingResume = true;
//         state.error = null;
//       })
//       .addCase(checkExamResume.fulfilled, (state, action) => {
//         state.isCheckingResume = false;
//         state.canResumeExam = action.payload.canResume;
//         state.resumeData = action.payload.resumeData;
//         state.lastDraftSavedAt = action.payload.serverTime;
//       })
//       .addCase(checkExamResume.rejected, (state, action) => {
//         state.isCheckingResume = false;
//         state.error = action.payload;
//         state.canResumeExam = false;
//       })

//       // NEW: Handle resume exam
//       .addCase(resumeExam.pending, (state) => {
//         state.isResuming = true;
//         state.error = null;
//       })
//       .addCase(resumeExam.fulfilled, (state, action) => {
//         state.isResuming = false;
//         state.isExamStarted = true;
//         state.isResumedSession = true;

//         const { questions, answers, visitedQuestions, currentQuestionIndex } =
//           action.payload;

//         // Restore exam state
//         state.questions = questions;
//         state.answers = answers;
//         state.visitedQuestions = visitedQuestions;
//         state.currentQuestionIndex = currentQuestionIndex;

//         // Set current question
//         state.currentQuestion = questions[currentQuestionIndex];

//         // Set selected option for current question
//         const currentAnswer = answers[currentQuestionIndex];
//         state.selectedOption = currentAnswer?.selected_option || null;

//         // Adjust exam time if usedMinutes is present
//         const resumeUsedMinutes = sessionStorage.getItem("re-attempt");
//         console.log("Resume used minutes:", resumeUsedMinutes);

//         const usedTimeFloat = resumeUsedMinutes; // e.g., 6.41
//         const examLimit = state.examTimeLimit || 100 * 60; // fallback to default
//         const usedSeconds = convertUsedTimeToSeconds(usedTimeFloat);

//         const remaining = Math.max(examLimit - usedSeconds, 0);
//         state.examTimeLeft = remaining;

//         // Clear resume data
//         state.canResumeExam = false;
//         state.resumeData = null;
//       })
//       .addCase(resumeExam.rejected, (state, action) => {
//         state.isResuming = false;
//         state.error = action.payload;
//       })

//       .addCase(startExam.pending, (state) => {
//         state.isLoading = true;
//         state.error = null;
//       })
//       .addCase(startExam.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.isExamStarted = true;
//         state.currentQuestion = action.payload;
//         state.questions[state.currentQuestionIndex] = action.payload;
//         if (!state.visitedQuestions.includes(0)) {
//           state.visitedQuestions.push(0);
//         }
//       })
//       .addCase(startExam.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload;
//       })

//       .addCase(fetchQuestion.pending, (state) => {
//         state.isLoading = true;
//       })
//       .addCase(fetchQuestion.fulfilled, (state, action) => {
//         state.isLoading = false;
//         const { question, index } = action.payload;
//         state.currentQuestion = question;
//         state.questions[index] = question;
//         state.currentQuestionIndex = index;
//         if (!state.visitedQuestions.includes(index)) {
//           state.visitedQuestions.push(index);
//         }

//         const savedAnswer = state.answers[index];
//         state.selectedOption = savedAnswer?.selected_option || null;
//         state.questionTimeLeft = state.questionTimeLimit;
//       })
//       .addCase(fetchQuestion.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload;
//       })

//       .addCase(saveAnswer.fulfilled, (state, action) => {
//         state.isSavingAnswer = false;

//         const {
//           id,
//           selected_option,
//           marked_for_review,
//           time_spent,
//           nextQuestion,
//           stayOnQuestion,
//         } = action.payload;

//         const currentIndex = id - 1;
//         state.answers[currentIndex] = {
//           selected_option,
//           marked_for_review,
//           time_spent,
//         };

//         if (stayOnQuestion) return;

//         if (nextQuestion) {
//           const nextIndex = currentIndex + 1;

//           state.currentQuestion = nextQuestion;
//           state.questions[nextIndex] = nextQuestion;
//           state.currentQuestionIndex = nextIndex;
//           state.questionTimeLeft = state.questionTimeLimit;

//           const savedAnswer = state.answers[nextIndex];
//           state.selectedOption = savedAnswer?.selected_option || null;

//           if (!state.visitedQuestions.includes(nextIndex)) {
//             state.visitedQuestions.push(nextIndex);
//           }
//         }
//       })
//       .addCase(saveAnswer.pending, (state) => {
//         state.isSavingAnswer = true;
//       })
//       .addCase(saveAnswer.rejected, (state, action) => {
//         state.isSavingAnswer = false;
//         state.error = action.payload;
//       })

//       .addCase(submitExam.pending, (state) => {
//         state.isSubmitting = true;
//         state.error = null;
//       })
//       .addCase(submitExam.fulfilled, (state, action) => {
//         state.isSubmitting = false;
//         state.isExamSubmitted = true;
//         state.examResult = action.payload.result;
//          state.isCacheCleanedUp = action.payload.cacheCleanedUp;
//         state.cacheCleanupStatus = action.payload.cacheCleanedUp ? 'success' : 'failed';
//         sessionStorage.removeItem("examStarted"); 
//         sessionStorage.removeItem("re-attempt");
//         closeExamSocket();
//       })
//       .addCase(submitExam.rejected, (state, action) => {
//         state.isSubmitting = false;
//         state.error = action.payload;
//       })
//       .addCase(saveDraft.fulfilled, (state, action) => {
//         state.lastDraftSavedAt = action.payload.serverTime;
//       })
//       .addCase(saveDraft.rejected, (state, action) => {
//         state.error = action.payload;
//       });
//   },
// });

// export const {
//   decrementExamTime,
//   decrementQuestionTime,
//   resetQuestionTime,
//   setSelectedOption,
//   updateAnswer,
//   clearSelectedOption,
//   setCurrentQuestionIndex,
//   markQuestionVisited,
//   forceSubmitExam,
//   clearError,
//   initializeExam,
//   resetExam,
//   updateSocketStatus,
//   clearResumeData,
//    setCacheCleanupStatus,
// } = examSlice.actions;

// export default examSlice.reducer;

// Enhanced examSlice.js with subject/section support
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { closeExamSocket, connectExamSocket } from "./examSocket";
import { convertUsedTimeToSeconds } from "@/utils/utils";
import apiClient from "@/services/apiClient";

// Helper functions for subject/section management
const parseExamSections = (examSection) => {
  if (!examSection || Object.keys(examSection).length === 0) {
    return null;
  }

  // Filter out null sections
  const filteredSections = Object.entries(examSection).reduce((acc, [subject, sections]) => {
    if (subject !== 'null' && sections && typeof sections === 'object') {
      const validSections = Object.entries(sections).reduce((sectionAcc, [sectionName, questionCount]) => {
        if (sectionName !== 'null' && questionCount > 0) {
          sectionAcc[sectionName] = questionCount;
        }
        return sectionAcc;
      }, {});

      if (Object.keys(validSections).length > 0) {
        acc[subject] = validSections;
      }
    }
    return acc;
  }, {});

  return Object.keys(filteredSections).length > 0 ? filteredSections : null;
};

const createSubjectSectionStructure = (examSection) => {
  const parsed = parseExamSections(examSection);
  if (!parsed) return null;

  const structure = [];
  let globalQuestionIndex = 0;

  Object.entries(parsed).forEach(([subject, sections]) => {
    const subjectData = {
      subject,
      sections: []
    };

    Object.entries(sections).forEach(([sectionName, questionCount]) => {
      subjectData.sections.push({
        section: sectionName,
        questionCount,
        startIndex: globalQuestionIndex,
        endIndex: globalQuestionIndex + questionCount - 1
      });
      globalQuestionIndex += questionCount;
    });

    structure.push(subjectData);
  });

  return structure;
};

export const findQuestionLocation = (questionIndex, subjectStructure) => {
  if (!subjectStructure) return null;

  for (let subjectIdx = 0; subjectIdx < subjectStructure.length; subjectIdx++) {
    const subject = subjectStructure[subjectIdx];
    for (let sectionIdx = 0; sectionIdx < subject.sections.length; sectionIdx++) {
      const section = subject.sections[sectionIdx];
      if (questionIndex >= section.startIndex && questionIndex <= section.endIndex) {
        return {
          subjectIndex: subjectIdx,
          sectionIndex: sectionIdx,
          subject: subject.subject,
          section: section.section,
          localQuestionIndex: questionIndex - section.startIndex,
          globalQuestionIndex: questionIndex
        };
      }
    }
  }
  return null;
};

// Enhanced async thunks remain mostly the same, but with additional payload data

export const fetchExamInstructions = createAsyncThunk(
  "exam/fetchInstructions",
  async (_, { getState, rejectWithValue }) => {
    try {
      const response = await apiClient.get("api/exam/instruction");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch instructions"
      );
    }
  }
);

export const checkExamResume = createAsyncThunk(
  "exam/checkResume",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await apiClient.get("api/studentAnswer/re_login");

      if (response.data && Object.keys(response.data).length > 0) {
        return {
          canResume: true,
          resumeData: response.data,
          serverTime: new Date().toISOString(),
        };
      } else {
        return {
          canResume: false,
          resumeData: null,
          serverTime: new Date().toISOString(),
        };
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to check exam resume status"
      );
    }
  }
);



export const resumeExam = createAsyncThunk(
  "exam/resume",
  async (resumeData, { getState, dispatch, rejectWithValue }) => {
    try {
      const { auth, exam } = getState();

      connectExamSocket(auth.student.id, (socketData) => {
        dispatch(updateSocketStatus(socketData));
      });

      const processedData = {
        questions: {},
        answers: [],
        visitedQuestions: [],
        currentQuestionIndex: 0,
        lastQuestionId: 0,
      };

      // Helper function to find global index for subject/section mode
      const findGlobalIndex = (localId, subject, section, subjectStructure) => {
        if (!subjectStructure) {
          // For simple mode without subject/section structure
          return localId - 1;
        }
        
        // For subject/section mode, find the global position
        for (let subjectIdx = 0; subjectIdx < subjectStructure.length; subjectIdx++) {
          const subjectData = subjectStructure[subjectIdx];
          if (subjectData.subject === subject) {
            for (let sectionIdx = 0; sectionIdx < subjectData.sections.length; sectionIdx++) {
              const sectionData = subjectData.sections[sectionIdx];
              if (sectionData.section === section) {
                const globalIndex = sectionData.startIndex + (localId - 1);
                return globalIndex;
              }
            }
          }
        }
        
        return localId - 1; // fallback
      };

      // Initialize answers array
      processedData.answers = Array(exam.totalQuestions).fill(null);

      // 🔥 KEY CHANGE: Track the last question in the response array
      let lastQuestionGlobalIndex = 0;

      resumeData.forEach((questionData, index) => {
        const question = {
          id: questionData.question_id,
          question: questionData.question,
          question_type: questionData.question_type,
          option_a: questionData.option_a,
          option_b: questionData.option_b,
          option_c: questionData.option_c,
          option_d: questionData.option_d,
        };

        let globalIndex;
        
        if (exam.isSubjectSectionMode && exam.subjectStructure) {
          // For subject/section mode, calculate global index
          globalIndex = findGlobalIndex(
            questionData.id, 
            questionData.question_subject, 
            questionData.section, 
            exam.subjectStructure
          );
        } else {
          // For simple mode, use question_id directly
          // globalIndex = questionData.question_id - 1;
          globalIndex = questionData.id - 1;
        }
        console.log(processedData , "processdata");
        

        // Store question with global index as key
        processedData.questions[globalIndex] = question;
        
        // Store answer data
        processedData.answers[globalIndex] = {
          question_id: questionData.question_id,
          selected_option: questionData.selected_option || null,
          answer_text: questionData.answer_text || "",
          marked_for_review: questionData.mark_for_review || false,
          time_spent: 0,
        };

        // Track visited questions
        if (!processedData.visitedQuestions.includes(globalIndex)) {
          processedData.visitedQuestions.push(globalIndex);
        }

        // 🔥 KEY CHANGE: Track the last question in the response array
        // The last item in the loop will be the last question where user left
        if (index === resumeData.length - 1) {
          lastQuestionGlobalIndex = globalIndex;
          processedData.lastQuestionId = questionData.question_id;
        }
      });

      // 🔥 KEY CHANGE: Set current question to the last question in response
      processedData.currentQuestionIndex = lastQuestionGlobalIndex;

      console.log("Resume Data Processed:", {
        totalQuestions: exam.totalQuestions,
        visitedQuestions: processedData.visitedQuestions,
        currentIndex: processedData.currentQuestionIndex,
        lastQuestionId: processedData.lastQuestionId,
        isSubjectMode: exam.isSubjectSectionMode
      });

      return processedData;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to resume exam"
      );
    }
  }
);

export const startExam = createAsyncThunk(
  "exam/start",
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const selectedLanguage = sessionStorage.getItem("examLanguage");
      const { auth } = getState();
      const response = await apiClient.post("api/exam/start", {
        Languages: selectedLanguage
      });

      connectExamSocket(auth.student.id, (socketData) => {
        dispatch(updateSocketStatus(socketData));
      });

      const questionData = response.data;
      const actualQuestion = questionData?.question || questionData;

      return actualQuestion;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to start exam"
      );
    }
  }
);

export const fetchQuestion = createAsyncThunk(
  "exam/fetchQuestion",
  async (questionIndex, { getState, rejectWithValue }) => {
    try {
      const { auth, exam } = getState();

      let payload = {};
      let localIndex = null;
      let subject = null;
      let section = null;

      // find current subject/section based on index
      if (exam.isSubjectSectionMode && exam.subjectStructure) {
        const location = findQuestionLocation(questionIndex, exam.subjectStructure);
        if (location) {
          localIndex = location.localQuestionIndex + 1;
          subject = location.subject;
          section = location.section;
        }
         
        payload={
          id: localIndex,
          subject,
          section,
        };
      } else {
        payload ={
          id: questionIndex + 1
        }
        }
      const response = await apiClient.post(`api/question/ques_BYid`, payload);

      const questionData = response.data;
      const actualQuestion = questionData;

      return { question: actualQuestion, index: questionIndex };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch question"
      );
    }
  }
);

export const saveAnswer = createAsyncThunk(
  "exam/saveAnswer",
  async (answerData, { getState, rejectWithValue }) => {
    try {
      const { auth, exam } = getState();
      
      // Enhanced payload with subject/section info
      const location = findQuestionLocation(answerData.id - 1, exam.subjectStructure);
      
      const payload = {
        student_id: auth.student?.id,
        ...answerData,
        // Add subject/section context if available
        ...(location && {
          id:location.localQuestionIndex +1,
          subject: location.subject,
          section: location.section,
          subject_index: location.subjectIndex,
          section_index: location.sectionIndex
        })
      };

      const response = await apiClient.post("api/question/save_next", payload);
      const nextQuestion = response.data;

      if (nextQuestion?.status === false) {
        return { ...answerData, nextQuestion: null, isLastQuestion: true, success: true };
      }
      
      return { ...answerData, nextQuestion, success: true };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to save answer"
      );
    }
  }
);

// Other async thunks remain the same...
const cleanupExamCache = async (examId) => {
  try {
    if (window.examImageCache && examId) {
      console.log('🧹 Cleaning up exam cache for examId:', examId);
      await window.examImageCache.cleanupExam(examId);
      window.examImageCache = null;
      console.log('✅ Cache cleanup completed successfully');
      return true;
    }
  } catch (error) {
    console.error('❌ Cache cleanup failed:', error);
    return false;
  }
};

export const submitExam = createAsyncThunk(
  "exam/submit",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth, exam } = getState();
      const response = await apiClient.get("api/studentAnswer/submit");
      const examId = exam.examId;
      const cleanupSuccess = await cleanupExamCache(examId);

      return { 
        result: response.data,
        cacheCleanedUp: cleanupSuccess
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to submit exam"
      );
    }
  }
);

export const saveDraft = createAsyncThunk(
  "exam/saveDraft",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth, exam } = getState();
      const response = await apiClient.get("api/studentAnswer/re_login");

      return {
        serverTime: new Date().toISOString(),
        draftData: response.data,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to save exam draft"
      );
    }
  }
);

// Enhanced slice
const examSlice = createSlice({
  name: "exam",
  initialState: {
    socketStatus: "disconnected",
    usedMinutes: 0,
    remainingMinutes: 0,
    totalQuestions: 100,
    examTimeLimit: 100 * 60,
    questionTimeLimit: 60,

    isExamStarted: false,
    isExamSubmitted: false,
    examTimeLeft: 100 * 60,
    questionTimeLeft: 60,

    currentQuestion: null,
    currentQuestionIndex: 0,
    questions: {},
    answers: [],
    selectedOption: null,
     answerText: "",

    instructions: null,
    examName: null,
    examId: null,

    isLoading: false,
    isSavingAnswer: false,
    isSubmitting: false,
    isCheckingResume: false,
    isResuming: false,

    error: null,

    visitedQuestions: [],
    examLanguages: [],
    examSection: {},
    lastDraftSavedAt: null,
    examResult: null,

    // NEW: Subject/Section related state
    subjectStructure: null, // Parsed structure from examSection
    isSubjectSectionMode: false, // Flag to determine if we use subject/section mode
    currentSubject: null, // Current subject info
    currentSection: null, // Current section info
    subjectProgress: {}, // Track progress per subject/section

    // Resume-related state
    canResumeExam: false,
    resumeData: null,
    isResumedSession: false,
    cacheCleanupStatus: null,
    isCacheCleanedUp: false,
  },
  reducers: {
    decrementExamTime: (state) => {
      if (state.examTimeLeft > 0 && !state.isExamSubmitted) {
        state.examTimeLeft -= 1;
      }
    },
    decrementQuestionTime: (state) => {
      if (state.questionTimeLeft > 0 && !state.isExamSubmitted) {
        state.questionTimeLeft -= 1;
      }
    },
    resetQuestionTime: (state) => {
      state.questionTimeLeft = state.questionTimeLimit;
    },
    setSelectedOption: (state, action) => {
      state.selectedOption = action.payload;
    },
    setAnswerText: (state, action) => {
      state.answerText = action.payload;
    },
    updateAnswer: (state, action) => {
      const { index, answerData } = action.payload;
      const newAnswers = [...state.answers];
      newAnswers[index] = answerData;
      state.answers = newAnswers;
    },
    clearSelectedOption: (state) => {
      state.selectedOption = null;
    },
    // NEW: Clear both selected option and answer text
    clearCurrentAnswer: (state) => {
      state.selectedOption = null;
      state.answerText = "";
    },
    setCurrentQuestionIndex: (state, action) => {
      const newIndex = action.payload;
      if (newIndex >= 0 && newIndex < state.totalQuestions) {
        state.currentQuestionIndex = newIndex;
        
        // Update subject/section context if in subject-section mode
        if (state.isSubjectSectionMode && state.subjectStructure) {
          const location = findQuestionLocation(newIndex, state.subjectStructure);
          if (location) {
            state.currentSubject = {
              index: location.subjectIndex,
              name: location.subject
            };
            state.currentSection = {
              index: location.sectionIndex,
              name: location.section
            };
          }
        }

        if (!state.visitedQuestions.includes(newIndex)) {
          state.visitedQuestions.push(newIndex);
        }
        
       const savedAnswer = state.answers[newIndex];
        state.selectedOption = savedAnswer?.selected_option || null;
        state.answerText = savedAnswer?.answer_text || "";
      }
    },
    markQuestionVisited: (state, action) => {
      const index = action.payload;
      if (!state.visitedQuestions.includes(index)) {
        state.visitedQuestions.push(index);
      }
    },
    forceSubmitExam: (state) => {
      state.isExamSubmitted = true;
      state.examTimeLeft = 0;
    },
    clearError: (state) => {
      state.error = null;
    },
    initializeExam: (state, action) => {
      const { totalQuestions = 100, timeLimit } = action.payload || {};
      state.totalQuestions = totalQuestions;
      state.examTimeLimit = timeLimit * 60;
      state.examTimeLeft = state.examTimeLimit;
      state.answers = Array(totalQuestions).fill(null);
      state.visitedQuestions = [];
       state.answerText = "";
       state.selectedOption = null;
      state.isCacheCleanedUp = false;
      state.cacheCleanupStatus = null;
    },
    resetExam: (state) => {
      return {
        ...state,
        isExamStarted: false,
        isExamSubmitted: false,
        examTimeLeft: state.examTimeLimit,
        questionTimeLeft: state.questionTimeLimit,
        currentQuestion: null,
        currentQuestionIndex: 0,
        answers: Array(state.totalQuestions).fill(null),
        selectedOption: null,
        answerText: "",
        visitedQuestions: [],
        error: null,
        canResumeExam: false,
        resumeData: null,
        isResumedSession: false,
        isCacheCleanedUp: false,
        cacheCleanupStatus: null,
        // Reset subject/section state
        currentSubject: null,
        currentSection: null,
        subjectProgress: {},
      };
    },
    updateSocketStatus: (state, action) => {
      // console.log( action.payload, "socketmsg");
      
      const { type, status, usedInMin, remainingInMin } = action.payload;

      if (type === "connection") {
        state.socketStatus = status;
      } else if (type === "status") {
        state.socketStatus = status;
        state.usedMinutes = usedInMin || 0;
        state.remainingMinutes = remainingInMin || 0;
      } else {
        state.socketStatus = status;
        state.usedMinutes = usedInMin || 0;
        state.remainingMinutes = remainingInMin || 0;
      }
    },
    clearResumeData: (state) => {
      state.canResumeExam = false;
      state.resumeData = null;
    },
    setCacheCleanupStatus: (state, action) => {
      state.cacheCleanupStatus = action.payload;
      if (action.payload === 'success') {
        state.isCacheCleanedUp = true;
      }
    },
    // NEW: Subject/Section specific reducers
    setCurrentSubjectSection: (state, action) => {
      const { subjectIndex, sectionIndex } = action.payload;
      if (state.subjectStructure && state.subjectStructure[subjectIndex]) {
        const subject = state.subjectStructure[subjectIndex];
        if (subject.sections[sectionIndex]) {
          state.currentSubject = {
            index: subjectIndex,
            name: subject.subject
          };
          state.currentSection = {
            index: sectionIndex,
            name: subject.sections[sectionIndex].section
          };
          
          // Navigate to first question of this section
          const startIndex = subject.sections[sectionIndex].startIndex;
          state.currentQuestionIndex = startIndex;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExamInstructions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchExamInstructions.fulfilled, (state, action) => {
        const totalQuestions = action.payload.total_questions;
        const timeLimit = action.payload.exam_duration;

        state.isLoading = false;
        state.instructions = action.payload.instructions;
        state.examName = action.payload.exam_name;
        state.examId = action.payload.exam_id;
        state.totalQuestions = totalQuestions;
        state.examTimeLimit = timeLimit * 60;
        state.examTimeLeft = state.examTimeLimit;
        state.answers = Array(totalQuestions).fill(null);
        state.visitedQuestions = [];
        state.examLanguages = action.payload.Language;
        state.examSection = action.payload.examsection;

        // NEW: Process subject/section structure
        const subjectStructure = createSubjectSectionStructure(action.payload.examsection);
        state.subjectStructure = subjectStructure;
        state.isSubjectSectionMode = !!subjectStructure;
        
        // Initialize with first subject/section if available
        if (subjectStructure && subjectStructure.length > 0) {
          state.currentSubject = {
            index: 0,
            name: subjectStructure[0].subject
          };
          state.currentSection = {
            index: 0,
            name: subjectStructure[0].sections[0].section
          };
        }
      })
      .addCase(fetchExamInstructions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Other cases remain similar...
      .addCase(checkExamResume.pending, (state) => {
        state.isCheckingResume = true;
        state.error = null;
      })
      .addCase(checkExamResume.fulfilled, (state, action) => {
        state.isCheckingResume = false;
        state.canResumeExam = action.payload.canResume;
        state.resumeData = action.payload.resumeData;
        state.lastDraftSavedAt = action.payload.serverTime;
      })
      .addCase(checkExamResume.rejected, (state, action) => {
        state.isCheckingResume = false;
        state.error = action.payload;
        state.canResumeExam = false;
      })
      .addCase(resumeExam.pending, (state) => {
        state.isResuming = true;
        state.error = null;
      })
      // .addCase(resumeExam.fulfilled, (state, action) => {
      //   state.isResuming = false;
      //   state.isExamStarted = true;
      //   state.isResumedSession = true;

      //   const { questions, answers, visitedQuestions, currentQuestionIndex } = action.payload;

      //   state.questions = questions;
      //   state.answers = answers;
      //   // state.visitedQuestions = visitedQuestions;
      //    state.visitedQuestions = (visitedQuestions || []).map(v => Number(v)); // force numbers
      //    console.log("Visited Questions after resume:", state.visitedQuestions);
         
      //   state.currentQuestionIndex = currentQuestionIndex;
      //   state.currentQuestion = questions[currentQuestionIndex];

      //   // Update subject/section context for resumed session
      //   if (state.isSubjectSectionMode && state.subjectStructure) {
      //     const location = findQuestionLocation(currentQuestionIndex, state.subjectStructure);
      //     if (location) {
      //       state.currentSubject = {
      //         index: location.subjectIndex,
      //         name: location.subject
      //       };
      //       state.currentSection = {
      //         index: location.sectionIndex,
      //         name: location.section
      //       };
      //     }
      //   }

      //   const currentAnswer = answers[currentQuestionIndex];
      //   state.selectedOption = currentAnswer?.selected_option || null;
      //    state.answerText = currentAnswer?.answer_text || "";
      //   const resumeUsedMinutes = sessionStorage.getItem("re-attempt");
      //   const usedTimeFloat = resumeUsedMinutes;
      //   const examLimit = state.examTimeLimit || 100 * 60;
      //   const usedSeconds = convertUsedTimeToSeconds(usedTimeFloat);
      //   const remaining = Math.max(examLimit - usedSeconds, 0);
      //   state.examTimeLeft = remaining;

      //   state.canResumeExam = false;
      //   state.resumeData = null;
      // })
      .addCase(resumeExam.fulfilled, (state, action) => {
  state.isResuming = false;
  state.isExamStarted = true;
  state.isResumedSession = true;

  const { questions, answers, visitedQuestions, currentQuestionIndex } = action.payload;

  // Restore state data
  state.questions = questions;
  state.answers = answers;
  state.visitedQuestions = visitedQuestions.map(v => Number(v)); // Ensure numbers
  state.currentQuestionIndex = currentQuestionIndex;
  state.currentQuestion = questions[currentQuestionIndex];

  console.log("Resume State Restored:", {
    visitedQuestions: state.visitedQuestions,
    currentIndex: state.currentQuestionIndex,
    hasCurrentQuestion: !!state.currentQuestion
  });

  // Update subject/section context for resumed session
  if (state.isSubjectSectionMode && state.subjectStructure) {
    const location = findQuestionLocation(currentQuestionIndex, state.subjectStructure);
    if (location) {
      state.currentSubject = {
        index: location.subjectIndex,
        name: location.subject
      };
      state.currentSection = {
        index: location.sectionIndex,
        name: location.section
      };
      
      console.log("Subject/Section context restored:", {
        subject: state.currentSubject,
        section: state.currentSection
      });
    } else {
      console.warn("Could not determine subject/section for resumed question index:", currentQuestionIndex);
    }
  }

  // Restore current answer state
  const currentAnswer = answers[currentQuestionIndex];
  if (currentAnswer) {
    state.selectedOption = currentAnswer.selected_option || null;
    state.answerText = currentAnswer.answer_text || "";
  } else {
    state.selectedOption = null;
    state.answerText = "";
  }

  // Calculate remaining time
  const resumeUsedMinutes = sessionStorage.getItem("re-attempt");
  if (resumeUsedMinutes) {
    const usedTimeFloat = parseFloat(resumeUsedMinutes);
    const examLimit = state.examTimeLimit || 100 * 60;
    const usedSeconds = convertUsedTimeToSeconds(usedTimeFloat);
    const remaining = Math.max(examLimit - usedSeconds, 0);
    state.examTimeLeft = remaining;
    
    console.log("Time restored:", {
      usedMinutes: usedTimeFloat,
      usedSeconds,
      remaining,
      examLimit
    });
  }

  // Clear resume flags
  state.canResumeExam = false;
  state.resumeData = null;

  console.log("✅ Exam resume completed successfully");
})
      .addCase(resumeExam.rejected, (state, action) => {
        state.isResuming = false;
        state.error = action.payload;
      })
      .addCase(startExam.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(startExam.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isExamStarted = true;
        state.currentQuestion = action.payload;
        state.questions[state.currentQuestionIndex] = action.payload;
        if (!state.visitedQuestions.includes(0)) {
          state.visitedQuestions.push(0);
        }
         state.selectedOption = null;
        state.answerText = "";
      })
      .addCase(startExam.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchQuestion.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchQuestion.fulfilled, (state, action) => {
        state.isLoading = false;
        const { question, index } = action.payload;
        state.currentQuestion = question;
        state.questions[index] = question;
        state.currentQuestionIndex = index;
        
        // Update subject/section context
        if (state.isSubjectSectionMode && state.subjectStructure) {
          const location = findQuestionLocation(index, state.subjectStructure);
          if (location) {
            state.currentSubject = {
              index: location.subjectIndex,
              name: location.subject
            };
            state.currentSection = {
              index: location.sectionIndex,
              name: location.section
            };
          }
        }
        
        if (!state.visitedQuestions.includes(index)) {
          state.visitedQuestions.push(index);
        }

        const savedAnswer = state.answers[index];
        state.selectedOption = savedAnswer?.selected_option || null;
         state.answerText = savedAnswer?.answer_text || "";
        state.questionTimeLeft = state.questionTimeLimit;
      })
      .addCase(fetchQuestion.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(saveAnswer.fulfilled, (state, action) => {
        state.isSavingAnswer = false;

        const {
          id,
          selected_option,
           answer_text,
          marked_for_review,
          time_spent,
          nextQuestion,
          stayOnQuestion,
        } = action.payload;

        const currentIndex = id - 1;
        state.answers[currentIndex] = {
          selected_option,
           answer_text: answer_text || "",
          marked_for_review,
          time_spent,
        };

        if (stayOnQuestion) return;

        if (nextQuestion) {
          const nextIndex = currentIndex + 1;

          state.currentQuestion = nextQuestion;
          state.questions[nextIndex] = nextQuestion;
          state.currentQuestionIndex = nextIndex;
          state.questionTimeLeft = state.questionTimeLimit;

          // Update subject/section context for next question
          if (state.isSubjectSectionMode && state.subjectStructure) {
            const location = findQuestionLocation(nextIndex, state.subjectStructure);
            if (location) {
              state.currentSubject = {
                index: location.subjectIndex,
                name: location.subject
              };
              state.currentSection = {
                index: location.sectionIndex,
                name: location.section
              };
            }
          }

          const savedAnswer = state.answers[nextIndex];
          state.selectedOption = savedAnswer?.selected_option || null;
           state.answerText = savedAnswer?.answer_text || "";


          if (!state.visitedQuestions.includes(nextIndex)) {
            state.visitedQuestions.push(nextIndex);
          }
        }
      })
      .addCase(saveAnswer.pending, (state) => {
        state.isSavingAnswer = true;
      })
      .addCase(saveAnswer.rejected, (state, action) => {
        state.isSavingAnswer = false;
        state.error = action.payload;
      })
      .addCase(submitExam.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(submitExam.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.isExamSubmitted = true;
        state.examResult = action.payload.result;
        state.isCacheCleanedUp = action.payload.cacheCleanedUp;
        state.cacheCleanupStatus = action.payload.cacheCleanedUp ? 'success' : 'failed';
        sessionStorage.removeItem("examStarted");
        sessionStorage.removeItem("re-attempt");
        closeExamSocket();
      })
      .addCase(submitExam.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })
      .addCase(saveDraft.fulfilled, (state, action) => {
        state.lastDraftSavedAt = action.payload.serverTime;
      })
      .addCase(saveDraft.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

// Enhanced selectors
export const selectCurrentQuestionInfo = (state) => {
  const { exam } = state;
  if (!exam.isSubjectSectionMode || !exam.subjectStructure) {
    return {
      questionNumber: exam.currentQuestionIndex + 1,
      totalQuestions: exam.totalQuestions,
      isSubjectMode: false
    };
  }

  const location = findQuestionLocation(exam.currentQuestionIndex, exam.subjectStructure);
  if (!location) return null;

  return {
    questionNumber: exam.currentQuestionIndex + 1,
    totalQuestions: exam.totalQuestions,
    isSubjectMode: true,
    subject: location.subject,
    section: location.section,
    localQuestionNumber: location.localQuestionIndex + 1,
    sectionQuestionCount: exam.subjectStructure[location.subjectIndex].sections[location.sectionIndex].questionCount
  };
};

export const selectNavigationInfo = (state) => {
  const { exam } = state;
  const currentIndex = exam.currentQuestionIndex;
  
  let canGoNext = currentIndex < exam.totalQuestions - 1;
  let canGoPrevious = currentIndex > 0;
  let nextSectionInfo = null;
  let previousSectionInfo = null;

  if (exam.isSubjectSectionMode && exam.subjectStructure) {
    const location = findQuestionLocation(currentIndex, exam.subjectStructure);
    if (location) {
      const currentSection = exam.subjectStructure[location.subjectIndex].sections[location.sectionIndex];
      
      // Check if we're at section/subject boundaries
      const isLastInSection = currentIndex === currentSection.endIndex;
      const isFirstInSection = currentIndex === currentSection.startIndex;
      
      if (canGoNext && isLastInSection) {
        const nextLocation = findQuestionLocation(currentIndex + 1, exam.subjectStructure);
        if (nextLocation) {
          nextSectionInfo = {
            subject: nextLocation.subject,
            section: nextLocation.section,
            isNewSubject: nextLocation.subject !== location.subject
          };
        }
      }
      
      if (canGoPrevious && isFirstInSection) {
        const prevLocation = findQuestionLocation(currentIndex - 1, exam.subjectStructure);
        if (prevLocation) {
          previousSectionInfo = {
            subject: prevLocation.subject,
            section: prevLocation.section,
            isNewSubject: prevLocation.subject !== location.subject
          };
        }
      }
    }
  }

  return {
    canGoNext,
    canGoPrevious,
    nextSectionInfo,
    previousSectionInfo,
    isLastQuestion: currentIndex === exam.totalQuestions - 1,
    isFirstQuestion: currentIndex === 0
  };
};

export const {
  decrementExamTime,
  decrementQuestionTime,
  resetQuestionTime,
  setSelectedOption,
  setAnswerText,
  updateAnswer,
  clearSelectedOption,
  clearCurrentAnswer,
  setCurrentQuestionIndex,
  markQuestionVisited,
  forceSubmitExam,
  clearError,
  initializeExam,
  resetExam,
  updateSocketStatus,
  clearResumeData,
  setCacheCleanupStatus,
  setCurrentSubjectSection,
} = examSlice.actions;

export default examSlice.reducer;