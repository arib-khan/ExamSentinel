import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "sonner";
import { ExamCombobox } from "@/components/reusableComponets/select-exam-combox";
import { getExamList } from "@/services/ExamServices/examService";

const schema = yup.object().shape({
  ex_sets_name: yup.string().required("Exam Set name is required"),
  ex_sets_exam_id: yup.string().required("Exam is required"),
});

export default function ExamSetForm({ onSuccess }) {
  const [examList, setExamList] = useState([]);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      ex_sets_name: "",
      ex_sets_exam_id: "",
    },
    resolver: yupResolver(schema),
  });

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

  const onSubmit = async (data) => {
    try {
      const response = await createExamSet(data);

      if (response.status) {
        toast.success("Exam Set created successfully!");
        onSuccess?.(); // refresh parent
        reset();
      } else {
        toast.error("Failed to create Exam Set");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error while creating Exam Set");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label className="mb-1">Select Exam</Label>
        <Controller
          name="ex_sets_exam_id"
          control={control}
          render={({ field }) => (
            <ExamCombobox
              exams={examList}
              selectedId={field.value}
              setExamId={(val) => setValue("ex_sets_exam_id", val)}
            />
          )}
        />
        {errors.ex_sets_exam_id && (
          <p className="text-sm text-red-500 mt-1">
            {errors.ex_sets_exam_id.message}
          </p>
        )}
      </div>

      <div>
        <Label className="mb-1">Exam Set Name</Label>
        <Input {...register("ex_sets_name")} />
        {errors.ex_sets_name && (
          <p className="text-sm text-red-500 mt-1">
            {errors.ex_sets_name.message}
          </p>
        )}
      </div>

      <Button type="submit">Create Set</Button>
    </form>
  );
}
