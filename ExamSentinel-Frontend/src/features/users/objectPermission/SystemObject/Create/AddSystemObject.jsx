import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { userSchema } from "./FormValidation";
import { createUserRole, updateUserRole } from "@/services/UserManagementServices/userService";
import { useNavigate } from "react-router-dom";
import { addSystemObjectName } from "@/services/PermissionServices/objectPermision";

export default function AddSystemObject({ mode = "create", initialData = null, onClose }) {
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
            sys_object_display_name: "",
            sys_object_name: "",
        },
    });

    const [userId, setUserId] = useState(null);

    // load initial data (for edit/view/delete)
    useEffect(() => {
        if (initialData) {
            reset(initialData);
            setUserId(initialData.sys_object_display_name);
        }
    }, [initialData, reset]);

    useEffect(() => {
        const displayName = watch("sys_object_display_name");

        if (displayName) {
            const systemName = displayName
                .trim()
                .toLowerCase()
                .replace(/\s+/g, "_"); // replace spaces with underscores

            setValue("sys_object_name", systemName);
        } else {
            setValue("sys_object_name", "");
        }
    }, [watch("sys_object_display_name"), setValue]);





    const onSubmit = async (data) => {

        try {

            const response = await addSystemObjectName(data);

            if (response.status) {
                toast.success(
                    response.data?.msg ||
                    `User ${isEdit ? "updated" : "created"} successfully!`
                );
                if (mode === "create") {
                    reset({
                        sys_object_display_name: "",
                        sys_object_name: "",
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



    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="p-6 space-y-6 bg-background shadow rounded-lg max-w-3xl mx-auto"
        >
            <h2 className="text-xl font-semibold">
                {isEdit ? "Edit User" : isView ? "View System Object" : isDelete ? "Delete System Object" : "Create System Object"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* User Name */}
                <div>
                    <Label className="mb-1">System Object Display Name</Label>
                    <Input disabled={isView || isDelete} {...register("sys_object_display_name")} />
                    <p className="text-sm text-red-500">{errors.sys_object_display_name?.message}</p>
                </div>
                <div>
                    <Label className="mb-1">System Object Name (System Name)</Label>
                    <Input readOnly {...register("sys_object_name")} />
                    <p className="text-sm text-red-500">{errors.sys_object_name?.message}</p>
                </div>
            </div>


            {/* Action Buttons */}
            {(mode === "create" || mode === "edit") && (
                <div className="flex justify-center gap-4">
                    <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-md">
                        {isEdit ? "Update" : "Create"}
                    </button>
                    <button type="button" onClick={mode === "create" ? () => navigate("/admin/system-objects/list") : onClose} className="px-6 py-2 bg-gray-500 text-white rounded-md">
                        Back
                    </button>
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
