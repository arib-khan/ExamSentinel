// CentreFormValidation.js
import * as yup from "yup";

export const defaultValues = {
  centre_name: "",
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
  centre_email: "",
  centre_phone: "",
};

export const schema = yup.object().shape({
  centre_name: yup.string().required("Centre name is required"),
  centre_address_line_1: yup.string().required("Address Line 1 is required"),
  centre_address_line_2: yup.string(),
  centre_city: yup.string().required("City is required"),
  centre_state: yup.string().required("State is required"),
  centre_zipcode: yup.string().required("Zipcode is required"),
  centre_contact_1_name: yup
    .string()
    .required("Primary contact name is required"),
  centre_contact_1_email: yup
    .string()
    .email("Invalid email")
    .required("Primary contact email is required"),
  centre_contact_1_phone: yup
    .string()
    .required("Primary contact phone is required"),
  centre_contact_2_name: yup.string(),
  centre_contact_2_email: yup.string().email("Invalid email"),
  centre_contact_2_phone: yup.string(),
  centre_email: yup
    .string()
    .email("Invalid email")
    .required("Centre email is required"),
  centre_phone: yup.string().required("Centre phone is required"),
});
