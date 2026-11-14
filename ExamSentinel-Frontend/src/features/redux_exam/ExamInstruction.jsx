import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth, useExam } from "@/hooks/redux";
import { initializeAuthWithPhoto, verifyToken } from "@/store/slices/authSlice";
import {
  fetchExamInstructions,
  initializeExam,
  checkExamResume,
  resumeExam,
} from "@/store/slices/examSlice";
import { useFullScreen } from "@/hooks/useFullScreen";
import { useInstructionAuditLogger } from "@/hooks/auditLogger/useInstructionAuditLogger";
import apiClient from "@/services/apiClient";
import { useDispatch } from "react-redux";
import { useExamSocket } from "@/store/context/ExamSocketContext";
import ConfirmDialog from "./ConfirmDialog";
import { useExamAuditLogger } from "@/hooks/auditLogger/useExamAuditLogger";
import dummyPersonImg from "/Dummy_Person_img.png"

// Image Cache Manager Class
class ExamImageCache {
  constructor() {
    this.cache = new Map();
    this.dbName = "ExamImageCache";
    this.dbVersion = 1;
    this.storeName = "images";
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: "id" });
          store.createIndex("examId", "examId", { unique: false });
        }
      };
    });
  }

  async processImage(imageRef, imageId, maxWidth = 800, quality = 0.85) {

    return new Promise(async (resolve, reject) => {
      try {

        const response = await apiClient.post(
          "api/question/ques_img",
          { filename: `${imageRef}` },
          { responseType: "blob" }
        );

        if (!response.status) {
          throw new Error(`Failed to fetch image for ${imageRef}`);
        }


        const blob = await response.data;


        const img = new Image();
        img.src = URL.createObjectURL(blob);

        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          let { width, height } = img;
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (processedBlob) => {
              if (processedBlob) {
                resolve({
                  id: imageId,
                  blob: processedBlob,
                  width,
                  height,
                  size: processedBlob.size,
                  originalUrl: imageRef + ".png",
                });
              } else {
                reject(new Error("Image processing failed"));
              }
            },
            "image/jpeg",
            quality
          );
        };

        img.onerror = () =>
          reject(new Error("Failed to load image into canvas"));
      } catch (err) {
        reject(err);
      }
    });
  }

  async storeImage(processedImage, examId) {
    const transaction = this.db.transaction([this.storeName], "readwrite");
    const store = transaction.objectStore(this.storeName);

    const imageData = {
      ...processedImage,
      examId: examId,
      timestamp: Date.now(),
      url: URL.createObjectURL(processedImage.blob),
    };

    await store.put(imageData);
    this.cache.set(processedImage.id, imageData);

    return imageData;
  }

  async preloadExamImages(imageList, examId, onProgress) {
    const results = {
      success: [],
      failed: [],
      totalSize: 0,
    };

    for (let i = 0; i < imageList.length; i++) {
      const { imageId, imageRef } = imageList[i];

      try {
        const processedImage = await this.processImage(imageRef, imageId);
        const storedImage = await this.storeImage(processedImage, examId);

        results.success.push({
          id: imageId,
          size: storedImage.size,
          dimensions: `${storedImage.width}x${storedImage.height}`,
        });
        results.totalSize += storedImage.size;

        if (onProgress) {
          onProgress({
            current: i + 1,
            total: imageList.length,
            currentImage: imageId,
            status: "success",
          });
        }
      } catch (error) {
        results.failed.push({ id: imageId, error: error.message });

        if (onProgress) {
          onProgress({
            current: i + 1,
            total: imageList.length,
            currentImage: imageId,
            status: "error",
            error: error.message,
          });
        }
      }
    }

    return results;
  }

  getImage(imageId) {
    return this.cache.get(imageId);
  }

  async cleanupExam(examId) {
    for (const [key, value] of this.cache) {
      if (value.examId === examId) {
        URL.revokeObjectURL(value.url);
        this.cache.delete(key);
      }
    }

    const transaction = this.db.transaction([this.storeName], "readwrite");
    const store = transaction.objectStore(this.storeName);
    const index = store.index("examId");
    const request = index.openCursor(IDBKeyRange.only(examId));

    return new Promise((resolve) => {
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
    });
  }

  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
}

// Create singleton instance
const imageCache = new ExamImageCache();

