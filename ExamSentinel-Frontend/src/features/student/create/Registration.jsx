import React, { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { schema } from "./FormValidation";
import {
  createStudentProfile,
  deleteStudentProfile,
  getProfilePhoto,
  updateStudentProfile,
  uploadProfilePhoto,
} from "@/services/StudentServices/studentService";
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
import { ExamCombobox } from "@/components/reusableComponets/select-exam-combox";
import { getExamList } from "@/services/ExamServices/examService";
import { set } from "date-fns";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "@/contexts/PermissionContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function StudentForm({
  mode = "create",
  initialData = null,
  onClose,
}) {
  const { getRoleName } = usePermissions();
  const navigate = useNavigate()
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isDelete = mode === "delete";

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onBlur",
  });

  const [studentId, setStudentId] = useState(null);
  const [examList, setExamList] = useState([]);
  const fileInputRef = useRef(null);

  // ✅ Fetch Exam List
  const fetchExamList = async () => {
    try {
      const examResponse = await getExamList();
      if (Array.isArray(examResponse.data?.data)) {
        setExamList(examResponse.data.data);
      }
    } catch (err) {
      console.error("Error fetching exam list:", err);
      toast.error("Failed to load exams");
    }
  };

  useEffect(() => {
    fetchExamList();
  }, []);

  const [formKey, setFormKey] = useState(0);
  useEffect(() => {
    if ((isEdit || isView || isDelete) && initialData) {

      // Set all values including select fields
      const formValues = {
        roll_number: initialData.roll_number || "",
        name: initialData.name || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        city: initialData.city || "",
        state: initialData.state || "",
        pincode: initialData.pincode || "",
        address_line_1: initialData.address_line_1 || "",
        address_line_2: initialData.address_line_2 || "",
        father_name: initialData.father_name || "",
        mother_name: initialData.mother_name || "",
        gender: initialData.gender || "",
        date_of_birth: initialData.date_of_birth ? initialData.date_of_birth.split('T')[0] : "",
        adhar_number: initialData.adhar_number || "",
        Category: initialData.Category || "",
        alternate_phone_number: initialData.alternate_phone_number || "",
        application_numbe: initialData.application_numbe || "",
        is_disabled: initialData.is_disabled || "",
        student_exam_id: initialData.student_exam_id || "",
      };

      // Use setTimeout to ensure Select components are mounted
      setTimeout(() => {
        reset(formValues);
        setFormKey(prev => prev + 1); // Force remount
      }, 0);

      setStudentId(initialData.id);

      // Fetch profile photo if exists
      if (initialData.student_picture && initialData.student_exam_id) {
        fetchProfilePhoto(initialData.student_picture, initialData.student_exam_id);
        setUploadedFileName(initialData.student_picture);
        setValue("student_picture", initialData.student_picture, { shouldValidate: true });
      }
    }
  }, [mode, initialData, isEdit, isView, isDelete, reset, setValue]);

  const [uploading, setUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState(null);
  const [studentImage, setStudentImage] = useState(null);

  const fetchProfilePhoto = async (fileName, id) => {
    console.log(fileName, id);

    try {
      const res = await getProfilePhoto({ student_picture: fileName, exam_id: id });

      if (res.status === 200) {
        const blob = res.data;
        const imgUrl = URL.createObjectURL(blob);
        setStudentImage(imgUrl);
      } else {
        toast.error("Unable to fetch profile photo");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error fetching profile photo");
    }
  };

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
      formData.append("student_picture", file);

      const res = await uploadProfilePhoto(formData);

      if (res.data?.status) {
        toast.success("Profile photo uploaded!");
        setUploadedFileName(res.data.filename);

        // ✅ inject the filename into your form (so it will be sent with form submit)
        setValue("student_picture", res.data.filename, { shouldValidate: true });
        fetchProfilePhoto(res.data.filename);

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
    setValue("student_picture", "", { shouldValidate: true });
    setStudentImage(null);

  };

  const onSubmit = async (data) => {
    try {
      let response;
      if (studentId && isEdit) {
        response = await updateStudentProfile(studentId, data);
      } else {
        response = await createStudentProfile(data);
      }

      if (response.status) {
        toast.success(
          response.data?.msg ||
          `Student ${isEdit ? "updated" : "created"} successfully!`
        );
        if (mode === "create") {
          reset({
            roll_number: "",
            name: "",
            email: "",
            phone: "",
            // password: "",
            password: "",
            address_line_1: "",
            city: "",
            state: "",
            pincode: "",
            student_picture: "",
            student_exam_id: "",
          });

          setStudentId(null);

          clearFileInput();
        }
        onClose?.();
      } else {
        toast.error("Operation failed.");
      }
    } catch (error) {
      console.error(error);
      // toast.error("An error occurred while submitting.");
    }
  };

  const handleDelete = async () => {
    try {
      const response = await deleteStudentProfile(studentId);
      if (response.status) {
        toast.success("Student deleted successfully");
        onClose?.();
      } else {
        toast.error("Failed to delete student");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred during deletion");
    }
  };

  const handleBackNavigation = () => {
    const role = getRoleName();
    navigate(`/${role}/students/list`);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="p-6 space-y-8 bg-background shadow rounded-lg max-w-3xl mx-auto"
    >
      <div className="flex justify-between mb-6">
        <h2 className="text-xl font-semibold mb-4">
          {isEdit
            ? "Edit Candidate"
            : isView
              ? "View Candidate"
              : isDelete
                ? "Delete Candidate"
                : "Register Candidate"}
        </h2>

        <div>
          {studentImage ? (
            <img
              src={studentImage}
              alt="Student Profile"
              className="w-24 h-24 rounded-md object-cover border"
            />
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Roll Number */}
        <div>
          <Label className="mb-1">Roll Number</Label>
          <Input disabled={isView || isDelete} {...register("roll_number")} />
          <p className="text-sm text-red-500">{errors.roll_number?.message}</p>
        </div>

        {/* Application Number */}
        <div>
          <Label className="mb-1">Application Number</Label>
          <Input disabled={isView || isDelete} {...register("application_numbe")} />
          <p className="text-sm text-red-500">{errors.application_numbe?.message}</p>
        </div>

        {/* Name */}
        <div>
          <Label className="mb-1">Name</Label>
          <Input disabled={isView || isDelete} {...register("name")} />
          <p className="text-sm text-red-500">{errors.name?.message}</p>
        </div>

        {/* Email */}
        <div>
          <Label className="mb-1">Email</Label>
          <Input type="email" disabled={isView || isDelete} {...register("email")} />
          <p className="text-sm text-red-500">{errors.email?.message}</p>
        </div>

        {/* Father Name */}
        <div>
          <Label className="mb-1">Father Name</Label>
          <Input disabled={isView || isDelete} {...register("father_name")} />
          <p className="text-sm text-red-500">{errors.father_name?.message}</p>
        </div>

        {/* Mother Name */}
        <div>
          <Label className="mb-1">Mother Name</Label>
          <Input disabled={isView || isDelete} {...register("mother_name")} />
          <p className="text-sm text-red-500">{errors.mother_name?.message}</p>
        </div>

        {/* Gender */}
        <div key={`gender-${formKey}`}>
          <Label className="mb-1">Gender</Label>
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <Select
                disabled={isView || isDelete}
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          <p className="text-sm text-red-500">{errors.gender?.message}</p>
        </div>


        {/* Date of Birth */}
        <div>
          <Label className="mb-1">Date of Birth</Label>
          <Input type="date" disabled={isView || isDelete} {...register("date_of_birth")} />
          <p className="text-sm text-red-500">{errors.date_of_birth?.message}</p>
        </div>

        {/* Aadhar Number */}
        <div>
          <Label className="mb-1">Aadhar Number</Label>
          <Input type="text" disabled={isView || isDelete} {...register("adhar_number")} />
          <p className="text-sm text-red-500">{errors.adhar_number?.message}</p>
        </div>

        <div key={`category-${formKey}`}>
          <Label className="mb-1">Category</Label>
          <Controller
            name="Category"
            control={control}
            render={({ field }) => (
              <Select
                disabled={isView || isDelete}
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="OBC">OBC</SelectItem>
                  <SelectItem value="SC">SC</SelectItem>
                  <SelectItem value="ST">ST</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          <p className="text-sm text-red-500">{errors.Category?.message}</p>
        </div>


        {/* Disability */}
        <div key={`disabled-${formKey}`}>
          <Label className="mb-1">Disability</Label>
          <Controller
            name="is_disabled"
            control={control}
            render={({ field }) => (
              <Select
                disabled={isView || isDelete}
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Disability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Y">Yes</SelectItem>
                  <SelectItem value="N">No</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          <p className="text-sm text-red-500">{errors.is_disabled?.message}</p>
        </div>
        {/* Phone */}
        <div>
          <Label className="mb-1">Phone</Label>
          <Input type="tel" disabled={isView || isDelete} {...register("phone")} />
          <p className="text-sm text-red-500">{errors.phone?.message}</p>
        </div>

        {/* Alternate Phone */}
        <div>
          <Label className="mb-1">Alternate Phone Number</Label>
          <Input disabled={isView || isDelete} {...register("alternate_phone_number")} />
          <p className="text-sm text-red-500">{errors.alternate_phone_number?.message}</p>
        </div>

        {/* City */}
        <div>
          <Label className="mb-1">City</Label>
          <Input type="text" disabled={isView || isDelete} {...register("city")} />
          <p className="text-sm text-red-500">{errors.city?.message}</p>
        </div>

        {/* State */}
        <div>
          <Label className="mb-1">State</Label>
          <Input type="text" disabled={isView || isDelete} {...register("state")} />
          <p className="text-sm text-red-500">{errors.state?.message}</p>
        </div>

        {/* Pincode */}
        <div>
          <Label className="mb-1">Pincode</Label>
          <Input type="number" disabled={isView || isDelete} {...register("pincode")} />
          <p className="text-sm text-red-500">{errors.pincode?.message}</p>
        </div>



        {/* Exam Select */}
        <div key={`student_exam_id-${formKey}`}>
          <Label className="mb-1">Select Exam</Label>
          <Controller
            name="student_exam_id"
            control={control}
            render={({ field }) => (
              <ExamCombobox
                exams={examList}
                selectedId={field.value}
                disabled={isView || isDelete}
                setExamId={(val) => setValue("student_exam_id", val)}
              />
            )}
          />
          <p className="text-sm text-red-500">{errors.student_exam_id?.message}</p>
        </div>

        {mode === "create" && (
          <div>
            <Label className="mb-1">Password</Label>
            <Input
              type="password"
              {...register("password")}
              placeholder="Enter password"
            />
            <p className="text-sm text-red-500">{errors.password?.message}</p>
          </div>
        )}

        {/* Upload Photo */}
        <div>
          <Label className="mb-1">Upload Profile Photo</Label>
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            disabled={isView || isDelete || uploading}
            onChange={handleFileChange}
          />
          {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
          {uploadedFileName && (
            <p className="text-sm text-green-600">Uploaded: {uploadedFileName}</p>
          )}
        </div>

        {/* Address Full */}
        <div className="md:col-span-1">
          <Label className="mb-1">Address</Label>
          <Textarea rows={1} disabled={isView || isDelete} {...register("address_line_1")} />
          <p className="text-sm text-red-500">{errors.address_line_1?.message}</p>
        </div>
        {/* Address Line 2 */}
        <div>
          <Label className="mb-1">Address Line 2</Label>
          <Textarea rows={1} disabled={isView || isDelete} {...register("address_line_2")} />
          <p className="text-sm text-red-500">{errors.address_line_2?.message}</p>
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
        <div className="flex justify-center gap-4">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600  cursor-pointer text-white rounded-md hover:bg-blue-700 transition"
          >
            {mode === "create" ? "Register" : "Update"}
          </button>


          <button
            type="button"
            onClick={mode === "create" ? handleBackNavigation : onClose}
            className="px-6 py-2 bg-gray-500 cursor-pointer text-white rounded-md hover:bg-gray-600 transition"
          >
            Back
          </button>
        </div>
      )}

      {mode === "delete" && (
        <div className="flex justify-center">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="px-6 py-2 bg-red-600 cursor-pointer text-white rounded-md hover:bg-red-700 transition">
                Confirm Delete
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Confirmation</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this student record?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <div className="ml-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-500 cursor-pointer text-white rounded-md hover:bg-gray-600 transition"
            >
              Back
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
