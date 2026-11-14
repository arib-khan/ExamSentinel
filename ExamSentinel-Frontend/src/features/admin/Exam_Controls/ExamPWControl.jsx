import React, { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import apiClient from "@/services/apiClient";
import { ExamCombobox } from "@/components/reusableComponets/select-exam-combox";
import { getExamList } from "@/services/ExamServices/examService";
import { CenterCombobox } from "@/components/reusableComponets/select-centre-combobox";
import { getCenterLists } from "@/services/CenterServices/centerServices";
import { UserNameCombobox } from "@/components/reusableComponets/select-username-combox";
import { getUsersList } from "@/services/UserManagementServices/userService";
import { generatePassword } from "@/services/AdminControls/ExamControls";
import ExamPWList from "./list/examPwList";
import { set } from "date-fns";
import { Copy } from "lucide-react";


// ✅ Updated Schema (integer only)
const schema = yup.object().shape({
    exam_id: yup.string().required("Exam is required").typeError("Exam is required"),
    user_id: yup.string().required("User is required").typeError("User is required"),
    center_id: yup.string().required("Center is required").typeError("Center is required"),
});

export default function ExamPWControl() {
    const refetchDataRef = useRef();
    const [examList, setExamList] = useState([]);
    const [centreList, setCentreList] = useState([]);
    const [userList, setUserList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [opt, setOtp] = useState("");

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
            exam_id: "",
            user_id: "",
            center_id: "",
        },
    });


    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userResponse, examResponse, centreResponse] = await Promise.all([
                    getUsersList(),
                    getExamList(),
                    getCenterLists(),
                ]);

                if (Array.isArray(userResponse.data?.result)) {
                    setUserList(userResponse.data.result);
                }
                if (Array.isArray(examResponse.data?.data)) {
                    setExamList(examResponse.data.data);
                }
                if (Array.isArray(centreResponse.data?.data)) {
                    setCentreList(centreResponse.data.data);
                }
            } catch (err) {
                console.error("Error fetching lists:", err);
                setError("Failed to load data.");
            }
        };
        fetchData();
    }, []);


    // 🔹 Submit handler
    const onSubmit = async (data) => {
        setIsLoading(true);

        try {
            const res = await generatePassword(data);
            console.log(res);

            if (res?.data.status) {
                setOtp(res.data.result[0].otp);
                if (refetchDataRef.current) {
                    refetchDataRef.current.reFetchData();
                }
                toast.success(res.data.msg || "Exam Password Generated successfully.");
            } else {
                toast.error(res.data.msg || "Failed to generate exam password.");
            }
        } catch (error) {
            toast.error("An error occurred.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="p-6 space-y-8 bg-background shadow rounded-lg max-w-2xl mx-auto"
            >
                <h1 className="text-xl font-bold">Question Paper OTP Generate</h1>

                <div className="grid grid-cols-1 gap-4">


                    {/* User Selection */}
                    <div>
                        <Label className="mb-1">Select User</Label>
                        <Controller
                            name="user_id"
                            control={control}
                            render={({ field }) => (
                                <UserNameCombobox
                                    users={userList}
                                    selectedId={field.value}
                                    setUserId={(val) => setValue("user_id", val)}
                                />
                            )}
                        />
                        {errors.user_id && (
                            <p className="text-sm text-red-500">{errors.user_id.message}</p>
                        )}
                    </div>
                    {/* Exam Selection */}
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
                    <div>
                        <Label className="mb-1">Select Center</Label>
                        <Controller
                            name="center_id"
                            control={control}
                            render={({ field }) => (
                                <CenterCombobox
                                    centers={centreList}
                                    selectedId={field.value}
                                    setCentreId={(val) => setValue("center_id", val)}
                                />
                            )}
                        />
                        {errors.center_id && (
                            <p className="text-sm text-red-500">{errors.center_id.message}</p>
                        )}
                    </div>
                    {
                        opt && (
                            <div className=" flex gap-2 justify-between w-fit p-2 bg-green-100 text-green-800 rounded">
                                <span> <strong>Generated OTP:</strong> {opt}</span>
                                <Button
                                    type="button"
                                    variant="default"
                                    size="sm"
                                    className="cursor-pointer"
                                    onClick={() => {
                                        navigator.clipboard.writeText(opt);
                                        toast.success("OTP copied to clipboard!");
                                    }}
                                    title="Copy to Clipboard"
                                > <Copy /></Button>
                            </div>
                        )
                    }


                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Generating..." : "Generate Password"}
                </Button>
            </form>

            <ExamPWList ref={refetchDataRef} />
        </div>
    );
}
