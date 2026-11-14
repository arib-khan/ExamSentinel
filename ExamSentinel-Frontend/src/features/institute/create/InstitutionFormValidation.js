import * as yup from "yup";
// Yup Validation Schema
export const schema = yup.object().shape({
  inst_name: yup.string().required("Institution name is required"),
  inst_address_line_1: yup.string().required("Address Line 1 is required"),
  inst_address_line_2: yup.string(),
  inst_city: yup.string().required("City is required"),
  inst_state: yup.string().required("State is required"),
  inst_zipcode: yup.string().matches(/^\d{4,10}$/, "Invalid Zip Code"),

  inst_contact_1_name: yup
    .string()
    .required("Primary contact name is required"),
  inst_contact_1_desig: yup.string().required("Designation is required"),
  inst_contact_1_email: yup
  .string()
    .email("Invalid email")
    .required("Email is required"),
  inst_contact_1_phone: yup
  .string()
  .matches(/^\d{10}$/, "Invalid phone number"),
  
  inst_contact_2_name: yup.string(),
  inst_contact_2_desig: yup.string(),
  inst_contact_2_email: yup.string().email("Invalid email"),
  inst_contact_2_phone: yup
  .string()
  .matches(/^$|^\d{10}$/, "Invalid phone number"),
  
  inst_status: yup
  .string()
  .oneOf(["A", "I"], "Status must be A (Active) or I (Inactive)")
  .required(),
  inst_reg_date: yup.date().required("Registration date is required"),
inst_watermark: yup
  .string()
  .nullable() 
  .notRequired() 
  .max(60, "Institute watermark must be at most 60 characters"),

});

export const defaultValues = {
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
  inst_status: "A",
  inst_reg_date: new Date().toISOString().split("T")[0],
};
