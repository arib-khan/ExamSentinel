import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Gauge, Users, ImageIcon, BookOpen, Clock, FileImage, GraduationCap } from "lucide-react";
import useExamDetails from "./useExamDetails";
import { SkeletonCard } from "@/components/reusableComponets/LoadingState";
import { NoDataFound } from "@/components/reusableComponets/NoDataFound";

function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;
}

export default function DataDashboard() {
    // get the center id from session storage
    const centerId = sessionStorage.getItem("stored_center_id");
    const { data, error, loading } = useExamDetails(centerId || 6);

    const examDate = data?.exam_date ? data.exam_date.split("T")[0] : "";
    const examStartTime = data?.exam_start_time
        ? new Date(data.exam_start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : "";

    const examEndTime = data?.exam_end_time
        ? new Date(data.exam_end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : "";

    // if (!data || data.length === 0) return <NoDataFound
    //     title="No Exam Details Found"
    //     description="There are no exam details available to display."
    //     icon={GraduationCap}
    // />;
    if (loading) return <SkeletonCard count={3} />;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3 ">
            {/* Exam Info */}
            <Card className=" bg-background shadow-lg rounded-2xl border-input">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold">Exam Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="grid grid-cols-[120px_1fr] gap-2 items-start">
                        <span className="">Exam Name:</span>
                        <span className="font-medium " title={data.exam_name}>{data.exam_name}</span>

                        <span className="">Center Name:</span>
                        <span className="font-medium " title={data.centre_name}>{data.centre_name}</span>

                        <span className="">Client Name:</span>
                        <span className="font-medium " title={data.institution_name}>{data.institution_name}</span>
                    </div>
                </CardContent>

            </Card>

            {/* Exam Structure */}
            <Card className="bg-background shadow-lg rounded-2xl border-input">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold">Exam Structure</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="grid grid-cols-[180px_1fr] gap-2 items-start">
                        <span className="">Number of Questions:</span>
                        <span className="font-medium " title={data.exam_no_questions}>
                            {data.exam_no_questions}
                        </span>

                        <span className="">Duration:</span>
                        <span className="font-medium " title={data.exam_duration}>
                            {data.exam_duration} mins
                        </span>

                        <span className="">Question Image Count:</span>
                        <span className="font-medium " title={data.question_image_count || 0}>
                            {data.question_image_count || 0}
                        </span>
                    </div>
                </CardContent>

            </Card>

            {/* Timing */}
            <Card className=" bg-background shadow-lg rounded-2xl border-input">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold">Schedule</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="grid grid-cols-[120px_1fr] gap-2 items-start">
                        <span className="">Date:</span>
                        <span className="font-medium truncate" title={formatDate(examDate)}>
                            {formatDate(examDate)}
                        </span>

                        <span className="">Start Time:</span>
                        <span className="font-medium truncate" title={examStartTime}>
                            {examStartTime}
                        </span>

                        <span className="">End Time:</span>
                        <span className="font-medium truncate" title={examEndTime}>
                            {examEndTime}
                        </span>
                    </div>
                </CardContent>

            </Card>

            {/* Students */}
            <Card className=" bg-background shadow-lg rounded-2xl border-input col-span-1 md:col-span-2 lg:col-span-3">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold">Student Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="flex flex-col items-center p-4 bg-accent rounded-xl shadow-sm">
                        <Users className="h-8 w-8 mb-2" />
                        <p className="text-sm ">Total Students</p>
                        <p className="font-semibold text-lg">{data.total_students}</p>
                    </div>

                    <div className="flex flex-col items-center p-4 bg-accent rounded-xl shadow-sm">
                        <ImageIcon className="h-8 w-8 mb-2" />
                        <p className="text-sm ">Student Images</p>
                        <p className="font-semibold text-lg">{data.student_image_count || 0}</p>
                    </div>

                    <div className="flex flex-col items-center p-4 bg-accent rounded-xl shadow-sm">
                        <BookOpen className="h-8 w-8 mb-2" />
                        <p className="text-sm ">Total Questions</p>
                        <p className="font-semibold text-lg">{data.total_questions}</p>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-accent rounded-xl shadow-sm">
                        <FileImage className="h-8 w-8 mb-2" />
                        <p className="text-sm ">Question Images</p>
                        <p className="font-semibold text-lg">{data.question_image_count || 0}</p>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}