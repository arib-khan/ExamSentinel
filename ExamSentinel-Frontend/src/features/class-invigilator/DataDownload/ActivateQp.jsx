// import React, { useEffect, useState } from "react";
// import { useForm, Controller } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import { getCenterList } from "@/services/CenterServices/centerServices";
// import { toast } from "sonner";
// import * as yup from "yup";
// import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";
// import { Progress } from "@/components/ui/progress";
// import { CenterCombobox } from "@/components/reusableComponets/select-centre-combobox";
// import { ExamCombobox } from "@/components/reusableComponets/select-exam-combox";
// import { getExamList } from "@/services/ExamServices/examService";
// import { Input } from "@/components/ui/input";
// import apiClient from "@/services/apiClient";

// const importSchema = yup.object().shape({
//     exam_id: yup.string().required("Exam is required").typeError("Exam is required"),
//     otp: yup.string().required("OTP/Password is required").typeError("OTP/Password is required")
//         .max(6, "OTP/Password must be at most 6 characters"),
// });


// export default function ActivateQp() {
//     const [examList, setExamList] = useState([]);
//     const [downloadProgress, setDownloadProgress] = useState(0);
//     const [isDownloading, setIsDownloading] = useState(false);

//     const {
//         control,
//         handleSubmit,
//         setValue,
//         register,
//         formState: { errors },
//     } = useForm({
//         resolver: yupResolver(importSchema),
//         defaultValues: {
//             exam_id: "",
//         },
//     });

//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 const examResponse = await getExamList();

//                 if (Array.isArray(examResponse.data?.data)) {
//                     setExamList(examResponse.data.data);
//                 }
//             } catch (err) {
//                 console.error("Error fetching lists:", err);
//                 toast.error("Failed to load data.");
//             }
//         };
//         fetchData();
//     }, []);



//     const onSubmit = async (data) => {
//         const centerId = sessionStorage.getItem("center_id");
//         const payload = {
//             exam_id: data.exam_id,
//             otp: data.otp,
//             center_id: centerId || 6
//         }
//         setIsDownloading(true);
//         setDownloadProgress(0);

//         try {
//             // const res = await cloudClient.post(`api/download/Activate_questions`, payload, {
//             const res = await apiClient.post(`api/download/Activate_questions`, payload, {
//                 // responseType: "blob",
//                 onDownloadProgress: (progressEvent) => {
//                     if (progressEvent.total) {
//                         const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
//                         setDownloadProgress(percent);
//                     }
//                 },
//             });

//             console.log(res, "api");


//             if (res.status === 200) {
//                 const blob = res.data;
//                 const fileName = res.headers["content-disposition"]
//                     ? res.headers["content-disposition"].match(/filename="?(.+)"?/)[1]
//                     : `questions_${data.exam_id}.json`;

//                 const formData = new FormData();
//                 formData.append("file", blob, fileName);

//                 const secondRes = await apiClient.post(`api/download/import/${fileName}`, formData, {
//                     headers: {
//                         "Content-Type": "multipart/form-data",
//                     },
//                     onUploadProgress: (progressEvent) => {
//                         if (progressEvent.total) {
//                             const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
//                         }
//                     },
//                 });

//                 if (secondRes.status === 200) {
//                     toast.success(secondRes.data.message || "JSON file sent to second API successfully!");
//                 } else {
//                     toast.error(secondRes.data.message || "Failed to send JSON file to second API.");
//                 }
//             } else {
//                 toast.error("Failed to fetch JSON file from first API.");
//             }
//         } catch (error) {
//             console.error("Error:", error);
//             toast.error("An error occurred during the process.");
//         } finally {
//             setIsDownloading(false);
//         }
//     };

//     const handleFormSubmit = (e) => {
//         e.preventDefault();
//         handleSubmit(onSubmit)();
//     };

//     return (
//         <div className=" bg-background shadow rounded-lg max-w-2xl mx-auto p-6">
//             <div className="flex items-center gap-2">
//                 <h2 className="text-lg font-semibold mb-4">Activate Question Paper</h2>
//             </div>

//             <div className="space-y-6">
//                 <div>
//                     <Label className="mb-1">Select Exam</Label>
//                     <Controller
//                         name="exam_id"
//                         control={control}
//                         render={({ field }) => (
//                             <ExamCombobox
//                                 exams={examList}
//                                 selectedId={field.value}
//                                 setExamId={(val) => setValue("exam_id", val)}

//                             />
//                         )}
//                     />
//                     {errors.exam_id && <p className="text-sm text-red-500">{errors.exam_id.message}</p>}
//                 </div>

//                 <div>
//                     <Label className="mb-1">OTP/Password</Label>
//                     <Input
//                         type="password"
//                         {...register("otp")}
//                         title="Used only one time password" // simple tooltip
//                     />
//                     <p className="text-sm text-red-500">{errors.otp?.message}</p>
//                 </div>

//                 {isDownloading && (
//                     <div className="space-y-2">
//                         <Progress value={downloadProgress} className="w-full" />
//                         <p className="text-sm text-muted-foreground">
//                             Importing data... {downloadProgress}%
//                         </p>
//                     </div>
//                 )}

//                 <Button onClick={handleFormSubmit} className="w-full" disabled={isDownloading}>
//                     {isDownloading ? "Activating..." : "Activate Question Paper"}
//                 </Button>
//             </div>
//         </div>
//     );
// }
import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { getCenterList } from "@/services/CenterServices/centerServices";
import { toast } from "sonner";
import * as yup from "yup";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CenterCombobox } from "@/components/reusableComponets/select-centre-combobox";
import { ExamCombobox } from "@/components/reusableComponets/select-exam-combox";
import { getExamList } from "@/services/ExamServices/examService";
import { Input } from "@/components/ui/input";
import apiClient from "@/services/apiClient";
import { MessageCircleQuestion } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import cloudClient from "@/services/cloudClient";


