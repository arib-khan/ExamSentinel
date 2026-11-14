// examStudentApp.jsx
import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { toast } from "sonner";
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
import { SkeletonCard } from "@/components/reusableComponets/LoadingState";
import { schema, defaultValues } from "./FormValidation";
import {
  createExamStudentMap,
  deleteExamStudentMap,
  updateExamStudentMap,
} from "@/services/MappingServices/mappingServices";
import { InstitutionCombobox } from "@/components/reusableComponets/select-institute-combox";
import { ExamCombobox } from "@/components/reusableComponets/select-exam-combox";
import { getInstitutionList } from "@/services/InstitutionServices/institutionService";
import { getExamList } from "@/services/ExamServices/examService";
import { CenterCombobox } from "@/components/reusableComponets/select-centre-combobox";
import { StudentCombobox } from "@/components/reusableComponets/select-student-combobox";

// 🔥 Import your new Centre and Student APIs
import { getCenterList, getCenterLists } from "@/services/CenterServices/centerServices";
import { getStudentList } from "@/services/StudentServices/studentService"; // ✅ New
import { useNavigate } from "react-router-dom";

export default function ExamStudentMapForm({
  mode = "create",
  initialData = null,
  onClose,
}) {
  const navigate = useNavigate();
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
    defaultValues,
    resolver: yupResolver(schema),
  });

  const [loading, setLoading] = useState(false);
  const [mapId, setMapId] = useState(null);
  const [instID, setInstId] = useState(null);
  const [examID, setExamId] = useState(null);

  // 🔥 Added new states for Centre and Student
  const [centreID, setCentreId] = useState(null); // ✅ New
  const [studentID, setStudentId] = useState(null); // ✅ New
  const [institute, setInstitute] = useState([]);
  const [examList, setExamList] = useState([]);
  const [centreList, setCentreList] = useState([]); // ✅ New
  const [studentList, setStudentList] = useState([]); // ✅ New

  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 🔥 Fetch all lists in parallel
        const [instResponse, examResponse, centreResponse, studentResponse] =
          await Promise.all([
            getInstitutionList(),
            getExamList(),
            getCenterLists(), // ✅ New
            getStudentList(), // ✅ New
          ]);

        if (Array.isArray(instResponse.data?.result)) {
          setInstitute(instResponse.data.result);
        }
        if (Array.isArray(examResponse.data?.data)) {
          setExamList(examResponse.data.data);
        }
        if (Array.isArray(centreResponse.data?.data)) {
          setCentreList(centreResponse.data.data); // ✅ New
        }
        if (Array.isArray(studentResponse.data?.data?.result)) {
          setStudentList(studentResponse.data.data.result); // ✅ New

        }

        if ((isEdit || isView || isDelete) && initialData) {
          reset({
            iecsm_inst_id: initialData.iecsm_inst_id,
            iecsm_exam_id: initialData.iecsm_exam_id,
            iecsm_centre_id: initialData.iecsm_centre_id,
            iecsm_student_id: initialData.iecsm_student_id,
            iecsm_room_name: initialData.iecsm_room_name,
            iecsm_seat_num: initialData.iecsm_seat_num,
            iecsm_date: format(new Date(initialData.iecsm_date), "yyyy-MM-dd"),
            iecsm_start_time: format(
              new Date(initialData.iecsm_start_time),
              "yyyy-MM-dd'T'HH:mm"
            ),
            iecsm_end_time: format(
              new Date(initialData.iecsm_end_time),
              "yyyy-MM-dd'T'HH:mm"
            ),
          });
          setMapId(initialData.iecsm_id);
          setExamId(initialData.iecsm_exam_id);

          // 🔥 Set centreID and studentID state from initialData
          setCentreId(initialData.iecsm_centre_id); // ✅ New
          setStudentId(initialData.iecsm_student_id); // ✅ New
        }
      } catch (err) {
        console.error("Error fetching:", err);
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [initialData, isView, isEdit, isDelete, reset]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        iecsm_date: format(new Date(data.iecsm_date), "yyyy-MM-dd"),
        iecsm_start_time: format(
          new Date(data.iecsm_start_time),
          "yyyy-MM-dd'T'HH:mm"
        ),
        iecsm_end_time: format(
          new Date(data.iecsm_end_time),
          "yyyy-MM-dd'T'HH:mm"
        ),
      };

      let response;
      if (mapId) {
        response = await updateExamStudentMap(mapId, payload);
      } else {
        response = await createExamStudentMap(payload);
      }

      if (response.status) {
        toast.success("Mapping saved successfully");
        if (isEdit || isDelete) {
          onClose();
        }
      } else {
        toast.error("Failed to save mapping");
      }
    } catch (err) {
      console.error(err);
      toast.error("Submission failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await deleteExamStudentMap(mapId);
      if (response.status) {
        toast.success("Mapping deleted successfully");
        onClose();
      } else {
        toast.error("Failed to delete mapping");
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
      className="p-6 space-y-6 bg-background shadow rounded-lg max-w-3xl mx-auto"
    >
      <h2 className="text-xl font-semibold mb-4">Mapping Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label className="mb-2">Select Institution Name</Label>
          <InstitutionCombobox
            institutions={institute}
            setInstId={(val) => {
              setInstId(val);
              reset((prev) => ({ ...prev, iecsm_inst_id: val }));
            }}
            selectedId={instID}
            disabled={isView || isDelete}
          />
          <p className="text-sm text-red-500">
            {errors.iecsm_inst_id?.message}
          </p>
        </div>

        <div>
          <Label className="mb-2">Select Exam</Label>
          <ExamCombobox
            exams={examList}
            setExamId={(val) => {
              setExamId(val);
              reset((prev) => ({ ...prev, iecsm_exam_id: val }));
            }}
            selectedId={examID}
            disabled={isView || isDelete}
          />
          <p className="text-sm text-red-500">
            {errors.iecsm_exam_id?.message}
          </p>
        </div>

        {/* 🔥 New Centre selection using CenterCombobox */}
        <div>
          <Label className="mb-2">Select Centre</Label>
          <CenterCombobox
            centers={centreList}
            setCentreId={(val) => {
              setCentreId(val);
              reset((prev) => ({ ...prev, iecsm_centre_id: val }));
            }}
            selectedId={centreID}
            disabled={isView || isDelete}
          />
          <p className="text-sm text-red-500">
            {errors.iecsm_centre_id?.message}
          </p>
        </div>

        {/* 🔥 New Student selection - replacing old Input for student id */}
        <div>
          <Label className="mb-2">Select Student</Label>
          <StudentCombobox
            students={studentList}
            setStudentId={(val) => {
              setStudentId(val);
              reset((prev) => ({ ...prev, iecsm_student_id: val }));
            }}
            selectedId={studentID}
            disabled={isView || isDelete}
          />
          <p className="text-sm text-red-500">
            {errors.iecsm_student_id?.message}
          </p>
        </div>

        <div>
          <Label className="mb-1">Room Name</Label>
          <Input
            {...register("iecsm_room_name")}
            disabled={isView || isDelete}
          />
          <p className="text-sm text-red-500">
            {errors.iecsm_room_name?.message}
          </p>
        </div>

        <div>
          <Label className="mb-1">Seat Number</Label>
          <Input
            {...register("iecsm_seat_num")}
            disabled={isView || isDelete}
          />
          <p className="text-sm text-red-500">
            {errors.iecsm_seat_num?.message}
          </p>
        </div>

        <div>
          <Label className="mb-1">Date</Label>
          <Input
            type="date"
            {...register("iecsm_date")}
            disabled={isView || isDelete}
          />
          <p className="text-sm text-red-500">{errors.iecsm_date?.message}</p>
        </div>

        <div>
          <Label className="mb-1">Start Time</Label>
          <Input
            type="datetime-local"
            {...register("iecsm_start_time")}
            disabled={isView || isDelete}
          />
          <p className="text-sm text-red-500">
            {errors.iecsm_start_time?.message}
          </p>
        </div>

        <div>
          <Label className="mb-1">End Time</Label>
          <Input
            type="datetime-local"
            {...register("iecsm_end_time")}
            disabled={isView || isDelete}
          />
          <p className="text-sm text-red-500">
            {errors.iecsm_end_time?.message}
          </p>
        </div>
      </div>

      {(mode === "create" || mode === "edit") && (
        <div className="flex justify-center">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            {mode === "create" ? "Create" : "Update"}
          </button>
          {mode === "create" && (
            <button
              type="button"
              className="px-6 py-2 ml-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
              onClick={() => navigate("/admin/exams/list")}
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
              <button className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition">
                Confirm Delete
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  this mapping.
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
    </form>
  );
}
