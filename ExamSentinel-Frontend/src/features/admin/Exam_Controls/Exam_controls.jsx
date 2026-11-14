import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ExamCombobox } from "@/components/reusableComponets/select-exam-combox";
import { getExamList } from "@/services/ExamServices/examService";
import { Input } from "@/components/ui/input";
import { examStartActivity } from "@/services/AdminControls/ExamControls";


// ✅ Updated Schema (integer only)
const schema = yup.object().shape({
    examId: yup.string().required("Exam is required"),
    time: yup
        .number()
        .typeError("Time is required")
        .integer("Time must be a whole number")
        .min(1, "Time must be at least 1 minute")
        .required("Time is required"),
});

export default function ExamControls() {
    const [examList, setExamList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [count, setCount] = useState();

    const {
        control,
        handleSubmit,
        setValue,
        register,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
        mode: onchange,
        defaultValues: {
            examId: "",
            time: "",
        },
    });

    // 🔹 Fetch exam list
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

    // 🔹 Submit handler
    const onSubmit = async (data) => {
        setIsLoading(true);

        try {
            const res = await examStartActivity(data);
            const result = res.data;

            if (result.success) {
                setCount(result.notifiedStudents || 0)
                toast.success(result.message || "Exam start time updated successfully.");
            } else {
                toast.error("Failed to update exam start time.");
            }
        } catch (error) {
            toast.error("An error occurred.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="p-6 space-y-8 bg-background shadow rounded-lg max-w-2xl mx-auto"
        >
            <h1 className="text-xl font-bold">Exam Activity Control</h1>

            <div className="grid grid-cols-1 gap-4">

                {/* Exam Selection */}
                <div>
                    <Label className="mb-1">Select Exam</Label>
                    <Controller
                        name="examId"
                        control={control}
                        render={({ field }) => (
                            <ExamCombobox
                                exams={examList}
                                selectedId={field.value}
                                setExamId={(val) => setValue("examId", val)}
                            />
                        )}
                    />
                    {errors.examId && (
                        <p className="text-sm text-red-500">{errors.examId.message}</p>
                    )}
                </div>

                {/* Time Input Field */}
                <div>
                    <Label className="mb-1">Exam will start in (minutes)</Label>
                    <Input
                        type="number"
                        step="1"   // ✔ prevents decimals
                        min="1"    // ✔ must be at least 1
                        {...register("time")}
                    />

                    {errors.time && (
                        <p className="text-sm text-red-500">{errors.time.message}</p>
                    )}
                </div>
                {
                    count >= 0 && (
                        <p className="text-sm text-green-600">
                            Notified {count} Students about the exam start.
                        </p>
                    )
                }

            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Loading..." : "Submit"}
            </Button>
        </form>
    );
}
