import * as yup from "yup";

export const userSchema = yup.object().shape({
  user_id: yup.string().required("User id is required").email("Invalid email format"),
  user_name: yup.string().required("User name is required"),
  user_password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  user_role_id: yup.number().typeError("Role is required").required("Role is required"),

  // user_inst_id: yup.number().nullable(),     // optional
  // user_student_id: yup.number().nullable(),  // optional
  
  user_inst_id: yup.mixed().when("user_role_id", {
    is: (role) => role === 2, // Client role
    then: (schema) => schema.required("Institution is required"),
    otherwise: (schema) => schema.nullable().notRequired(),
  }),

  user_student_id: yup.mixed().when("user_role_id", {
    is: (role) => role === 4, // Student role
    then: (schema) => schema.required("Student ID is required"),
    otherwise: (schema) => schema.nullable().notRequired(),
  }),

  user_create_date: yup.date().required("Create date is required"),
  user_status: yup
    .string()
    .oneOf(["A", "I"], "Status must be Active or Inactive")
    .required("Status is required"),

  user_contact_number_1: yup
    .string()
    .matches(/^[0-9]{10,15}$/, "Contact number must be 10–15 digits")
    .required("Primary contact number is required"),
  user_contact_number_2: yup
  .string()
  .nullable()
  .notRequired()
  .test(
    "is-valid",
    "Contact number must be 10–15 digits",
    (value) => !value || /^[0-9]{10,15}$/.test(value)
  ),
});
