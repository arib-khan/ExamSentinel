import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { questionSchema, defaultValues } from "./questionSchema";
import {
    createQuestion,
    questionUpdate,
    questionDelete,
} from "@/services/QuestionServices/questionService";
import { ExamCombobox } from "@/components/reusableComponets/select-exam-combox";
import { getExamList } from "@/services/ExamServices/examService";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function QuestionForm({
    mode = "create",
    initialData = null,
    onClose,
}) {
    const isView = mode === "view";
    const isEdit = mode === "edit";
    const isDelete = mode === "delete";
    const isCreate = mode === "create";
    const isDisabled = isView || isDelete;

    const {
        register,
        handleSubmit,
        control,
        reset,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues,
        resolver: yupResolver(questionSchema),
    });

    const [examId, setExamId] = useState(null);
    const [exams, setExams] = useState([]);
    const [error, setError] = useState(null);

    // Load exam list
    useEffect(() => {
        const fetchExams = async () => {
            try {
                const response = await getExamList();
                if (Array.isArray(response.data?.data)) {
                    setExams(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching exams:", error);
                setError("Error fetching exam list.");
            }
        };
        fetchExams();
    }, []);

    const [formKey, setFormKey] = useState(0);

    // Load question data when in edit/view/delete mode
    useEffect(() => {
        if ((isEdit || isView || isDelete) && initialData) {
            console.log(initialData, "data");
            console.log(initialData.DifficultyLevel, "df");

            const formValues = {
                question: initialData.question || "",
                option_a: initialData.option_a || "",
                option_b: initialData.option_b || "",
                option_c: initialData.option_c || "",
                option_d: initialData.option_d || "",
                option_e: initialData.option_e || "",
                option_f: initialData.option_f || "",
                correct_option: initialData.correct_option?.toUpperCase() || "",
                ques_exam_id: initialData.ques_exam_id || "",
                ques_exam_set_id: initialData.ques_exam_set_id || "",
                answer_key_ref: initialData.answer_key_ref || "",
                answer_key_update_time: initialData.answer_key_update_time || "",
                Language: initialData.Language || "",
                Mark: initialData.Mark || "",
                NegativeMark: initialData.NegativeMark || "",
                Duration: initialData.Duration || "",
                DifficultyLevel: String(initialData.DifficultyLevel) || "",
                Reference: initialData.Reference || "",
                RandomizeOption: initialData.RandomizeOption || "",
                Group_question_No: initialData.Group_question_No || "",
                imageRef: initialData.imageRef || "",
                option_a_image: initialData.option_a_image || "",
                option_b_image: initialData.option_b_image || "",
                option_c_image: initialData.option_c_image || "",
                option_d_image: initialData.option_d_image || "",
                question_type: initialData.question_type || "MCQ",
                section: initialData.section || "",
                question_subject: initialData.question_subject || "",
            };
            // Use setTimeout to ensure Select components are mounted
            setTimeout(() => {
                reset(formValues);
                setFormKey(prev => prev + 1); // Force remount
            }, 0);
            setExamId(initialData.ques_exam_id);
        }
    }, [mode, initialData, isEdit, isView, isDelete, reset, setValue]);

    const onSubmit = async (data) => {
        if (isView || isDelete) return;

        if (!examId) {
            setError("Please select an exam name");
            return;
        }

        setError(null);

        const payload = {
            ...data,
            ques_exam_id: examId,
        };

        try {
            if (isEdit && initialData?.ques_id) {
                const response = await questionUpdate(initialData.ques_id, payload);
                if (response.status) {
                    toast.success("Question updated successfully!");
                    onClose?.();
                } else {
                    toast.error("Failed to update question.");
                }
            } else {
                const response = await createQuestion([payload]);
                if (response.status) {
                    toast.success("Question created successfully!");
                    onClose?.();
                } else {
                    toast.error("Failed to create question.");
                }
            }
        } catch (err) {
            toast.error("Error during submission.");
            console.error(err);
        }
    };

    const handleDelete = async () => {
        if (!initialData?.id) return;

        try {
            const res = await questionDelete(initialData.id);
            if (res.status) {
                toast.success("Question deleted successfully.");
                onClose?.();
            } else {
                toast.error("Failed to delete question.");
            }
        } catch (err) {
            toast.error("Delete operation failed.");
            console.error(err);
        }
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="p-6 space-y-6 bg-background shadow rounded-lg max-w-6xl mx-auto"
        >
            <h2 className="text-2xl font-semibold mb-4 capitalize">
                {mode} Question
            </h2>

            {/* Basic Information Section */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium border-b pb-2">Basic Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <Label className="mb-1">Question *</Label>
                        <Textarea
                            {...register("question")}
                            disabled={isDisabled}
                            rows={3}
                            className="resize-none"
                        />
                        <p className="text-sm text-red-500 mt-1">
                            {errors.question?.message}
                        </p>
                    </div>

                    <div>
                        <Label className="mb-1">Question Type *</Label>
                        <Controller
                            name="question_type"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    disabled={isDisabled}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select question type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MCQ">MCQ</SelectItem>
                                        <SelectItem value="NUMERICAL">NUMERICAL</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        <p className="text-sm text-red-500 mt-1">
                            {errors.question_type?.message}
                        </p>
                    </div>

                    <div>
                        <Label className="mb-1">Select Exam Name</Label>
                        <ExamCombobox
                            exams={exams}
                            setExamId={setExamId}
                            selectedId={examId}
                            disabled={isDisabled}
                        />
                        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
                    </div>

                    <div>
                        <Label className="mb-1">Exam Set ID</Label>
                        <Input
                            {...register("ques_exam_set_id")}
                            disabled={isDisabled}
                            type="number"
                        />
                        <p className="text-sm text-red-500 mt-1">
                            {errors.ques_exam_set_id?.message}
                        </p>
                    </div>

                    <div>
                        <Label className="mb-1">Subject</Label>
                        <Input {...register("question_subject")} disabled={isDisabled} />
                        <p className="text-sm text-red-500 mt-1">
                            {errors.question_subject?.message}
                        </p>
                    </div>

                    <div>
                        <Label className="mb-1">Section</Label>
                        <Input {...register("section")} disabled={isDisabled} />
                        <p className="text-sm text-red-500 mt-1">
                            {errors.section?.message}
                        </p>
                    </div>

                    <div>
                        <Label className="mb-1">Language</Label>
                        <Input {...register("Language")} disabled={isDisabled} />
                        <p className="text-sm text-red-500 mt-1">
                            {errors.Language?.message}
                        </p>
                    </div>
                </div>
            </div>

            {/* Options Section */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium border-b pb-2">Options</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Label className="mb-1">Option A *</Label>
                        <Input {...register("option_a")} disabled={isDisabled} />
                        <p className="text-sm text-red-500 mt-1">
                            {errors.option_a?.message}
                        </p>
                    </div>

                    <div>
                        <Label className="mb-1">Option A Image Reference</Label>
                        <Input {...register("option_a_image")} disabled={isDisabled} />
                        <p className="text-sm text-red-500 mt-1">
                            {errors.option_a_image?.message}
                        </p>
                    </div>

                    <div>
                        <Label className="mb-1">Option B *</Label>
                        <Input {...register("option_b")} disabled={isDisabled} />
                        <p className="text-sm text-red-500 mt-1">
                            {errors.option_b?.message}
                        </p>
                    </div>

                    <div>
                        <Label className="mb-1">Option B Image Reference</Label>
                        <Input {...register("option_b_image")} disabled={isDisabled} />
                        <p className="text-sm text-red-500 mt-1">
                            {errors.option_b_image?.message}
                        </p>
                    </div>

                    <div>
                        <Label className="mb-1">Option C *</Label>
                        <Input {...register("option_c")} disabled={isDisabled} />
                        <p className="text-sm text-red-500 mt-1">
                            {errors.option_c?.message}
                        </p>
                    </div>

                    <div>
                        <Label className="mb-1">Option C Image Reference</Label>
                        <Input {...register("option_c_image")} disabled={isDisabled} />
                        <p className="text-sm text-red-500 mt-1">
                            {errors.option_c_image?.message}
                        </p>
                    </div>

                    <div>
                        <Label className="mb-1">Option D *</Label>
                        <Input {...register("option_d")} disabled={isDisabled} />
                        <p className="text-sm text-red-500 mt-1">
                            {errors.option_d?.message}
                        </p>
                    </div>

                    <div>
                        <Label className="mb-1">Option D Image Reference</Label>
                        <Input {...register("option_d_image")} disabled={isDisabled} />
                        <p className="text-sm text-red-500 mt-1">
                            {errors.option_d_image?.message}
                        </p>
                    </div>

                    <div>
                        <Label className="mb-1">Option E</Label>
                        <Input {...register("option_e")} disabled={isDisabled} />
                        <p className="text-sm text-red-500 mt-1">
                            {errors.option_e?.message}
                        </p>
                    </div>

                    <div>
                        <Label className="mb-1">Option F</Label>
                        <Input {...register("option_f")} disabled={isDisabled} />
                        <p className="text-sm text-red-500 mt-1">
                            {errors.option_f?.message}
                        </p>
                    </div>
                    <div>
                        <Label className="mb-1">Question Image Reference</Label>
                        <Input {...register("imageRef")} disabled={isDisabled} />
                        <p className="text-sm text-red-500 mt-1">
                            {errors.imageRef?.message}
                        </p>
                    </div>

                    <div key={`correct_option-${formKey}`}>
                        <Label className="mb-1">Correct Option *</Label>
                        <Controller
                            name="correct_option"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    disabled={isDisabled}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select correct option" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="A">A</SelectItem>
                                        <SelectItem value="B">B</SelectItem>
                                        <SelectItem value="C">C</SelectItem>
                                        <SelectItem value="D">D</SelectItem>
                                        <SelectItem value="E">E</SelectItem>
                                        <SelectItem value="F">F</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        <p className="text-sm text-red-500 mt-1">
                            {errors.correct_option?.message}
                        </p>
                    </div>
                </div>
            </div>

            {/* Scoring & Configuration Section */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium border-b pb-2">
                    Scoring & Configuration
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                        <Label className="mb-1">Mark</Label>
                        <Input
                            {...register("Mark")}
                            disabled={isDisabled}
                            type="number"
                        />
                        <p className="text-sm text-red-500 mt-1">
                            {errors.Mark?.message}
                        </p>
                    </div>

                    <div>
                        <Label className="mb-1">Negative Mark</Label>
                        <Input
                            {...register("NegativeMark")}
                            disabled={isDisabled}
                            type="number"
                            step="0.01"
                        />
                        <p className="text-sm text-red-500 mt-1">
                            {errors.NegativeMark?.message}
                        </p>
                    </div>

                    <div>
                        <Label className="mb-1">Duration</Label>
                        <Input {...register("Duration")} disabled={isDisabled} />
                        <p className="text-sm text-red-500 mt-1">
                            {errors.Duration?.message}
                        </p>
                    </div>

                    <div key={`DifficultyLevel-${formKey}`}>
                        <Label className="mb-1">Difficulty Level </Label>
                        <Controller
                            name="DifficultyLevel"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    disabled={isDisabled}
                                    value={field.value}
                                    onValueChange={field.onChange}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select difficulty level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0">Easy</SelectItem>
                                        <SelectItem value="1">Hard</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        <p className="text-sm text-red-500 mt-1">
                            {errors.DifficultyLevel?.message}
                        </p>
                    </div>

                    <div>
                        <Label className="mb-1">Reference</Label>
                        <Input
                            {...register("Reference")}
                            disabled={isDisabled}
                            type="number"
                        />
                        <p className="text-sm text-red-500 mt-1">
                            {errors.Reference?.message}
                        </p>
                    </div>


                    <div key={`RandomizeOption-${formKey}`}>
                        <Label className="mb-1">Randomize Option *</Label>
                        <Controller
                            name="RandomizeOption"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    disabled={isDisabled}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select randomize options" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Yes">Yes</SelectItem>
                                        <SelectItem value="No">No</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        <p className="text-sm text-red-500 mt-1">
                            {errors.RandomizeOption?.message}
                        </p>
                    </div>

                    <div>
                        <Label className="mb-1">Group Question No</Label>
                        <Input {...register("Group_question_No")} disabled={isDisabled} />
                        <p className="text-sm text-red-500 mt-1">
                            {errors.Group_question_No?.message}
                        </p>
                    </div>



                    <div>
                        <Label className="mb-1">Answer Key Ref</Label>
                        <Input {...register("answer_key_ref")} disabled={isDisabled} />
                        <p className="text-sm text-red-500 mt-1">
                            {errors.answer_key_ref?.message}
                        </p>
                    </div>

                    <div>
                        <Label className="mb-1">Answer Key Update Time</Label>
                        <Input
                            {...register("answer_key_update_time")}
                            disabled={isDisabled}
                            type="datetime-local"
                        />
                        <p className="text-sm text-red-500 mt-1">
                            {errors.answer_key_update_time?.message}
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-center gap-3 pt-6 border-t">
                {(isCreate || isEdit) && (
                    <button
                        type="submit"
                        className="px-8 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium"
                    >
                        {isCreate ? "Create Question" : "Update Question"}
                    </button>
                )}

                {(isView || isEdit) && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-8 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition font-medium"
                    >
                        Close
                    </button>
                )}

                {isDelete && (
                    <>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-8 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition font-medium"
                        >
                            Cancel
                        </button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <button className="px-8 py-2 cursor-pointer bg-red-600 text-white rounded-md hover:bg-red-700 transition font-medium">
                                    Confirm Delete
                                </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. It will permanently delete
                                        this question and all its associated data.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleDelete}
                                        className="bg-red-600 hover:bg-red-700 text-white"
                                    >
                                        Yes, Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </>
                )}
            </div>
        </form>
    );
}