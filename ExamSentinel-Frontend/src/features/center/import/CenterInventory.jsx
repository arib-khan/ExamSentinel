import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import BulkUpload from "./BulkUpload";

import apiClient from "@/services/apiClient";
import { Progress } from "@/components/ui/progress";
import { getCenterList, getCenterLists } from "@/services/CenterServices/centerServices";
import { CenterCombobox } from "@/components/reusableComponets/select-centre-combobox";
import { toast } from "sonner"; // ensure toast is imported

const schema = yup.object().shape({
    center_id: yup.string().required("Center is required"),
    file: yup
        .mixed()
        .required("File is required")
        .test("fileType", "Only CSV, XLSX, or XLS files are allowed", (value) => {
            if (!value) return false;
            const file = value instanceof File ? value : value[0];
            return [
                "text/csv",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "application/vnd.ms-excel",
            ].includes(file.type);
        }),
});

export default function CenterInventory() {
    const [centerList, setCenterList] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);

    const {
        control,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            center_id: "",
            file: null,
        },
    });

    // Fetch center list directly in useEffect
    useEffect(() => {
        (async () => {
            try {
                const res = await getCenterLists();
                const list = Array.isArray(res.data?.data) ? res.data.data : [];
                setCenterList(list);
            } catch (err) {
                console.error("Error fetching center list:", err);
                toast.error("Failed to load centers");
                setCenterList([]);
            }
        })();
    }, []);

    const onSubmit = async (data) => {
        const formData = new FormData();
        formData.append("center_id", data.center_id);
        formData.append("file", data.file instanceof File ? data.file : data.file[0]);

        setIsUploading(true);
        setUploadProgress(0);

        try {
            const res = await apiClient.post("api/extract/centerData", formData, {
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

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="p-6 space-y-8 bg-background shadow rounded-lg max-w-2xl mx-auto"
        >
            <h1 className="text-xl font-bold">Center Inventory Bulk Upload</h1>

            <div className="grid grid-cols-[1fr_auto] items-end gap-2">
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
                    {errors.center_id && (
                        <p className="text-sm text-red-500">{errors.center_id.message}</p>
                    )}
                </div>
            </div>

            {/* File Upload */}
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

            {isUploading && (
                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Uploading: {uploadProgress}%</p>
                    <Progress value={uploadProgress} />
                </div>
            )}

            <Button type="submit" className="w-full">
                Submit
            </Button>
        </form>
    );
}
