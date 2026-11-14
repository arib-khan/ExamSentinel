// import { useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { useExam, useAuth } from "@/hooks/redux";
// import { Button } from "@/components/ui/button";
// import { useExamAuditLogger } from "@/hooks/auditLogger/useExamAuditLogger";

// export default function ExamEnd() {
//     const { student } = useAuth();
//     const { isExamSubmitted, isCacheCleanedUp, examName } = useExam();
//     const { logExamEvent } = useExamAuditLogger();
//     const navigate = useNavigate();

//     // Redirect if exam was not submitted
//     useEffect(() => {
//         if (!isExamSubmitted) {
//             navigate("/exam");
//         }
//     }, [isExamSubmitted, navigate]);

//     // Log final event once exam is submitted & cleanup done
//     useEffect(() => {
//         if (isExamSubmitted) {
//             logExamEvent("EXAM_COMPLETED", {
//                 studentId: student?.id,
//                 studentName: student?.name,
//                 examName,
//                 cleanupStatus: isCacheCleanedUp ? "SUCCESS" : "FAILED",
//             });
//         }
//     }, [isExamSubmitted, isCacheCleanedUp, examName, student, logExamEvent]);

//     if (!isExamSubmitted) {
//         return <div className="text-center text-gray-500">Loading...</div>;
//     }

//     return (
//         <div className="min-h-screen flex items-center justify-center">
//             <div className="max-w-lg w-full mx-auto p-8 bg-white shadow-lg rounded-2xl text-center">
//                 <h1 className="text-3xl font-bold text-green-700 mb-4">
//                     🎉 Thank You!
//                 </h1>
//                 <p className="text-lg text-gray-700 mb-6">
//                     You have successfully completed the exam <br />
//                     <span className="font-semibold">{examName}</span>.
//                 </p>
//                 <Button
//                     className="cursor-pointer"
//                     onClick={() => {
//                         logExamEvent("NAVIGATE_HOME_FROM_THANKYOU", {
//                             studentId: student?.id,
//                             studentName: student?.name,
//                         });
//                         navigate("/");
//                     }}
//                 >
//                     Back to Home
//                 </Button>
//             </div>
//         </div>
//     );
// }
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useExam, useAuth } from "@/hooks/redux";
import { useExamAuditLogger } from "@/hooks/auditLogger/useExamAuditLogger";

export default function ExamEnd() {
    const { student } = useAuth();
    const { isExamSubmitted, isCacheCleanedUp, examName, resetExam } = useExam();
    const { logExamEvent } = useExamAuditLogger();
    const navigate = useNavigate();

    // 🚨 Redirect if exam was not submitted
    // useEffect(() => {
    //     if (!isExamSubmitted) {
    //         navigate("/");
    //     }
    // }, [isExamSubmitted, navigate]);

    // ✅ Log only, don't reset yet
    useEffect(() => {
        if (isExamSubmitted) {
            logExamEvent("EXAM_COMPLETED", {
                studentId: student?.id,
                studentName: student?.name,
                examName,
                cleanupStatus: isCacheCleanedUp ? "SUCCESS" : "FAILED",
            });

            // Optional cleanup (not reset)
            sessionStorage.removeItem("examLanguage");
            sessionStorage.clear();
            resetExam(); // 
        }
    }, [isExamSubmitted, isCacheCleanedUp, examName, student, logExamEvent]);

    if (!isExamSubmitted) {
        return <div className="text-center text-gray-500">Loading...</div>;
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="max-w-lg w-full mx-auto p-8 bg-white shadow-lg rounded-2xl text-center">
                <h1 className="text-3xl font-bold text-green-700 mb-4">
                    🎉 Thank You!
                </h1>
                <p className="text-lg text-gray-700 mb-6">
                    You have successfully completed the exam <br />
                    <span className="font-semibold">{examName}</span>.
                </p>
            </div>
        </div>
    );
}
