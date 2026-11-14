import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getCenterList } from "@/services/CenterServices/centerServices";
import { CenterCombobox } from "@/components/reusableComponets/select-centre-combobox";
import { toast } from "sonner";
import apiClient from "@/services/apiClient";
import { FileDown, CheckCircle2, Download } from "lucide-react";
import cloudClient from "@/services/cloudClient";
import { ExamCombobox } from "@/components/reusableComponets/select-exam-combox";
import { getExamList } from "@/services/ExamServices/examService";

// Schema for Import Data (Step 1)
const importSchema = yup.object().shape({
    center_id: yup.string().required("Center is required").typeError("Center is required"),
});

// Schema for Download Images (Step 2)
const downloadSchema = yup.object().shape({
    exam_id: yup.string().required("Exam is required").typeError("Exam is required"),
});

// Step 1: Import Data Component
function ImportDataStep({ onComplete }) {
    const [centerList, setCenterList] = useState([]);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [isDownloading, setIsDownloading] = useState(false);

    const {
        control,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(importSchema),
        defaultValues: {
            center_id: "",
        },
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [centreResponse] = await Promise.all([
                    getCenterList(),
                ]);

                if (Array.isArray(centreResponse.data?.data)) {
                    setCenterList(centreResponse.data.data);
                }
            } catch (err) {
                console.error("Error fetching lists:", err);
                toast.error("Failed to load data.");
            }
        };
        fetchData();
    }, []);

    const onSubmit = async (data) => {
        const { center_id } = data;
        // store center_id in session storage
        sessionStorage.setItem("stored_center_id", center_id);
        setIsDownloading(true);
        setDownloadProgress(0);

        try {
            const res = await cloudClient.get(`api/download/${center_id}`, {
                responseType: "blob",
                onDownloadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setDownloadProgress(percent);
                    }
                },
            });

            if (res.status === 200) {
                const blob = res.data;
                const fileName = res.headers["content-disposition"]
                    ? res.headers["content-disposition"].match(/filename="?(.+)"?/)[1]
                    : `centre_${center_id}_dump.json`;

                const formData = new FormData();
                formData.append("file", blob, fileName);

                const secondRes = await apiClient.post(`api/download/import/${fileName}`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    onUploadProgress: (progressEvent) => {
                        if (progressEvent.total) {
                            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        }
                    },
                });

                if (secondRes.status === 200) {
                    toast.success(secondRes.data.message || "JSON file sent to second API successfully!");
                    onComplete(); // Move to next step
                } else {
                    toast.error(secondRes.data.message || "Failed to send JSON file to second API.");
                }
            } else {
                toast.error("Failed to fetch JSON file from first API.");
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("An error occurred during the process.");
        } finally {
            setIsDownloading(false);
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        handleSubmit(onSubmit)();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    1
                </div>
                <h2 className="text-lg font-semibold">Import Data</h2>
            </div>

            <div className="space-y-6">
                <div>
                    <Label className="mb-1">Select Center</Label>
                    <Controller
                        name="center_id"
                        control={control}
                        render={({ field }) => (
                            <CenterCombobox
                                centers={centerList}
                                selectedId={field.value}
                                setCentreId={(val) => setValue("center_id", val)}
                            />
                        )}
                    />
                    {errors.center_id && <p className="text-sm text-red-500">{errors.center_id.message}</p>}
                </div>

                {isDownloading && (
                    <div className="space-y-2">
                        <Progress value={downloadProgress} className="w-full" />
                        <p className="text-sm text-muted-foreground">
                            Importing data... {downloadProgress}%
                        </p>
                    </div>
                )}

                <Button onClick={handleFormSubmit} className="w-full" disabled={isDownloading}>
                    {isDownloading ? "Importing..." : "Import Data"}
                </Button>
            </div>
        </div>
    );
}