const importSchema = yup.object().shape({
    exam_id: yup.string().required("Exam is required").typeError("Exam is required"),
    otp: yup.string().required("OTP/Password is required").typeError("OTP/Password is required")
        .max(6, "OTP/Password must be at most 6 characters"),
});

export default function ActivateQp() {
    const [examList, setExamList] = useState([]);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [isDownloading, setIsDownloading] = useState(false);

    const {
        control,
        handleSubmit,
        setValue,
        register,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(importSchema),
        defaultValues: {
            exam_id: "",
        },
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const examResponse = await getExamList();

                if (Array.isArray(examResponse.data?.data)) {
                    setExamList(examResponse.data.data);
                }
            } catch (err) {
                console.error("Error fetching lists:", err);
                toast.error("Failed to load data.");
            }
        };
        fetchData();
    }, []);

    const onSubmit = async (data) => {
        const centerId = sessionStorage.getItem("center_id");
        const payload = {
            exam_id: data.exam_id,
            otp: data.otp,
            center_id: centerId || 6
        };

        setIsDownloading(true);
        setDownloadProgress(0);

        try {
            // Request with blob response type
            const res = await cloudClient.post(`api/download/Activate_questions`, payload, {
                responseType: "blob",
                onDownloadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setDownloadProgress(percent);
                    }
                },
            });

            // Check content-type to determine if it's JSON error or actual data
            const contentType = res.headers["content-type"] || res.headers["Content-Type"];

            if (contentType && contentType.includes("application/json")) {
                // It's a JSON response (likely an error)
                const text = await res.data.text();
                const jsonResponse = JSON.parse(text);

                if (jsonResponse.status === false) {
                    toast.error(jsonResponse.msg || "Failed to activate question paper.");
                    return;
                }
            }

            // If we reach here, it's actual data (blob)
            if (res.status === 200 && res.data.size > 0) {
                const blob = res.data;

                // Extract filename from content-disposition header
                const contentDisposition = res.headers["content-disposition"];
                const fileName = contentDisposition
                    ? contentDisposition.match(/filename="?(.+)"?/)?.[1] || `questions_${data.exam_id}.json`
                    : `questions_${data.exam_id}.json`;

                // Create FormData and send to import API
                const formData = new FormData();
                formData.append("file", blob, fileName);

                const secondRes = await apiClient.post(`api/download/import/${fileName}`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    onUploadProgress: (progressEvent) => {
                        if (progressEvent.total) {
                            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                            setDownloadProgress(percent);
                        }
                    },
                });

                if (secondRes.status === 200) {
                    toast.success(secondRes.data.message || "Question paper activated successfully!");
                } else {
                    toast.error(secondRes.data.message || "Failed to import question paper.");
                }
            } else {
                toast.error("No data received from server.");
            }
        } catch (error) {
            console.error("Error:", error);

            // Handle axios error responses
            if (error.response) {
                // Try to parse error message from blob if it's JSON
                if (error.response.data instanceof Blob) {
                    try {
                        const text = await error.response.data.text();
                        const errorData = JSON.parse(text);
                        toast.error(errorData.msg || errorData.message || "An error occurred.");
                    } catch (e) {
                        toast.error("An error occurred during activation.");
                    }
                } else {
                    toast.error(error.response.data?.msg || error.response.data?.message || "An error occurred.");
                }
            } else if (error.request) {
                toast.error("No response from server. Please check your connection.");
            } else {
                toast.error("An error occurred during the process.");
            }
        } finally {
            setIsDownloading(false);
            setDownloadProgress(0);
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        handleSubmit(onSubmit)();
    };

    return (
        <div className="bg-background shadow rounded-lg max-w-2xl mx-auto p-6">
            <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold">Activate Question Paper</h2>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <MessageCircleQuestion className="w-5 h-5 text-muted-foreground cursor-pointer" />
                        </TooltipTrigger>

                        <TooltipContent className="max-w-xs">
                            <p>The question paper can only be activated within 15 minutes of the exam start time.</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            <div className="space-y-6">
                <div>
                    <Label className="mb-1">Select Exam</Label>
                    <Controller
                        name="exam_id"
                        control={control}
                        render={({ field }) => (
                            <ExamCombobox
                                exams={examList}
                                selectedId={field.value}
                                setExamId={(val) => setValue("exam_id", val)}
                            />
                        )}
                    />
                    {errors.exam_id && <p className="text-sm text-red-500">{errors.exam_id.message}</p>}
                </div>

                <div>
                    <Label className="mb-1">OTP (One Time Password)</Label>
                    <Input
                        type="text"
                        {...register("otp")}
                        title="Used only one time password"
                    />
                    {errors.otp && <p className="text-sm text-red-500">{errors.otp.message}</p>}
                </div>

                {isDownloading && (
                    <div className="space-y-2">
                        <Progress value={downloadProgress} className="w-full" />
                        <p className="text-sm text-muted-foreground">
                            Processing... {downloadProgress}%
                        </p>
                    </div>
                )}

                <Button onClick={handleFormSubmit} className="w-full" disabled={isDownloading}>
                    {isDownloading ? "Activating..." : "Activate Question Paper"}
                </Button>
            </div>
        </div>
    );
}