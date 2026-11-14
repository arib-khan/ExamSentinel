import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getCenterList } from "@/services/CenterServices/centerServices";
import { getExamList } from "@/services/ExamServices/examService";
import { CenterCombobox } from "@/components/reusableComponets/select-centre-combobox";
import { ExamCombobox } from "@/components/reusableComponets/select-exam-combox";
import { toast } from "sonner";
import apiClient from "@/services/apiClient";
import { FileDown, FileUp } from "lucide-react";

const schema = yup.object().shape({
    center_id: yup.string().required("Center is required").typeError("Center is required"),
    exam_id: yup.string().required("Exam is required").typeError("Exam is required"),
});

export default function ExportData() {
    const [centerList, setCenterList] = useState([]);
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
            center_id: "",
            exam_id: "",
        },
    });

    // ✅ Fetch dropdown data (Exam + Center)
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [examResponse, centreResponse] = await Promise.all([
                    getExamList(),
                    getCenterList(),
                ]);

                if (Array.isArray(examResponse.data?.data)) {
                    setExamList(examResponse.data.data);
                }
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

    // 🔹 Handle SQL file download
    const onSubmit = async (data) => {
        setIsDownloading(true);
        setDownloadProgress(0);

        try {
            const res = await apiClient.post("api/extract/centerData", data, {
                responseType: "blob", // important for binary download
                onDownloadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setDownloadProgress(percent);
                    }
                },
            });

            if (res.status === 200) {
                // ✅ Create SQL file blob
                const blob = new Blob([res.data], { type: "application/sql" });

                // ✅ Try to get dynamic filename from headers (optional)
                const contentDisposition = res.headers["content-disposition"];
                let fileName = "exam-center-data.sql";
                if (contentDisposition) {
                    const match = contentDisposition.match(/filename="?(.+)"?/);
                    if (match && match[1]) fileName = match[1];
                }

                // ✅ Download the file
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", fileName);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);

                toast.success("SQL file downloaded successfully!");
            } else {
                toast.error("Download failed. Please try again.");
            }
        } catch (error) {
            console.error("Download error:", error);
            toast.error("An error occurred during the download.");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="p-6 space-y-8 bg-background shadow rounded-lg max-w-2xl mx-auto"
        >
            <h1 className="text-xl font-bold flex gap-2">Export Data Wizard  (not in used)<FileUp /> </h1>

            <div className="grid grid-cols-1 gap-5">
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
            </div>

            {/* Progress bar (visible while downloading) */}
            {isDownloading && (
                <div className="space-y-2">
                    <Progress value={downloadProgress} className="w-full" />
                    <p className="text-sm text-muted-foreground">
                        Generating SQL file... {downloadProgress}%
                    </p>
                </div>
            )}

            <Button type="submit" className="w-full" disabled={isDownloading}>
                {isDownloading ? "Generating..." : "Export Data"}
            </Button>
        </form>
    );
}
