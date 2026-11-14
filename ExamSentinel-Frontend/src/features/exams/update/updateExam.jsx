import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import { format } from "date-fns";
import { defaultValues, schema } from "../create/ExamFormValidation";
import { InstitutionCombobox } from "@/components/reusableComponets/select-institute-combox";
import { getInstitutionList } from "@/services/InstitutionServices/institutionService";
import {
  createExamDetails,
  deleteExamDetails,
  updateExamDetails,
} from "@/services/ExamServices/examService";
import { SkeletonCard } from "@/components/reusableComponets/LoadingState";
import { toast } from "sonner";

export default function ExamForm({
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
    defaultValues: defaultValues,
    resolver: yupResolver(schema),
  });

  const [examId, setExamId] = useState(null);
  const [instID, setInstId] = useState(null);
  const [institute, setInstitute] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getInstitutionList();
        if (Array.isArray(response.data?.data)) {
          setInstitute(response.data.data);
        }

        if ((isView || isEdit || isDelete) && initialData) {
          reset({
            exam_name: initialData.exam_name,
            exam_start_date: format(
              new Date(initialData.exam_start_date),
              "yyyy-MM-dd"
            ),
            exam_end_date: format(
              new Date(initialData.exam_end_date),
              "yyyy-MM-dd"
            ),
            exam_no_of_students: initialData.exam_no_of_students,
            exam_duration: initialData.exam_duration,
            exam_no_questions: initialData.exam_no_questions,
            exam_status: initialData.exam_status,
          });

          setInstId(initialData.exam_inst_id);
          setExamId(initialData.exam_id);
        }
      } catch (err) {
        console.error("Error fetching:", err);
        setError("Failed to load institutions.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [initialData, isView, isEdit, isDelete, reset]);

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      exam_inst_id: instID,
      exam_start_date: format(new Date(data.exam_start_date), "yyyy-MM-dd"),
      exam_end_date: format(new Date(data.exam_end_date), "yyyy-MM-dd"),
    };

    try {
      let response;
      if (examId) {
        response = await updateExamDetails(examId, payload);
      } else {
        response = await createExamDetails(payload);
      }

      if (response.status) {
        toast.success("Exam details saved successfully");
        setExamId(response.data.data.exam_id);
        onClose();
      } else {
        toast.error("Failed to save exam details");
      }
    } catch (err) {
      console.error(err);
      toast.error("Submission failed");
    }
  };

  const handleDelete = async () => {
    try {
      const response = await deleteExamDetails(examId);
      if (response.status) {
        toast.success("Exam deleted successfully");
        onClose();
      } else {
        toast.error("Failed to delete exam");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred during deletion");
    }
  };

  if (loading) return <SkeletonCard count={3} />;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="p-6 space-y-8 bg-background shadow rounded-lg max-w-3xl mx-auto"
    >
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        <div>
          <Label className="mb-2">Select Institution Name</Label>
          <InstitutionCombobox
            institutions={institute}
            setInstId={setInstId}
            selectedId={instID}
            disabled={isView || isDelete}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <div>
          <Label className="mb-2">Exam Name</Label>
          <Input {...register("exam_name")} disabled={isView || isDelete} />
          <p className="text-sm text-red-500">{errors.exam_name?.message}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label className="mb-2">Start Date</Label>
          <Input
            type="date"
            {...register("exam_start_date")}
            disabled={isView || isDelete}
          />
          <p className="text-sm text-red-500">
            {errors.exam_start_date?.message}
          </p>
        </div>

        <div>
          <Label className="mb-2">End Date</Label>
          <Input
            type="date"
            {...register("exam_end_date")}
            disabled={isView || isDelete}
          />
          <p className="text-sm text-red-500">
            {errors.exam_end_date?.message}
          </p>
        </div>

        <div>
          <Label className="mb-2">No. of Students</Label>
          <Input
            type="number"
            {...register("exam_no_of_students")}
            disabled={isView || isDelete}
          />
          <p className="text-sm text-red-500">
            {errors.exam_no_of_students?.message}
          </p>
        </div>

        <div>
          <Label className="mb-2">Status</Label>
          <Controller
            name="exam_status"
            control={control}
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={isView || isDelete}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Active</SelectItem>
                  <SelectItem value="I">Inactive</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          <p className="text-sm text-red-500">{errors.exam_status?.message}</p>
        </div>
        <div>
          <Label className="mb-1">Exam Duration (minutes)</Label>
          <Input
            disabled={isView || isDelete}
            type="number"
            {...register("exam_duration")}
          />
          <p className="text-sm text-red-500 mt-1">
            {errors.exam_duration?.message}
          </p>
        </div>
        <div>
          <Label className="mb-1"> No. of Questions</Label>
          <Input
            disabled={isView || isDelete}
            type="number"
            {...register("exam_no_questions")}
          />
          <p className="text-sm text-red-500 mt-1">
            {errors.exam_no_questions?.message}
          </p>
        </div>
      </div>

      {mode === "view" && (
        <div className="flex justify-center gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-gray-500 cursor-pointer text-white rounded-md hover:bg-gray-600 transition"
          >
            Back
          </button>
        </div>
      )}

      {(mode === "create" || mode === "edit") && (
        <div className="flex justify-center gap-2">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 cursor-pointer text-white rounded-md hover:bg-blue-700 transition"
          >
            {mode === "create" ? "Create" : "Update"}
          </button>
          {mode === "edit" && (
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-500 cursor-pointer text-white rounded-md hover:bg-gray-600 transition"
            >
              Back
            </button>
          )}
        </div>
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
                  This action cannot be undone. It will permanently delete this
                  exam.
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
          <div>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-500 cursor-pointer text-white rounded-md hover:bg-gray-600 transition ml-4"
            >
              Back
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
