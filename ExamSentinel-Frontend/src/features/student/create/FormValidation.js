// import * as yup from "yup";
// // ✅ Validation Schema
// export const schema = yup.object().shape({
//   student_exam_id: yup.string().required("Exam is required"),
//   roll_number: yup.string().required("Roll number is required"),
//   name: yup.string().required("Name is required"),
//   email: yup.string().email("Invalid email").required("Email is required"),
//   phone: yup
//     .string()
//     .matches(/^[0-9]{10}$/, "Phone must be 10 digits")
//     .required("Phone is required"),
//   city: yup.string().required("City is required"),
//   state: yup.string().required("State is required"),
//   pincode: yup
//     .string()
//     .required("Pincode is required")
//     .matches(/^[1-9][0-9]{5}$/, "Pincode must be a valid 6-digit number"),

//   address: yup.string().required("Address is required"),
//   is_disabled: yup.string().required("Please select disability options."),
//   date_of_birth: yup
//   .string()
//   .required("Date of Birth is required"),

// adhar_number:yup.string()
//   .nullable()
//   .matches(/^\d{12}$/, "Must be a 12-digit number")
//   .when([], {
//     is: (value) => value === null || value === "",
//     then: (schema) => schema.notRequired(),
//   }),


// Category: yup
//   .string()
//   .required("Category is required"),

// application_numbe: yup
//   .string()
//   .nullable(),

// father_name: yup
//   .string()
//   .required("Father name is required"),

// mother_name: yup
//   .string()
//   .required("Mother name is required"),

// gender: yup
//   .string()
//   .required("Gender is required"),

// address_line_2: yup.string().nullable(),

// alternate_phone_number: yup
//   .string()
//   .matches(/^[0-9]{10}$/, "Alternate phone must be 10 digits")
//   .nullable(),


// });

import * as yup from "yup";

// ✅ Validation Schema
export const schema = yup.object().shape({
  student_exam_id: yup.string().required("Exam is required"),
  roll_number: yup.string().required("Roll number is required"),
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone: yup
    .string()
    .matches(/^[0-9]{10}$/, "Phone must be 10 digits")
    .required("Phone is required"),
  city: yup.string().required("City is required"),
  state: yup.string().required("State is required"),
  pincode: yup
    .string()
    .required("Pincode is required")
    .matches(/^[1-9][0-9]{5}$/, "Pincode must be a valid 6-digit number"),
  address_line_1: yup.string().required("Address is required"),
  is_disabled: yup.string().required("Please select disability options."),
  father_name: yup.string().required("Father name is required"),
  mother_name: yup.string().required("Mother name is required"),
  gender: yup.string().required("Gender is required"),
  Category: yup.string().required("Category is required"),

  password: yup
    .string()
    .when("$isCreateMode", {
      is: true,
      then: (schema) =>
        schema
          .required("Password is required")
          .min(8, "Password must be at least 8 characters"),
      otherwise: (schema) => schema.notRequired(),
    }),

  // ✅ Optional fields - only validate when value is provided
  application_numbe: yup
    .string()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .notRequired(),

  // date_of_birth: yup
  //   .string()
  //   .nullable()
  //   .transform((value) => (value === "" ? null : value))
  //   .notRequired(),

  date_of_birth: yup
  .date()
  .nullable()
  .transform((value, originalValue) =>
    originalValue === "" ? null : value
  )
  .notRequired()
  .test(
    "is-18-plus",
    "Candidate must be at least 18 years old",
    function (value) {
      if (!value) return true; // If empty → pass (optional field)

      const today = new Date();
      const dob = new Date(value);

      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();

      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
      }

      return age >= 18;
    }
  ),

  adhar_number: yup
    .string()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .test(
      "is-valid-aadhar",
      "Aadhar must be a 12-digit number",
      function (value) {
        if (!value) return true; // Allow empty
        return /^\d{12}$/.test(value);
      }
    )
    .notRequired(),

  alternate_phone_number: yup
    .string()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .test(
      "is-valid-phone",
      "Alternate phone must be 10 digits",
      function (value) {
        if (!value) return true; // Allow empty
        return /^[0-9]{10}$/.test(value);
      }
    )
    .notRequired(),

  address_line_2: yup
    .string()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .notRequired(),
});