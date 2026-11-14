import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { defaultValues, schema } from "./CentreFormValidation";
import {
  createCentreProfile,
  updateCentreProfile,
  deleteCentreProfile,
} from "@/services/CenterServices/centerServices";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

export default function CentreForm({
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

  const [id, setId] = useState(null);

  useEffect(() => {
    if ((isView || isEdit || isDelete) && initialData) {
      reset({
        centre_id: initialData.centre_id,
        centre_name: initialData.centre_name,
        centre_email: initialData.centre_email,
        centre_phone: initialData.centre_phone,
        centre_address_line_1: initialData.centre_address_line_1,
        centre_address_line_2: initialData.centre_address_line_2,
        centre_city: initialData.centre_city,
        centre_state: initialData.centre_state,
        centre_zipcode: initialData.centre_zipcode,
        centre_contact_1_name: initialData.centre_contact_1_name,
        centre_contact_1_email: initialData.centre_contact_1_email,
        centre_contact_1_phone: initialData.centre_contact_1_phone,
        centre_contact_2_name: initialData.centre_contact_2_name,
        centre_contact_2_email: initialData.centre_contact_2_email,
        centre_contact_2_phone: initialData.centre_contact_2_phone,
      });
      setId(initialData.centre_id);
    }
  }, [initialData, isView, isEdit, isDelete, reset]);

  const onSubmit = async (data) => {
    try {
      let response;

      if (id && (isEdit || isDelete)) {
        response = await updateCentreProfile(id, data);
      } else {
        response = await createCentreProfile(data);
      }

      if (response.status) {
        setId(response.data.data.centre_id);
        toast.success(
          response.data?.msg || "Centre details saved successfully!"
        );
        if (isEdit || isDelete) onClose?.();

        if (mode === "create") {
          reset({
            centre_id: "",
            centre_name: "",
            centre_email: "",
            centre_phone: "",
            centre_address_line_1: "",
            centre_address_line_2: "",
            centre_city: "",
            centre_state: "",
            centre_zipcode: "",
            centre_contact_1_name: "",
            centre_contact_1_email: "",
            centre_contact_1_phone: "",
            centre_contact_2_name: "",
            centre_contact_2_email: "",
            centre_contact_2_phone: "",
          });
          setId(null);
        }
      } else {
        toast.error(response.data?.msg || "Failed to save centre details");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong!");
    }
  };

  const handleDelete = async () => {
    try {
      const response = await deleteCentreProfile(id);
      if (response.status) {
        toast.success(response.data?.msg || "Centre deleted successfully");
        onClose?.();
      } else {
        toast.error(response.data?.msg || "Failed to delete centre");
      }
    } catch (error) {
      toast.error("An error occurred during deletion");
      console.error(error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="p-6 space-y-8 bg-background shadow rounded-lg max-w-4xl mx-auto"
    >
      {/* Centre Details */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Centre Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="mb-1">Centre Name</Label>
            <Input {...register("centre_name")} disabled={isView || isDelete} />
            <p className="text-sm text-red-500">
              {errors.centre_name?.message}
            </p>
          </div>
          <div>
            <Label className="mb-1">Email</Label>
            <Input
              type="email"
              {...register("centre_email")}
              disabled={isView || isDelete}
            />
            <p className="text-sm text-red-500">
              {errors.centre_email?.message}
            </p>
          </div>
          <div>
            <Label className="mb-1">Phone</Label>
            <Input
              {...register("centre_phone")}
              disabled={isView || isDelete}
            />
            <p className="text-sm text-red-500">
              {errors.centre_phone?.message}
            </p>
          </div>
          <div>
            <Label className="mb-1">Address Line 1</Label>
            <Input
              {...register("centre_address_line_1")}
              disabled={isView || isDelete}
            />
            <p className="text-sm text-red-500">
              {errors.centre_address_line_1?.message}
            </p>
          </div>
          <div>
            <Label className="mb-1">Address Line 2</Label>
            <Input
              {...register("centre_address_line_2")}
              disabled={isView || isDelete}
            />
          </div>
          <div>
            <Label className="mb-1">City</Label>
            <Input {...register("centre_city")} disabled={isView || isDelete} />
            <p className="text-sm text-red-500">
              {errors.centre_city?.message}
            </p>
          </div>
          <div>
            <Label className="mb-1">State</Label>
            <Input
              {...register("centre_state")}
              disabled={isView || isDelete}
            />
            <p className="text-sm text-red-500">
              {errors.centre_state?.message}
            </p>
          </div>
          <div>
            <Label className="mb-1">Zipcode</Label>
            <Input
              {...register("centre_zipcode")}
              disabled={isView || isDelete}
            />
            <p className="text-sm text-red-500">
              {errors.centre_zipcode?.message}
            </p>
          </div>
        </div>
      </div>

      {/* Contacts */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Primary Contact</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="mb-1">Name</Label>
            <Input
              {...register("centre_contact_1_name")}
              disabled={isView || isDelete}
            />
            <p className="text-sm text-red-500">
              {errors.centre_contact_1_name?.message}
            </p>
          </div>
          <div>
            <Label className="mb-1">Email</Label>
            <Input
              type="email"
              {...register("centre_contact_1_email")}
              disabled={isView || isDelete}
            />
            <p className="text-sm text-red-500">
              {errors.centre_contact_1_email?.message}
            </p>
          </div>
          <div>
            <Label className="mb-1">Phone</Label>
            <Input
              {...register("centre_contact_1_phone")}
              disabled={isView || isDelete}
            />
            <p className="text-sm text-red-500">
              {errors.centre_contact_1_phone?.message}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">
          Secondary Contact (Optional)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="mb-1">Name</Label>
            <Input
              {...register("centre_contact_2_name")}
              disabled={isView || isDelete}
            />
          </div>
          <div>
            <Label className="mb-1">Email</Label>
            <Input
              type="email"
              {...register("centre_contact_2_email")}
              disabled={isView || isDelete}
            />
          </div>
          <div>
            <Label className="mb-1">Phone</Label>
            <Input
              {...register("centre_contact_2_phone")}
              disabled={isView || isDelete}
            />
          </div>
        </div>
      </div>

      {/* Submit or Delete */}
      {isView ? (
        <div className="flex justify-center mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 ml-4"
          >
            Back
          </button>
        </div>
      ) : null}

      {isEdit || mode === "create" ? (
        <div className="flex justify-center mt-6">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {isEdit ? "Update" : "Submit"}
          </button>

          <button
            type="button"
            onClick={mode === "create" ? () => navigate("/admin/center/list") : onClose}
            className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 ml-4"
          >
            Back
          </button>
        </div>
      ) : null}

      <div className="flex justify-center mt-6">
        {isDelete ? (
          <>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700">
                  Delete
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. Do you really want to delete
                    this centre?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Yes, Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <div>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 ml-4"
              >
                Back
              </button>
            </div>
          </>
        ) : null}
      </div>
    </form>
  );
}
