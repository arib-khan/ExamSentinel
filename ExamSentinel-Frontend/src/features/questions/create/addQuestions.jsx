import React, { useState } from "react";
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
import { createQuestion } from "@/services/QuestionServices/questionService";
import { ExamCombobox } from "@/components/reusableComponets/select-exam-combox";
import { getExamList } from "@/services/ExamServices/examService";
import { useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function AddQuestionForm() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues,
    resolver: yupResolver(addQuestionSchema),
  });

  const [createdId, setCreatedId] = useState(null);

  const [examId, setExamId] = useState(null);

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await getExamList();

        if (Array.isArray(response.data?.data)) {
          setExams(response.data?.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Error fetching data from APIs.");
      } finally {
        setLoading(false);
      }
    };
    fetchBranches();
  }, []);

  const onSubmit = async (data) => {
    if (!examId) {
      setError("Please select an exam name");
      return;
    } else {
      setError(null);
    }
    const payload = [
      {
        ...data,
        ques_exam_id: examId,
      },
    ];

    try {
      const response = await createQuestion(payload);
      if (response.status) {
        setCreatedId(response.data.id);
        toast.success("Question added successfully!");
      } else {
        toast.error("Failed to add question");
      }
    } catch (error) {
      toast.error("Error submitting form");
      console.error(error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="p-6 space-y-8 bg-background shadow rounded-lg max-w-4xl mx-auto"
    >
      <h2 className="text-xl font-semibold mb-4">Add Question</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <Label className="mb-1">Question</Label>
          <Input {...register("question")} />
          <p className="text-sm text-red-500 mt-1">
            {errors.question?.message}
          </p>
        </div>

        <div>
          <Label className="mb-1">Option A</Label>
          <Input {...register("option_a")} />
          <p className="text-sm text-red-500 mt-1">
            {errors.option_a?.message}
          </p>
        </div>
        <div>
          <Label className="mb-1">Option B</Label>
          <Input {...register("option_b")} />
          <p className="text-sm text-red-500 mt-1">
            {errors.option_b?.message}
          </p>
        </div>
        <div>
          <Label className="mb-1">Option C</Label>
          <Input {...register("option_c")} />
          <p className="text-sm text-red-500 mt-1">
            {errors.option_c?.message}
          </p>
        </div>
        <div>
          <Label className="mb-1">Option D</Label>
          <Input {...register("option_d")} />
          <p className="text-sm text-red-500 mt-1">
            {errors.option_d?.message}
          </p>
        </div>

        <div>
          <Label className="mb-1">Correct Option</Label>
          <Controller
            name="correct_option"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
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
            )}
          />
          <p className="text-sm text-red-500 mt-1">
            {errors.correct_option?.message}
          </p>
        </div>

        <div>
          <Label className="mb-1">Select Exam Name</Label>
          <ExamCombobox exams={exams} setExamId={setExamId} />
          {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        </div>
      </div>

      <div className="flex justify-center gap-2">
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Submit
        </button>
        <button
          type="button"
          className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
          onClick={() => navigate("/admin/questions")}
        >
          Back
        </button>
      </div>
    </form>
  );
}
