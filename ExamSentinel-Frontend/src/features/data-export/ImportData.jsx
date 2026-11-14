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
import { FileDown } from "lucide-react";
import cloudClient from "@/services/cloudClient";

const schema = yup.object().shape({
    center_id: yup.string().required("Center is required").typeError("Center is required"),
});

export default function ImportData() {
    const [centerList, setCenterList] = useState([]);
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
        },
    });

    // ✅ Fetch dropdown data (Exam + Center)
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
        setIsDownloading(true);
        setDownloadProgress(0);

        try {
            // 1️⃣ this api call to the cloud server api to get the JSON file
            const res = await cloudClient.get(`api/download/${center_id}`, {
                responseType: "blob", // important to get the file
                onDownloadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setDownloadProgress(percent);
                    }
                },
            });


            if (res.status === 200) {
                const blob = res.data; // this is the JSON file as a Blob
                const fileName = res.headers["content-disposition"]
                    ? res.headers["content-disposition"].match(/filename="?(.+)"?/)[1]
                    : `centre_${center_id}_dump.json`;


                // 2️⃣ Send blob directly to second API
                const formData = new FormData();
                formData.append("file", blob, fileName); // append blob as 'file'

                const secondRes = await apiClient.post(`api/download/import/${fileName}`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data", // important for file upload
                    },
                    onUploadProgress: (progressEvent) => {
                        if (progressEvent.total) {
                            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        }
                    },
                });
                console.log(secondRes);


                if (secondRes.status === 200) {
                    toast.success(secondRes.data.message || "JSON file sent to second API successfully!");
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


    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="p-6 space-y-8 bg-background shadow rounded-lg max-w-2xl mx-auto"
        >
            <h1 className="text-xl font-bold flex gap-2 ">Import Data Wizard <FileDown /> </h1>

            <div className="grid grid-cols-1 gap-5">


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
                        Importing data... {downloadProgress}%
                    </p>
                </div>
            )}

            <Button type="submit" className="w-full" disabled={isDownloading}>
                {isDownloading ? "Importing..." : "Import Data"}
            </Button>
        </form>
    );
}
