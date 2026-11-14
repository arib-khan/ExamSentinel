import * as yup from "yup";

export const userSchema = yup.object().shape({
user_role_name: yup.string().required("User role name is required").max(45, "User role name must be at most 45 characters"),
});
