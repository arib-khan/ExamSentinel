import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
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
import { defaultValues, schema } from "./InstitutionFormValidation";
import { useState } from "react";
import {
  createInstitutionProfile,
  deleteInstitutionProfile,
  updateInstitutionProfile,
} from "@/services/InstitutionServices/institutionService";
import { format } from "date-fns";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "@/contexts/PermissionContext";

export default function InstitutionForm({
  mode = "create",
  initialData = null,
  onClose,
}) {
  const { getRoleName } = usePermissions();
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
    defaultValues: defaultValues,
    resolver: yupResolver(schema),
  });

  const [id, setId] = useState(null);

  useEffect(() => {
    if ((isView || isEdit || isDelete) && initialData) {
      reset({
        inst_id: initialData.inst_id,
        inst_name: initialData.inst_name,
        inst_address_line_1: initialData.inst_address_line_1,
        inst_address_line_2: initialData.inst_address_line_2,
        inst_city: initialData.inst_city,
        inst_state: initialData.inst_state,
        inst_zipcode: initialData.inst_zipcode,
        inst_contact_1_name: initialData.inst_contact_1_name,
        inst_contact_1_desig: initialData.inst_contact_1_desig,
        inst_contact_1_email: initialData.inst_contact_1_email,
        inst_contact_1_phone: initialData.inst_contact_1_phone,
        inst_contact_2_name: initialData.inst_contact_2_name,
        inst_contact_2_desig: initialData.inst_contact_2_desig,
        inst_contact_2_email: initialData.inst_contact_2_email,
        inst_contact_2_phone: initialData.inst_contact_2_phone,
        inst_status: initialData.inst_status,
        inst_watermark: initialData.inst_watermark,
        inst_reg_date: format(
          new Date(initialData.inst_reg_date),
          "yyyy-MM-dd"
        ),
      });
      setId(initialData.inst_id);
    }
  }, [initialData, isView, isEdit, isDelete, reset]);

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      inst_reg_date: format(new Date(data.inst_reg_date), "yyyy-MM-dd"),
    };
    try {
      let response;

      if (id) {
        response = await updateInstitutionProfile(id, payload);
      } else {
        response = await createInstitutionProfile(payload);
      }
      if (response.status) {
        setId(response.data.data.inst_id);
        toast.success(
          response.data?.msg || "Institution Details added successfully!"
        );
        if (isDelete || isEdit) {
          onClose();
        }
        if (mode === "create") {
          reset({
            inst_id: "",
            inst_name: "",
            inst_address_line_1: "",
            inst_address_line_2: "",
            inst_city: "",
            inst_state: "",
            inst_zipcode: "",
            inst_contact_1_name: "",
            inst_contact_1_desig: "",
            inst_contact_1_email: "",
            inst_contact_1_phone: "",
            inst_contact_2_name: "",
            inst_contact_2_desig: "",
            inst_contact_2_email: "",
            inst_contact_2_phone: "",
            inst_status: "",
          });
          setId(null);
        }
      } else {
        toast.error(response.data?.msg || "Failed to add institution details");
      }
    } catch (error) {
      toast.error("Error submitting form");
      console.error(error);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await deleteInstitutionProfile(id);
      if (response.status) {
        toast.success(response.data?.msg || "Institute deleted successfully");
        onClose();
      } else {
        toast.error(response.data?.msg || "Failed to delete institute");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred during deletion");
    }
  };

  const handleBackNavigation = () => {
    const role = getRoleName();
    navigate(`/${role}/institution/list`);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="p-6 space-y-8 bg-background shadow rounded-lg max-w-4xl mx-auto"
    >
      {/* Institution Details Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Institution Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="mb-1">Institution Name</Label>
            <Input {...register("inst_name")} disabled={isView || isDelete} />
            <p className="text-sm text-red-500 mt-1">
              {errors.inst_name?.message}
            </p>
          </div>
          <div>
            <Label className="mb-1">Registration Date</Label>
            <Input
              type="date"
              {...register("inst_reg_date")}
              disabled={isView || isDelete}
            />
            <p className="text-sm text-red-500 mt-1">
              {errors.inst_reg_date?.message}
            </p>
          </div>

          <div>
            <Label className="mb-1">Address Line 1</Label>
            <Input
              {...register("inst_address_line_1")}
              disabled={isView || isDelete}
            />
            <p className="text-sm text-red-500 mt-1">
              {errors.inst_address_line_1?.message}
            </p>
          </div>
          <div>
            <Label className="mb-1">Address Line 2</Label>
            <Input
              {...register("inst_address_line_2")}
              disabled={isView || isDelete}
            />
          </div>

          <div>
            <Label className="mb-1">City</Label>
            <Input {...register("inst_city")} disabled={isView || isDelete} />
            <p className="text-sm text-red-500 mt-1">
              {errors.inst_city?.message}
            </p>
          </div>
          <div>
            <Label className="mb-1">State</Label>
            <Input {...register("inst_state")} disabled={isView || isDelete} />
            <p className="text-sm text-red-500 mt-1">
              {errors.inst_state?.message}
            </p>
          </div>

          <div>
            <Label className="mb-1">Zip Code</Label>
            <Input
              {...register("inst_zipcode")}
              disabled={isView || isDelete}
            />
            <p className="text-sm text-red-500 mt-1">
              {errors.inst_zipcode?.message}
            </p>
          </div>

          <div>
            <Label className="mb-1">Status</Label>
            <Controller
              name="inst_status"
              control={control}
              rules={{ required: "Status is required" }}
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
            <p className="text-sm text-red-500 mt-1">
              {errors.inst_status?.message}
            </p>
          </div>
          <div>
            <Label className="mb-1">Institute Watermark Text</Label>
            <Input
              {...register("inst_watermark")}
              disabled={isView || isDelete}
            />
            <p className="text-sm text-red-500 mt-1">
              {errors.inst_watermark?.message}
            </p>
          </div>
        </div>
      </div>

      <hr />

      {/* Primary Contact Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Primary Contact</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="mb-1">Name</Label>
            <Input
              {...register("inst_contact_1_name")}
              disabled={isView || isDelete}
            />
            <p className="text-sm text-red-500 mt-1">
              {errors.inst_contact_1_name?.message}
            </p>
          </div>
          <div>
            <Label className="mb-1">Designation</Label>
            <Input
              {...register("inst_contact_1_desig")}
              disabled={isView || isDelete}
            />
            <p className="text-sm text-red-500 mt-1">
              {errors.inst_contact_1_desig?.message}
            </p>
          </div>
          <div>
            <Label className="mb-1">Email</Label>
            <Input
              type="email"
              {...register("inst_contact_1_email")}
              disabled={isView || isDelete}
            />
            <p className="text-sm text-red-500 mt-1">
              {errors.inst_contact_1_email?.message}
            </p>
          </div>
          <div>
            <Label className="mb-1">Phone</Label>
            <Input
              type="tel"
              {...register("inst_contact_1_phone")}
              disabled={isView || isDelete}
            />
            <p className="text-sm text-red-500 mt-1">
              {errors.inst_contact_1_phone?.message}
            </p>
          </div>
        </div>
      </div>

      {/* Secondary Contact Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Secondary Contact{" "}
          <span className="text-sm text-gray-500">(Optional)</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="mb-1">Name</Label>
            <Input
              {...register("inst_contact_2_name")}
              disabled={isView || isDelete}
            />
            <p className="text-sm text-red-500 mt-1">
              {errors.inst_contact_2_name?.message}
            </p>
          </div>
          <div>
            <Label className="mb-1">Designation</Label>
            <Input
              {...register("inst_contact_2_desig")}
              disabled={isView || isDelete}
            />
            <p className="text-sm text-red-500 mt-1">
              {errors.inst_contact_2_desig?.message}
            </p>
          </div>
          <div>
            <Label className="mb-1">Email</Label>
            <Input
              type="email"
              {...register("inst_contact_2_email")}
              disabled={isView || isDelete}
            />
            <p className="text-sm text-red-500 mt-1">
              {errors.inst_contact_2_email?.message}
            </p>
          </div>
          <div>
            <Label className="mb-1">Phone</Label>
            <Input
              type="tel"
              {...register("inst_contact_2_phone")}
              disabled={isView || isDelete}
            />
            <p className="text-sm text-red-500 mt-1">
              {errors.inst_contact_2_phone?.message}
            </p>
          </div>
        </div>
      </div>
      {mode === "view" && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-gray-500 cursor-pointer text-white rounded-md hover:bg-gray-600 transition"
          >
            Back
          </button>
        </div>
      )}

      {/* Submit Button */}
      {(mode === "create" || mode === "edit") && (
        <div className="flex justify-center gap-2">
          <button
            type="submit"
            className="px-6 py-2  bg-blue-600 text-white rounded-md hover:bg-blue-700 transition cursor-pointer"
          >
            {mode === "create" ? "Create" : "Update"}
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
        <div className="flex justify-center gap-2">
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
                  This action cannot be undone. It will permanently delete this
                  institute.
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
