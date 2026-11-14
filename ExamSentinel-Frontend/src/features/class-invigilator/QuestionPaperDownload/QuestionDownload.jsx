import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import apiClient from "@/services/apiClient";
import { ExamCombobox } from "@/components/reusableComponets/select-exam-combox";
import { getExamList } from "@/services/ExamServices/examService";
import cloudClient from "@/services/cloudClient";

const schema = yup.object().shape({
    exam_id: yup.string().required("Exam is required").typeError("Exam is required"),
});

export default function QuestionDownload() {
    const [examList, setExamList] = useState([]);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [isDownloading, setIsDownloading] = useState(false);

    const {
        control,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            exam_id: "",
        },
    });

    // 🔹 Fetch center list
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

    // 🔹 Handle question paper download
    const onSubmit = async (data) => {
        const { exam_id } = data;
        setIsDownloading(true);
        setDownloadProgress(0);

        try {
            const res = await cloudClient.get(`api/download/question_image/${exam_id}`, {
                responseType: "blob", // important for file download
                onDownloadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percent = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        setDownloadProgress(percent);
                    }
                },
            });
            console.log(res);

            if (res.status === 200) {
                const zipBlob = new Blob([res.data], { type: "application/zip" });

                // 2️⃣ Send the ZIP blob to another API (without saving locally)
                const formData = new FormData();
                formData.append("zipfile", zipBlob, "exam-data.zip"); // filename is optional

                const processRes = await apiClient.post("api/download/question_image_extract", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });

                if (processRes.status === 200) {
                    toast.success("File processed successfully!");
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
            setIsDownloading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="p-6 space-y-8 bg-background shadow rounded-lg max-w-2xl mx-auto"
        >
            <h1 className="text-xl font-bold">Question Data Download</h1>

            <div className="grid grid-cols-[1fr_auto] items-end gap-2">
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


            </div>

            {/* Progress bar (only visible while downloading) */}
            {isDownloading && (
                <div className="space-y-2">
                    <Progress value={downloadProgress} className="w-full" />
                    <p className="text-sm text-muted-foreground">
                        Downloading... {downloadProgress}%
                    </p>
                </div>
            )}

            <Button type="submit" className="w-full" disabled={isDownloading}>
                {isDownloading ? "Downloading..." : "Get Question Paper Data"}
            </Button>
        </form>
    );
}
