import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { userSchema } from "./FormValidation";
import { InstitutionCombobox } from "@/components/reusableComponets/select-institute-combox";
import { getInstitutionList } from "@/services/InstitutionServices/institutionService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createUserProfile, getUserRolesList, updateUserProfile } from "@/services/UserManagementServices/userService";
import { UserRoleCombobox } from "@/components/reusableComponets/select-userrole-combox";
import { StudentCombobox } from "@/components/reusableComponets/select-student-combobox";
import { getStudentList } from "@/services/StudentServices/studentService";
import { useNavigate } from "react-router-dom";

export default function UserForm({ mode = "create", initialData = null, onClose, enable = false }) {
  const navigate = useNavigate();
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isDelete = mode === "delete";

  const {
    control,
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(userSchema),
    defaultValues: {
      user_id: "",
      user_name: "",
      user_password: "",
      user_role_id: "",
      user_inst_id: null,
      user_student_id: null,
      user_create_date: new Date().toISOString().slice(0, 10), // default today
      user_status: "A",
      user_contact_number_1: "",
      user_contact_number_2: "",
    },
  });

  const [userId, setUserId] = useState(null);

  // load initial data (for edit/view/delete)
  useEffect(() => {
    if (initialData) {
      const formattedData = {
        ...initialData,
        user_create_date: initialData.user_create_date
          ? initialData.user_create_date.slice(0, 10) // take only YYYY-MM-DD
          : new Date().toISOString().slice(0, 10),   // fallback to today
      };
      reset(formattedData);
      setUserId(initialData.user_id);
    }
  }, [initialData, reset]);


  const onSubmit = async (data) => {
    const formData = {
      ...data,
      user_create_date: new Date(data.user_create_date).toISOString().slice(0, 10), // only date
    };

    try {
      let response;
      if (userId && isEdit) {
        response = await updateUserProfile(userId, formData);
      } else {
        response = await createUserProfile(formData);
      }

      if (response.status) {
        toast.success(
          response.data?.msg ||
          `User ${isEdit ? "updated" : "created"} successfully!`
        );
        if (mode === "create") {
          reset({
            user_id: "",
            user_name: "",
            user_password: "",
            user_role_id: "",
            user_inst_id: null,
            user_student_id: null,
            user_create_date: new Date().toISOString().slice(0, 10), // default today
            user_status: "A",
            user_contact_number_1: "",
            user_contact_number_2: "",
          });

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

  const [institutionList, setInstitutionList] = useState([]);
  const [roleList, setRoleList] = useState([]);
  const [studentList, setStudentList] = useState([]);


  const fetchInstitute = async () => {
    try {
      const instResponse = await getInstitutionList();
      if (Array.isArray(instResponse.data?.result)) {
        setInstitutionList(instResponse.data.result);
      }

      const roleResponse = await getUserRolesList();
      if (Array.isArray(roleResponse.data?.result)) {
        setRoleList(roleResponse.data.result);
      }

      const studentResponse = await getStudentList();
      if (Array.isArray(studentResponse.data?.result)) {
        setStudentList(studentResponse.data.result);
      }
    } catch (err) {
      console.error("Error fetching exam list:", err);
      toast.error("Failed to load exams");
    }
  };

  useEffect(() => {
    fetchInstitute();
  }, []);

  // Clear dependent fields when role changes
  useEffect(() => {
    const roleId = watch("user_role_id");

    if (roleId !== 2) {
      setValue("user_inst_id", null);   // clear institute if not role=2
    }

    if (roleId !== 4) {
      setValue("user_student_id", null); // clear student if not role=4
    }
  }, [watch("user_role_id"), setValue]);


  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="p-6 space-y-6 bg-background shadow rounded-lg max-w-3xl mx-auto"
    >
      <h2 className="text-xl font-semibold">
        {isEdit ? "Edit User" : isView ? "View User" : isDelete ? "Delete User" : "Register User"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Mail */}
        <div>
          <Label className="mb-1">User Id</Label>
          <Input disabled={isView || isDelete} {...register("user_id")} />
          <p className="text-sm text-red-500">{errors.user_id?.message}</p>
        </div>

        {/* User Name */}
        <div>
          <Label className="mb-1">User Name</Label>
          <Input disabled={isView || isDelete} {...register("user_name")} />
          <p className="text-sm text-red-500">{errors.user_name?.message}</p>
        </div>

        {enable ? null :
          (
            <div>
              <Label className="mb-1">Password</Label>
              <Input type="password" disabled={isView || isDelete} {...register("user_password")} />
              <p className="text-sm text-red-500">{errors.user_password?.message}</p>
            </div>)}


        <div>
          <Label className="mb-1">Select Role Name</Label>
          <Controller
            name="user_role_id"
            control={control}
            render={({ field }) => (
              <UserRoleCombobox
                roles={roleList}
                selectedId={field.value}
                disabled={isView || isDelete}
                setRoleId={(val) => setValue("user_role_id", val)}
              />
            )}
          />
          {errors.user_role_id && (
            <p className="text-sm text-red-500">{errors.user_role_id.message}</p>
          )}
        </div>

        {/* Institute ID (optional combobox later) */}
        {watch("user_role_id") === 2 && (
          <div>
            <Label className="mb-1">Select Institute Name</Label>
            <Controller
              name="user_inst_id"
              control={control}
              render={({ field }) => (
                <InstitutionCombobox
                  institutions={institutionList}
                  selectedId={field.value}
                  disabled={isView || isDelete}
                  setInstId={(val) => setValue("user_inst_id", val)}
                />
              )}
            />
            {errors.user_inst_id && (
              <p className="text-sm text-red-500">{errors.user_inst_id.message}</p>
            )}
          </div>
        )}

        {/* Student ID */}
        {watch("user_role_id") === 4 && (
          <div>
            <Label className="mb-1">Select Student Name</Label>
            <Controller
              name="user_student_id"
              control={control}
              render={({ field }) => (
                <StudentCombobox
                  students={studentList}
                  selectedId={field.value}
                  disabled={isView || isDelete}
                  setStudentId={(val) => setValue("user_student_id", val)}
                />
              )}
            />
            {errors.user_student_id && (
              <p className="text-sm text-red-500">{errors.user_student_id.message}</p>
            )}
          </div>
        )}


        {/* Create Date */}
        <div>
          <Label className="mb-1">Create Date</Label>
          <Input type="date" disabled={isView || isDelete} {...register("user_create_date")} />
          <p className="text-sm text-red-500">{errors.user_create_date?.message}</p>
        </div>

        {/* Status */}

        <div>
          <Label className="mb-1">Status</Label>
          <Controller
            name="user_status"
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
            {errors.user_status?.message}
          </p>
        </div>

        {/* Contact 1 */}
        <div>
          <Label className="mb-1">Contact Number 1</Label>
          <Input disabled={isView || isDelete} {...register("user_contact_number_1")} />
          <p className="text-sm text-red-500">{errors.user_contact_number_1?.message}</p>
        </div>

        {/* Contact 2 */}
        <div>
          <Label className="mb-1">Contact Number 2</Label>
          <Input disabled={isView || isDelete} {...register("user_contact_number_2")} />
          <p className="text-sm text-red-500">{errors.user_contact_number_2?.message}</p>
        </div>
      </div>

      {/* Action Buttons */}
      {(mode === "create" || mode === "edit") && (
        <div className="flex justify-center gap-4">
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-md">
            {isEdit ? "Update" : "Register"}
          </button>
          {
            enable ? null : <button type="button"
              onClick={mode === "create" ? () => navigate("/admin/user-managment") : onClose}
              className="px-6 py-2 bg-gray-500 text-white rounded-md">
              Back
            </button>
          }
        </div>
      )}

      {mode === "view" && (
        <div className="flex justify-center">
          <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-500 text-white rounded-md">
            Back
          </button>
        </div>
      )}

      {mode === "delete" && (
        <div className="flex justify-center gap-4">
          <button type="button" className="px-6 py-2 bg-red-600 text-white rounded-md">
            Confirm Delete
          </button>
          <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-500 text-white rounded-md">
            Back
          </button>
        </div>
      )}
    </form>
  );
}
