import React, { useRef, useState } from "react";
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
import { format } from "date-fns";
import { defaultValues, schema } from "./ExamFormValidation";
import { InstitutionCombobox } from "@/components/reusableComponets/select-institute-combox";
import { useEffect } from "react";
import { getInstitutionList } from "@/services/InstitutionServices/institutionService";
import {
  createExamDetails,
  updateExamDetails,
  uploadInstructionImage,
} from "@/services/ExamServices/examService";
import { SkeletonCard } from "@/components/reusableComponets/LoadingState";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "@/contexts/PermissionContext";

export default function ExamForm() {
  const { getRoleName } = usePermissions();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    control,
    setValue,
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

  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await getInstitutionList();

        if (Array.isArray(response.data?.result)) {
          setInstitute(response.data?.result);
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


  const [uploading, setUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // ✅ Check image type
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed!");
      e.target.value = ""; // reset input
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("exam_instructions_image", file);

      const res = await uploadInstructionImage(formData);

      if (res.data?.status) {
        toast.success("Profile photo uploaded!");
        setUploadedFileName(res.data.fileName);

        // ✅ inject the filename into your form (so it will be sent with form submit)
        setValue("exam_instructions_image", res.data.fileName, { shouldValidate: true });

      } else {
        toast.error("Upload failed, please try again.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error while uploading file");
    } finally {
      setUploading(false);
    }
  };

  // Function to clear file input and uploaded file state
  const clearFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setUploadedFileName(null);
    setValue("exam_instructions_image", "", { shouldValidate: true });
  };

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
        setExamId(response.data.data.exam_id);
        toast.success("Exam Detail added successfully!");
        clearFileInput();
        reset()
        setInstId(null)

      } else {
        toast.error("Failed to add exam detail");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit form");
    }
  };
  const handleBackNavigation = () => {
    const role = getRoleName();
    navigate(`/${role}/exams/list`);
  };

  if (loading) return <SkeletonCard count={3} />;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="p-6 space-y-8 bg-background shadow rounded-lg max-w-3xl mx-auto"
    >
      <h2 className="text-xl font-semibold mb-4">Exam Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label className="mb-1">Select Institution Name</Label>
          <InstitutionCombobox institutions={institute} setInstId={setInstId} />
          {error && <p>Error : {error}</p>}
        </div>

        <div>
          <Label className="mb-1">Exam Name</Label>
          <Input {...register("exam_name")} />
          <p className="text-sm text-red-500 mt-1">
            {errors.exam_name?.message}
          </p>
        </div>

        <div>
          <Label className="mb-1">Start Date</Label>
          <Input type="date" {...register("exam_start_date")} />
          <p className="text-sm text-red-500 mt-1">
            {errors.exam_start_date?.message}
          </p>
        </div>

        <div>
          <Label className="mb-1">End Date</Label>
          <Input type="date" {...register("exam_end_date")} />
          <p className="text-sm text-red-500 mt-1">
            {errors.exam_end_date?.message}
          </p>
        </div>

        <div>
          <Label className="mb-1">No. of Students</Label>
          <Input type="number" {...register("exam_no_of_students")} />
          <p className="text-sm text-red-500 mt-1">
            {errors.exam_no_of_students?.message}
          </p>
        </div>

        <div>
          <Label className="mb-1">Status</Label>
          <Controller
            name="exam_status"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
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
          <p className="text-sm text-red-500 mt-1">
            {errors.exam_status?.message}
          </p>
        </div>
        <div>
          <Label className="mb-1">Exam Duration (minutes)</Label>
          <Input type="number" {...register("exam_duration")} />
          <p className="text-sm text-red-500 mt-1">
            {errors.exam_duration?.message}
          </p>
        </div>
        <div>
          <Label className="mb-1"> No. of Questions</Label>
          <Input type="number" {...register("exam_no_questions")} />
          <p className="text-sm text-red-500 mt-1">
            {errors.exam_no_questions?.message}
          </p>
        </div>
        <div className="col-span-2">
          <Label className="mb-1">Exam Instruction Text</Label>
          <Textarea
            rows={1} {...register("exam_instructions")} />
          <p className="text-sm text-red-500 mt-1">
            {errors.exam_instructions?.message}
          </p>
        </div>
        <div>
          <Label className="mb-1">Upload Exam Instruction Image<span className="text-blue-500">(optional)</span></Label>
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={handleFileChange}
          />
          {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
          {uploadedFileName && (
            <p className="text-sm text-green-600">Uploaded: {uploadedFileName}</p>
          )}
        </div>
      </div>

      <div className="flex justify-center">
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Submit
        </button>
        <button
          type="button"
          onClick={handleBackNavigation}
          className="px-6 py-2 bg-gray-500 cursor-pointer text-white rounded-md hover:bg-gray-600 transition ml-4"
        >
          Back
        </button>
      </div>
    </form>
  );
}
