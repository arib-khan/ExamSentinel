import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ExamCombobox } from "@/components/reusableComponets/select-exam-combox";
import BulkUpload from "./BulkUpload";
import { getExamList } from "@/services/ExamServices/examService";
import { toast } from "sonner";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import ExamForm from "../../exams/create/CreateExam"; // path to your existing ExamForm
import apiClient from "@/services/apiClient";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import ZipFileUpload from "./ImageZipUpload";

const schema = yup.object().shape({
    exam_id: yup.string().required("Exam is required"),
    file: yup
        .mixed()
        .required("File is required")
        .test("fileType", "Only CSV, XLSX, or XLS files are allowed", (value) =>
            value
                ? [
                    "text/csv",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    "application/vnd.ms-excel",
                ].includes(value.type)
                : false
        ),
    zipFile: yup
        .mixed()
        .nullable()
        .test("fileType", "Only ZIP files are allowed", (value) =>
            value ? value.name.endsWith(".zip") : true
        ),
});

export default function StudentBulkMaster() {
    const navigate = useNavigate();
    const [examList, setExamList] = useState([]);
    const [openCreateExam, setOpenCreateExam] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [isZipUploading, setIsZipUploading] = useState(false);


    const {
        control,
        handleSubmit,
        setValue,
        getValues,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            exam_id: "",
            file: null,
            zipFile: null,
        },
    });

    // ✅ Fetch Exam List
    const fetchExamList = async () => {
        try {
            const examResponse = await getExamList();
            if (Array.isArray(examResponse.data?.data)) {
                setExamList(examResponse.data.data);
            }
        } catch (err) {
            console.error("Error fetching exam list:", err);
            toast.error("Failed to load exams");
        }
    };

    useEffect(() => {
        fetchExamList();
    }, []);



    // ✅ Upload Excel file only
    const handleExcelUpload = async () => {
        const { exam_id, file } = getValues();

        if (!exam_id) return toast.error("Please select an exam first!");
        if (!file) return toast.error("Please select an Excel file to upload!");

        setIsUploading(true);
        setUploadProgress(0);

        try {
            const formData = new FormData();
            formData.append("student_exam_id", exam_id);
            formData.append("file", file);

            const res = await apiClient.post("api/extract/student_data", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                onUploadProgress: (progressEvent) => {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percent);
                },
            });

            if (res.status === 200 || res.status === 201) {
                toast.success(res.data.msg || "File uploaded successfully!");
            } else {
                toast.error(res.data.msg || "Upload failed. Please try again.");
            }
        } catch (error) {
            toast.error("An error occurred during upload.");
            console.error(error);
        } finally {
            setIsUploading(false);
        }
    };

    // ✅ Upload ZIP file separately (optional)
    const handleZipUpload = async () => {
        const { exam_id, zipFile } = getValues();

        if (!exam_id) return toast.error("Please select an exam first!");
        if (!zipFile) return toast.error("Please select a ZIP file before uploading!");

        setIsZipUploading(true);
        setUploadProgress(0);

        try {
            const formData = new FormData();
            formData.append("exam_id", exam_id);
            formData.append("zipfile", zipFile);

            const res = await apiClient.post(`api/extract/students_image_zip/${exam_id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
                onUploadProgress: (event) => {
                    const percent = Math.round((event.loaded * 100) / event.total);
                    setUploadProgress(percent);
                },
            });

            if (res.data.status) {
                toast.success(res.data.msg || "ZIP uploaded successfully!");
            } else {
                toast.error(res.data.msg || "ZIP upload failed!");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error uploading ZIP file!");
        } finally {
            setIsZipUploading(false);
        }
    };



    const handleExamCreated = async () => {
        await fetchExamList();
        toast.success("New Exam created");
        setOpenCreateExam(false);
    };

    return (
        <div
            className="p-6 space-y-8 bg-background shadow rounded-lg max-w-2xl mx-auto"
        >
            <h1 className="text-xl font-bold">Students & Image Bulk Upload</h1>

            {/* ✅ Exam Name */}
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
                    {errors.exam_id && (
                        <p className="text-sm text-red-500">{errors.exam_id.message}</p>
                    )}
                </div>

                <Dialog open={openCreateExam} onOpenChange={setOpenCreateExam}>
                    <DialogTrigger asChild>
                        <Button type="button" variant="outline" className="h-10 mt-5">
                            + New
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                        <DialogHeader>
                            <DialogTitle>Create New Exam</DialogTitle>
                        </DialogHeader>
                        <ExamForm onSuccess={handleExamCreated} />
                    </DialogContent>
                </Dialog>
            </div>



            {/* ✅ File Upload */}
            <div className="flex  flex-col md:flex-row items-center gap-4">
                <div className="flex-1 ">
                    <Controller
                        name="file"
                        control={control}
                        render={({ field }) => (
                            <BulkUpload
                                selectedFile={field.value}
                                onFileSelect={field.onChange}
                                error={errors.file?.message}
                                showCard={true}
                            />
                        )}
                    />
                </div>
                <Button
                    type="button"
                    onClick={handleExcelUpload}
                    disabled={isUploading}
                >
                    {isUploading ? "Uploading..." : "Upload Excel File"}
                </Button>
            </div>

            {/* ✅ ZIP File Upload (Optional) */}
            <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="flex-1">
                    <Controller
                        name="zipFile"
                        control={control}
                        render={({ field }) => (
                            <ZipFileUpload
                                selectedFile={field.value}
                                onFileSelect={field.onChange}
                                error={errors.zipFile?.message}
                                showCard={true}
                            />
                        )}
                    />
                </div>

                <Button
                    type="button"
                    onClick={handleZipUpload}
                    disabled={isZipUploading}
                >
                    {isZipUploading ? "Uploading..." : "Upload ZIP File "}
                </Button>
            </div>

            {isZipUploading && (
                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                        Uploading: {uploadProgress}%
                    </p>
                    <Progress value={uploadProgress} />
                </div>
            )}


            <Button className="w-full"
                variant="secondary"
                type="button"
                onClick={() => navigate(-1)}
            >
                Back
            </Button>
        </div>
    );
}
