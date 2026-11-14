// import React, { useState } from "react";
// import { Download, FileText } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";

// const Reports = () => {
//     const [reportType, setReportType] = useState("exam-summary");
//     const [fromDate, setFromDate] = useState("");
//     const [toDate, setToDate] = useState("");

//     const handleDownload = () => {
//         // Replace with your actual download logic (API call or file generation)
//         console.log("Downloading:", { reportType, fromDate, toDate });

//         // Example: window.open(downloadUrl)
//     };

//     return (
//         <Card className="w-full max-w-3xl mx-auto py-8">
//             <CardHeader>
//                 <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
//                     <FileText className="w-5 h-5 text-blue-500" />
//                     Download Reports
//                 </CardTitle>
//             </CardHeader>
//             <CardContent>
//                 <div className="grid gap-4 mb-4">
//                     <div className="w-full">
//                         <Label className="mb-1">Report Type</Label>
//                         <Select value={reportType} onValueChange={setReportType}>
//                             <SelectTrigger className="w-full">
//                                 <SelectValue placeholder="Select report type" />
//                             </SelectTrigger>
//                             <SelectContent>
//                                 <SelectItem value="exam-summary">Exam Summary</SelectItem>
//                                 <SelectItem value="student-performance">Student Performance</SelectItem>
//                                 <SelectItem value="center-wise-report">Center-wise Report</SelectItem>
//                             </SelectContent>
//                         </Select>
//                     </div>

//                     <div className="grid md:grid-cols-2 gap-2">
//                         {/* From Date */}
//                         <div>
//                             <Label className="mb-1">From Date</Label>
//                             <Input
//                                 type="date"
//                                 value={fromDate}
//                                 onChange={(e) => setFromDate(e.target.value)}
//                             />
//                         </div>

//                         {/* To Date */}
//                         <div>
//                             <Label className="mb-1">To Date</Label>
//                             <Input
//                                 type="date"
//                                 value={toDate}
//                                 onChange={(e) => setToDate(e.target.value)}
//                             />
//                         </div>
//                     </div>
//                 </div>


//                 {/* Download Button */}
//                 <div className="flex items-end">
//                     <Button
//                         className="w-full gap-2 cursor-pointer"
//                         onClick={handleDownload}
//                         disabled={!fromDate || !toDate}
//                     >
//                         <Download className="w-4 h-4" />
//                         Download Report
//                     </Button>
//                 </div>

//             </CardContent>
//         </Card>
//     );
// };

// export default Reports;

import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ExamCombobox } from "@/components/reusableComponets/select-exam-combox";
import { getExamList } from "@/services/ExamServices/examService";
import { AuditDataDownload, finalResultDownload, rawResultDownload } from "@/services/ResultServices/Resultdownload";
import { toast } from "sonner";

const Reports = () => {
    const { control, setValue, watch, formState: { errors } } = useForm({
        defaultValues: {
            exam_id: "",
            reportType: "",
        },
    });
    const [examList, setExamList] = useState([])


    useEffect(() => {
        const fetchExams = async () => {
            try {
                const res = await getExamList();
                if (Array.isArray(res.data?.data)) {
                    setExamList(res.data.data);
                }
            } catch (err) {
                console.error("Error loading exams", err);
                toast.error("Failed to load exams");
            }
        };

        fetchExams();
    }, []);

    const examId = watch("exam_id");
    const reportType = watch("reportType");

    const handleDownload = async () => {
        if (!examId || !reportType) return;

        try {
            let response;

            switch (reportType) {
                case "raw":
                    response = await rawResultDownload({ student_exam_id: examId });
                    break;
                case "final":
                    response = await finalResultDownload({ student_exam_id: examId });
                    break;
                case "audit":
                    response = await AuditDataDownload({ student_exam_id: examId });
                    break;
                default:
                    return;
            }

            const contentType = response.headers["content-type"] ||
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

            const blob = new Blob([response.data], { type: contentType });

            // Try to get filename from backend (Content-Disposition header)
            let fileName = `${reportType}-report-${examId}.xlsx`;
            const contentDisposition = response.headers["content-disposition"];
            if (contentDisposition) {
                const match = contentDisposition.match(/filename="?(.+)"?/);
                if (match?.[1]) fileName = match[1];
            }

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = fileName;
            a.click();
            window.URL.revokeObjectURL(url);

            toast.success("Report downloaded successfully");

        } catch (error) {
            console.error("Download failed", error);
            // alert("Error downloading report");
            toast.error("Error downloading report");
        }
    };

    return (
        <Card className="w-full max-w-3xl mx-auto py-8">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                    <FileText className="w-5 h-5 text-blue-500" />
                    Download Reports
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid gap-6">
                    {/* Exam Dropdown */}
                    <div>
                        <Label className="mb-1">Select Exam</Label>
                        <Controller
                            name="exam_id"
                            control={control}
                            rules={{ required: "Please select an exam" }}
                            render={({ field }) => (
                                <ExamCombobox
                                    exams={examList}
                                    selectedId={field.value}
                                    setExamId={(val) => setValue("exam_id", val)}
                                />
                            )}
                        />
                        {errors.exam_id && (
                            <p className="text-sm text-red-500 mt-1">{errors.exam_id.message}</p>
                        )}
                    </div>

                    {/* Report Type Dropdown */}
                    <div>
                        <Label className="mb-1">Report Type</Label>
                        <Controller
                            name="reportType"
                            control={control}
                            rules={{ required: "Please select a report type" }}
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select report type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="raw">Raw Result</SelectItem>
                                        <SelectItem value="final">Final Result</SelectItem>
                                        <SelectItem value="audit">Audit Details</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.reportType && (
                            <p className="text-sm text-red-500 mt-1">{errors.reportType.message}</p>
                        )}
                    </div>

                    {/* Download Button */}
                    <Button
                        className="w-full gap-2"
                        onClick={handleDownload}
                        disabled={!examId || !reportType}
                    >
                        <Download className="w-4 h-4" />
                        Download Report
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default Reports;
