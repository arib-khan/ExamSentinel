import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { addQuestionSchema, defaultValues } from "./addQuestionValidation";
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

export default function UpdateQuestion({
  mode = "create",
  initialData = null,
  onClose,
}) {
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isDelete = mode === "delete";

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    // defaultValues,
    resolver: yupResolver(addQuestionSchema),
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

  // Load question data when in edit/view/delete mode
  // useEffect(() => {
  //   if ((isEdit || isView || isDelete) && initialData) {
  //     reset({
  //       question: initialData.question,
  //       option_a: initialData.option_a,
  //       option_b: initialData.option_b,
  //       option_c: initialData.option_c,
  //       option_d: initialData.option_d,
  //       correct_option: initialData.correct_option?.toUpperCase(),
  //     });
  //     setExamId(initialData.ques_exam_id);
  //   }
  // }, [initialData, isEdit, isView, isDelete, reset]);

  useEffect(() => {
    if ((isEdit || isView || isDelete) && initialData) {
      // Only reset if correct_option is valid
      reset({
        question: initialData.question,
        option_a: initialData.option_a,
        option_b: initialData.option_b,
        option_c: initialData.option_c,
        option_d: initialData.option_d,
        correct_option: initialData.correct_option?.toUpperCase() ?? "",
      });
      setExamId(initialData.ques_exam_id);
    }
  }, [initialData, isEdit, isView, isDelete, reset]);

  console.log(initialData);


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
      if (mode === "edit" && initialData?.ques_id) {
        const response = await questionUpdate(initialData.ques_id, payload);
        if (response.status) {
          toast.success("Question updated successfully!");
          onClose?.();
        } else {
          toast.error("Failed to update question.");
        }
      } else {
        const response = await createQuestion([payload]); // API accepts array
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
    if (!initialData?.ques_id) return;

    try {
      const res = await questionDelete(initialData.ques_id);
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
      className="p-6 space-y-8 bg-background shadow rounded-lg max-w-4xl mx-auto"
    >
      <h2 className="text-xl font-semibold mb-4 capitalize">{mode} Question</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <Label className="mb-1">Question</Label>
          <Input {...register("question")} disabled={isView || isDelete} />
          <p className="text-sm text-red-500 mt-1">
            {errors.question?.message}
          </p>
        </div>

        <div>
          <Label className="mb-1">Option A</Label>
          <Input {...register("option_a")} disabled={isView || isDelete} />
          <p className="text-sm text-red-500 mt-1">
            {errors.option_a?.message}
          </p>
        </div>
        <div>
          <Label className="mb-1">Option B</Label>
          <Input {...register("option_b")} disabled={isView || isDelete} />
          <p className="text-sm text-red-500 mt-1">
            {errors.option_b?.message}
          </p>
        </div>
        <div>
          <Label className="mb-1">Option C</Label>
          <Input {...register("option_c")} disabled={isView || isDelete} />
          <p className="text-sm text-red-500 mt-1">
            {errors.option_c?.message}
          </p>
        </div>
        <div>
          <Label className="mb-1">Option D</Label>
          <Input {...register("option_d")} disabled={isView || isDelete} />
          <p className="text-sm text-red-500 mt-1">
            {errors.option_d?.message}
          </p>
        </div>

        <div>
          <Label className="mb-1">Correct Option</Label>
          <Controller
            name="correct_option"
            control={control}
            render={({ field }) => {
              console.log("Render Select value:", field.value); // ✅ Log current value
              return (
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isView || isDelete}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select correct option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                    <SelectItem value="D">D</SelectItem>
                  </SelectContent>
                </Select>
              );
            }}
          />

          <p className="text-sm text-red-500 mt-1">
            {errors.correct_option?.message}
          </p>
        </div>

        <div>
          <Label className="mb-1">Select Exam Name</Label>
          <ExamCombobox
            exams={exams}
            setExamId={setExamId}
            selectedId={examId}
            disabled={isView || isDelete}
          />
          {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-center gap-3 pt-4">
        {(mode === "create" || mode === "edit") && (
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            {mode === "create" ? "Create" : "Update"}
          </button>
        )}

        {(isView || isEdit || isDelete) && (
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
          >
            Back
          </button>
        )}

        {mode === "delete" && (
          <div className="flex justify-center">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="px-6 py-2 cursor-pointer bg-red-600 text-white rounded-md hover:bg-red-700 transition">
                  Confirm Delete
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. It will permanently delete
                    this question.
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
          </div>
        )}
      </div>
    </form>
  );
}