// Step 2: Download Images Parent Component
function DownloadImagesStep() {
    const [examList, setExamList] = useState([]);
    const [questionProgress, setQuestionProgress] = useState(0);
    const [studentProgress, setStudentProgress] = useState(0);
    const [isQuestionDownloading, setIsQuestionDownloading] = useState(false);
    const [isStudentDownloading, setIsStudentDownloading] = useState(false);
    const [questionCompleted, setQuestionCompleted] = useState(false);
    const [studentCompleted, setStudentCompleted] = useState(false);

    const {
        control: questionControl,
        handleSubmit: handleQuestionSubmit,
        setValue: setQuestionValue,
        formState: { errors: questionErrors },
    } = useForm({
        resolver: yupResolver(downloadSchema),
        defaultValues: { exam_id: "" },
    });

    const {
        control: studentControl,
        handleSubmit: handleStudentSubmit,
        setValue: setStudentValue,
        formState: { errors: studentErrors },
    } = useForm({
        resolver: yupResolver(downloadSchema),
        defaultValues: { exam_id: "" },
    });

    useEffect(() => {
        (async () => {
            try {
                const res = await getExamList();
                const list = Array.isArray(res.data?.data) ? res.data.data : [];
                setExamList(list);
            } catch (err) {
                console.error("Error fetching exam list:", err);
                toast.error("Failed to load exams");
                setExamList([]);
            }
        })();
    }, []);

    const onQuestionSubmit = async (data) => {
        const { exam_id } = data;
        setIsQuestionDownloading(true);
        setQuestionProgress(0);

        try {
            const res = await cloudClient.get(`api/download/question_image/${exam_id}`, {
                responseType: "blob",
                onDownloadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percent = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        setQuestionProgress(percent);
                    }
                },
            });

            if (res.status === 200) {
                const zipBlob = new Blob([res.data], { type: "application/zip" });
                const formData = new FormData();
                formData.append("zipfile", zipBlob, "exam-data.zip");

                const processRes = await apiClient.post("api/download/question_image_extract", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });

                if (processRes.status === 200) {
                    toast.success("Question images processed successfully!");
                    setQuestionCompleted(true);
                } else {
                    toast.error("Processing failed. Please try again.");
                }
            } else {
                toast.error("Download failed. Please try again.");
            }
        } catch (error) {
            toast.error("An error occurred during download or processing.");
            console.error(error);
        } finally {
            setIsQuestionDownloading(false);
        }
    };

    const onStudentSubmit = async (data) => {
        const { exam_id } = data;
        setIsStudentDownloading(true);
        setStudentProgress(0);

        try {
            const zipRes = await cloudClient.get(`api/download/student_image/${exam_id}`, {
                responseType: "blob",
                onDownloadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percent = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        setStudentProgress(percent);
                    }
                },
            });

            if (zipRes.status === 200) {
                const zipBlob = new Blob([zipRes.data], { type: "application/zip" });
                const formData = new FormData();
                formData.append("zipfile", zipBlob, "exam-data.zip");

                const processRes = await apiClient.post(`api/download/students_image_extract/${exam_id}`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });

                if (processRes.status === 200) {
                    toast.success("Student images processed successfully!");
                    setStudentCompleted(true);
                } else {
                    toast.error("Processing failed. Please try again.");
                }
            } else {
                toast.error("Download failed. Please try again.");
            }
        } catch (error) {
            toast.error("An error occurred during download or processing.");
            console.error(error);
        } finally {
            setIsStudentDownloading(false);
        }
    };

    const handleQuestionFormSubmit = (e) => {
        e.preventDefault();
        handleQuestionSubmit(onQuestionSubmit)();
    };

    const handleStudentFormSubmit = (e) => {
        e.preventDefault();
        handleStudentSubmit(onStudentSubmit)();
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    2
                </div>
                <h2 className="text-lg font-semibold">Download Images</h2>
            </div>

            {/* Question Images */}
            <div className="p-4 border rounded-lg space-y-4 bg-muted/30">
                <div className="flex items-center justify-between">
                    <h3 className="font-medium flex items-center gap-2">
                        Question Images
                        {questionCompleted && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                    </h3>
                </div>

                <div className="space-y-4">
                    <div>
                        <Label className="mb-1">Select Exam</Label>
                        <Controller
                            name="exam_id"
                            control={questionControl}
                            render={({ field }) => (
                                <ExamCombobox
                                    exams={examList}
                                    selectedId={field.value}
                                    setExamId={(val) => setQuestionValue("exam_id", val)}
                                />
                            )}
                        />
                        {questionErrors.exam_id && (
                            <p className="text-sm text-red-500">{questionErrors.exam_id.message}</p>
                        )}
                    </div>

                    {isQuestionDownloading && (
                        <div className="space-y-2">
                            <Progress value={questionProgress} className="w-full" />
                            <p className="text-sm text-muted-foreground">
                                Downloading... {questionProgress}%
                            </p>
                        </div>
                    )}

                    <Button
                        onClick={handleQuestionFormSubmit}
                        className="w-full"
                        disabled={isQuestionDownloading || questionCompleted}
                    >
                        {isQuestionDownloading
                            ? "Downloading..."
                            : questionCompleted
                                ? "Completed"
                                : "Get Question Images"}
                    </Button>
                </div>
            </div>

            {/* Student Images */}
            <div className="p-4 border rounded-lg space-y-4 bg-muted/30">
                <div className="flex items-center justify-between">
                    <h3 className="font-medium flex items-center gap-2">
                        Student Images
                        {studentCompleted && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                    </h3>
                </div>

                <div className="space-y-4">
                    <div>
                        <Label className="mb-1">Select Exam</Label>
                        <Controller
                            name="exam_id"
                            control={studentControl}
                            render={({ field }) => (
                                <ExamCombobox
                                    exams={examList}
                                    selectedId={field.value}
                                    setExamId={(val) => setStudentValue("exam_id", val)}
                                />
                            )}
                        />
                        {studentErrors.exam_id && (
                            <p className="text-sm text-red-500">{studentErrors.exam_id.message}</p>
                        )}
                    </div>

                    {isStudentDownloading && (
                        <div className="space-y-2">
                            <Progress value={studentProgress} className="w-full" />
                            <p className="text-sm text-muted-foreground">
                                Downloading... {studentProgress}%
                            </p>
                        </div>
                    )}

                    <Button
                        onClick={handleStudentFormSubmit}
                        className="w-full"
                        disabled={isStudentDownloading || studentCompleted}
                    >
                        {isStudentDownloading
                            ? "Downloading..."
                            : studentCompleted
                                ? "Completed"
                                : "Get Student Images"}
                    </Button>
                </div>
            </div>
        </div>
    );
}

// Main Parent Component
export default function DataImportWizard() {
    const [currentStep, setCurrentStep] = useState(1);

    return (
        <div className="p-6 space-y-8 bg-background shadow rounded-lg max-w-2xl mx-auto">
            <div className="space-y-2">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    Data Import Wizard <FileDown />
                </h1>
                <p className="text-sm text-muted-foreground">
                    Complete the import process and download required images
                </p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 flex-1">
                    <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${currentStep >= 1
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                            }`}
                    >
                        {currentStep > 1 ? <CheckCircle2 className="w-5 h-5" /> : "1"}
                    </div>
                    <span className="text-sm font-medium">Import Data</span>
                </div>
                <div className="h-px flex-1 bg-border" />
                <div className="flex items-center gap-2 flex-1">
                    <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${currentStep >= 2
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                            }`}
                    >
                        2
                    </div>
                    <span className="text-sm font-medium">Download Images</span>
                </div>
            </div>

            {/* Step Content */}
            <div className="border-t pt-6">
                {currentStep === 1 && <ImportDataStep onComplete={() => setCurrentStep(2)} />}
                {currentStep === 2 && <DownloadImagesStep />}
            </div>

            {/* Navigation */}
            {currentStep === 2 && (
                <div className="border-t pt-4">
                    <Button
                        variant="outline"
                        onClick={() => setCurrentStep(1)}
                        className="w-full"
                    >
                        Back to Import Data
                    </Button>
                </div>
            )}
        </div>
    );
}