export default function ExamInstruction() {
  const { logExamEvent } = useExamAuditLogger();
  const dispatch = useDispatch();
  // const goFullScreen = useFullScreen();
  const { logInstructionEvent } = useInstructionAuditLogger();
  const navigate = useNavigate();
  const [resumeAvailable, setResumeAvailable] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  // ✅ Exam countdown timer states
  const [examCountdown, setExamCountdown] = useState(null); // in seconds
  const [examScheduleMessage, setExamScheduleMessage] = useState("");
  const [isExamStartAllowed, setIsExamStartAllowed] = useState();
  const [showModel, setShowModel] = useState(false);


  // Image preloading states
  const [imagePreloadStatus, setImagePreloadStatus] = useState({
    isPreloading: false,
    progress: null,
    completed: false,
    error: null,
  });

  const {
    student,
    isAuthenticated,
    profilePhoto,
    isLoading: authLoading,
    dispatch: authDispatch,
  } = useAuth();

  const {
    instructions,
    examLanguages,
    totalQuestions,
    examTimeLimit,
    examName,
    examId,
    isLoading: examLoading,
    error: examError,
    dispatch: examDispatch,
  } = useExam();
  const { socketData } = useExamSocket();


  // State to store WebSocket message history
  const [socketMessages, setSocketMessages] = useState([]);
  const [showSocketPanel, setShowSocketPanel] = useState(false);

  // ✅ Listen to socketData and handle exam schedule countdown
  useEffect(() => {
    if (socketData) {
      // console.log("📨 WebSocket Message Received:", socketData);

      setSocketMessages((prev) => [
        ...prev,
        { timestamp: new Date().toLocaleTimeString(), data: socketData },
      ].slice(-20));

      // ✅ Handle examSchedule message
      if (socketData?.type === "examSchedule") {
        const examStartMinutes = socketData.exam_start_time;
        const message = socketData.message;

        setExamScheduleMessage(message);
        setExamCountdown(examStartMinutes * 60); // Convert minutes to seconds
        setIsExamStartAllowed(false); // Disable start button

        toast.info(message, { duration: 5000 });
      }
    }
  }, [socketData]);

  const examStart = () => {
    logExamEvent("EXAM_START_BUTTON_ENABLE");
    setShowModel(false)

  }

  // ✅ Countdown timer effect
  useEffect(() => {
    if (examCountdown !== null && examCountdown > 0) {
      const timer = setInterval(() => {
        setExamCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsExamStartAllowed(true); // Enable start button
            setExamScheduleMessage(""); // Clear message
            setShowModel(true)
            toast.success("🎉 Exam is now available! You can start the exam.", {
              duration: 5000,
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [examCountdown]);

  // Format countdown time as MM:SS
  const formatCountdown = (seconds) => {
    if (seconds === null || seconds <= 0) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };


  // Initialize image cache
  useEffect(() => {
    initializeImageCache();
  }, []);


  const initializeImageCache = async () => {
    try {
      await imageCache.init();
      // console.log("Image cache initialized successfully");
    } catch (error) {
      console.error("Failed to initialize image cache:", error);
    }
  };

  // Verify auth and fetch instructions
  useEffect(() => {
    logInstructionEvent("INSTRUCTIONS_VIEWED");
    authDispatch(verifyToken())
      .unwrap()
      .then(() => {
        examDispatch(fetchExamInstructions());
        checkReattemptAndResume();
      })
      .catch(() => {
        toast.error("Please login first");
        navigate("/");
      });
  }, [authDispatch, examDispatch, navigate]);

  useEffect(() => {
    if (examId) {
      startImagePreloading(examId);
    }
  }, [examId]);


  useEffect(() => {
    dispatch(initializeAuthWithPhoto());
  }, [dispatch]);


  const fetchExamImages = async () => {
    try {
      const listResponse = await apiClient.get("api/question/ques_img_list");

      if (!listResponse.data.status) return [];

      const result = listResponse.data.result;

      const allImageRefs = [];

      // Loop through each question object in the API response
      result.forEach((question) => {
        // Add the question's main image reference
        if (question.imageRef) {
          allImageRefs.push(question.imageRef);
        }

        // Add the image references for each option
        if (question.option_a_image) {
          allImageRefs.push(question.option_a_image);
        }
        if (question.option_b_image) {
          allImageRefs.push(question.option_b_image);
        }
        if (question.option_c_image) {
          allImageRefs.push(question.option_c_image);
        }
        if (question.option_d_image) {
          allImageRefs.push(question.option_d_image);
        }
      });

      // Remove duplicates and create the final list for preloading
      const uniqueImageRefs = [...new Set(allImageRefs)];

      const imageList = uniqueImageRefs.map((ref) => ({
        imageId: ref,
        imageRef: ref,
        imageUrl: null
      }));

      return imageList;
    } catch (error) {
      console.error("Error fetching image references:", error);
      throw error;
    }
  };
  const startImagePreloading = async (currentExamId) => {

    if (!currentExamId) return;


    setImagePreloadStatus((prev) => ({ ...prev, isPreloading: true }));

    try {
      // Fetch image list from API
      const imageList = await fetchExamImages();
      // console.log("Fetched image list:", imageList);
      if (imageList.length === 0) {
        setImagePreloadStatus((prev) => ({
          ...prev,
          isPreloading: false,
          completed: true,
        }));
        return;
      }

      // Start preloading
      const results = await imageCache.preloadExamImages(
        imageList,
        currentExamId,
        (progress) => {
          setImagePreloadStatus((prev) => ({
            ...prev,
            progress: progress,
          }));
        }
      );


      setImagePreloadStatus((prev) => ({
        ...prev,
        isPreloading: false,
        completed: true,
        progress: null,
      }));


      if (results.failed.length > 0) {
        console.warn('Some images failed to preload:', results.failed);
      }
    } catch (error) {
      console.error("Image preloading failed:", error);
      setImagePreloadStatus((prev) => ({
        ...prev,
        isPreloading: false,
        error: error.message,
      }));
      toast.error("Failed to preload exam images");
    }
  };

  // Handle resume logic
  const checkReattemptAndResume = async () => {
    const usedTime = parseFloat(sessionStorage.getItem("re-attempt"));

    if (!isNaN(usedTime) && usedTime > 0) {
      try {
        await logInstructionEvent("EXAM_RESUME_CHECKED");
        const result = await examDispatch(checkExamResume()).unwrap();

        if (result?.canResume && result.resumeData) {
          setResumeAvailable(true);
          await logInstructionEvent("EXAM_RESUME_AVAILABLE");
        } else {
          sessionStorage.removeItem("re-attempt");
        }
      } catch (error) {
        console.error("Resume check failed");
      }
    }
  };

  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
    logInstructionEvent("EXAM_LANGUAGE_SELECTED", { language: e.target.value });
  };

  const handleStartExam = () => {
    if (!isAuthenticated) {
      toast.error("Authentication required");
      return;
    }

    if (!selectedLanguage) {
      toast.warning("Please Select Exam Language Before starting the Exam.");
      return;
    }

    // Check if images are still preloading
    if (imagePreloadStatus.isPreloading) {
      toast.warning("Images are still loading. Please wait a moment...");
      return;
    }

    // ✅ Check if exam start is allowed
    if (!isExamStartAllowed) {
      toast.warning("Please wait for the exam to start!");
      return;
    }

    // goFullScreen(); this we are doing via pxe boot
    logInstructionEvent("EXAM_STARTED", { resume: false });

    examDispatch(
      initializeExam({
        totalQuestions: totalQuestions || 0,
        timeLimit: examTimeLimit / 60 || 0,
      })
    );

    // Store image cache instance globally for exam use
    window.examImageCache = imageCache;

    sessionStorage.setItem("examLanguage", selectedLanguage);
    sessionStorage.setItem("examStarted", "true");
    navigate("/start-exam");
  };

  const handleResumeExam = async () => {
    try {
      const result = await examDispatch(checkExamResume()).unwrap();

      if (
        result?.canResume &&
        result.resumeData?.status &&
        Array.isArray(result.resumeData.data)
      ) {
        await logInstructionEvent("EXAM_RESUMED", {
          resume: true,
        });
        await examDispatch(resumeExam(result.resumeData.data)).unwrap();

        // Make cache available for resumed exam
        window.examImageCache = imageCache;

        sessionStorage.setItem("examStarted", "true");
        navigate("/start-exam");
      } else {
        toast.error("No resumable exam found");
      }
    } catch (error) {
      toast.error("Failed to resume exam");
    }
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      // Don't cleanup here as exam might still be running
      // Cleanup will happen after exam completion
    };
  }, []);

  useEffect(() => {
    if (examError) {
      toast.error(examError);
    }
  }, [examError]);

  const isLoading = authLoading || examLoading;

  if (!isAuthenticated && !authLoading) {
    return null;
  }


  return (
    <div className="fixed inset-0 bg-gray-100 flex items-center justify-center z-50">
      <Card className="w-full h-full shadow-2xl bg-white rounded-none border border-gray-200 overflow-y-auto">
        <CardHeader className="border-b border-gray-200 pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Left side - Candidate Info */}
            {student && (
              <div className="flex items-center gap-4">
                <img
                  src={profilePhoto || dummyPersonImg} // fallback image
                  alt={student.name}
                  className="w-16 h-16 lg:w-30 lg:h-30 rounded-full  border"
                />
                <div>
                  <p className="text-lg lg:text-xl font-semibold text-gray-800">
                    {student.name}
                  </p>
                  <p className="text-sm lg:text-base text-gray-600">
                    Roll No: {student.roll_number}
                  </p>
                </div>
              </div>
            )}

            {/* Center/Right side - Exam Title */}
            <div className="text-center lg:text-right">
              <h1 className="text-2xl lg:text-3xl font-bold text-blue-700">
                {isLoading ? "Loading..." : examName || "Exam Instructions"}
              </h1>


              {/* ✅ Exam Countdown Timer Display */}
              {examCountdown !== null && examCountdown > 0 && (
                <div className="mt-4 bg-orange-50 border-2 border-orange-300 rounded-lg p-4 shadow-md">
                  <p className="text-orange-800 font-semibold text-sm mb-2">
                    {examScheduleMessage}
                  </p>
                  <div className="text-4xl text-center font-bold text-orange-600 font-mono">
                    {formatCountdown(examCountdown)}
                    <p className="text-xs text-orange-700 mt-1">Time until exam starts</p>
                  </div>
                </div>
              )}
              <div className="mt-4 space-y-4">
                {/* Language Selection */}

                {!resumeAvailable && examLanguages?.length > 0 && !isLoading && instructions && (
                  <div className="flex  justify-center">
                    <div className="w-full max-w-md">
                      <label className="block text-sm font-medium text-gray-700  text-center">
                        Select Exam Language
                      </label>
                      <select
                        value={selectedLanguage}
                        onChange={handleLanguageChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Language</option>
                        {examLanguages
                          .filter((lang) => lang !== null && lang !== undefined && lang !== "")
                          .map((lang, idx) => (
                            <option key={idx} value={lang}>
                              {lang}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Exam Details */}
            <div className="flex flex-col justify-center text-gray-800">
              <p>
                <strong>Total Questions:</strong> {totalQuestions || "N/A"}
              </p>
              <p>
                <strong>Exam Duration:</strong> {examTimeLimit / 60 || "N/A"}{" "}
                minutes
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 lg:p-6 space-y-6 flex flex-col min-h-0">
          {/* Image Preloading Status */}
          {imagePreloadStatus.isPreloading && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-800">
                  Preparing exam images...
                </span>
                {imagePreloadStatus.progress && (
                  <span className="text-sm text-blue-600">
                    {imagePreloadStatus.progress.current}/
                    {imagePreloadStatus.progress.total}
                  </span>
                )}
              </div>
              {imagePreloadStatus.progress && (
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(imagePreloadStatus.progress.current /
                        imagePreloadStatus.progress.total) *
                        100
                        }%`,
                    }}
                  ></div>
                </div>
              )}
            </div>
          )}





          {/* Instructions */}
          <div className="bg-gray-50 p-4 lg:p-5 rounded-xl shadow-sm border border-gray-200 flex-1 flex flex-col min-h-0">
            {isLoading ? (
              <div className="text-center py-8 flex-1 flex items-center justify-center">
                <div>
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-3">Loading instructions...</p>
                </div>
              </div>
            ) : instructions ? (
              <>
                <h2 className="text-lg lg:text-xl font-semibold text-gray-700 mb-4">
                  Instructions
                </h2>
                <div className="flex-1 overflow-y-auto text-gray-600 whitespace-pre-line text-sm lg:text-base">
                  {instructions}
                </div>
              </>
            ) : (
              <div className="text-center flex-1 flex items-center justify-center">
                <div>
                  <p className="text-red-500 font-medium">
                    No instructions available.
                  </p>
                  <button
                    onClick={() => examDispatch(fetchExamInstructions())}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-xl shadow transition"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}
          </div>


          {/* Action Buttons - Always at Bottom Center */}
          {!isLoading && instructions && (
            <div className="fixed bottom-6 left-0 w-full flex justify-center items-center gap-4">
              {resumeAvailable ? (
                <button
                  onClick={handleResumeExam}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-xl shadow transition"
                >
                  Resume Exam
                </button>
              ) : (
                <button
                  onClick={handleStartExam}
                  disabled={
                    isLoading ||
                    !selectedLanguage ||
                    imagePreloadStatus.isPreloading
                    || !isExamStartAllowed
                  }
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 px-6 rounded-xl shadow transition"
                >
                  {imagePreloadStatus.isPreloading
                    ? "Loading Images..."
                    : isLoading
                      ? "Loading..."
                      : "Start Exam"}
                </button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      <ConfirmDialog
        isOpen={showModel}
        title="Start Exam"
        message={"Exam is now available! You can start exam by Clicking on the Start Button."}
        confirmText="OK"
        onConfirm={examStart}
        remove={true}
      // type="warning"
      />
    </div>
  );
}
