import * as yup from "yup";

export const userSchema = yup.object().shape({
sys_object_display_name: yup.string().required("System Object name is required").max(45, "System Object name must be at most 45 characters"),
sys_object_name: yup.string().required("System Object system name is required").max(45, "System Object system name must be at most 45 characters"),
});
