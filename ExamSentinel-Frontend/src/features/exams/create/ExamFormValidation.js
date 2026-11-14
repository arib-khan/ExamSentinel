import * as yup from "yup";

// ✅ Validation schema
export const schema = yup.object().shape({
  exam_name: yup.string().required("Exam Name is required"),
  exam_start_date: yup.date().typeError("Start date is required"),
  exam_end_date: yup.date().typeError("End date is required"),
  exam_no_of_students: yup
  .number()
  .positive("Must be a positive number")
  .typeError("No. of Students is required"),
  exam_no_questions: yup
  .number()
  .positive("Must be a positive number")
  .typeError("No. of Question is required"),
  exam_duration: yup
  .number()
  .positive("Must be a positive number")
  .typeError("Enter exam duration in minutes"),
  exam_status: yup.string().oneOf(["A", "I"]).typeError("Status is required"),
  exam_instructions: yup.string().required("Exam instructions are required").max(500, "Instructions must be at most 500 characters"),
});

// ✅ Default values
export const defaultValues = {
  exam_inst_id: "",
  exam_name: "",
  exam_start_date: "",
  exam_end_date: "",
  exam_no_of_students: "",
  exam_status: "A",
};
