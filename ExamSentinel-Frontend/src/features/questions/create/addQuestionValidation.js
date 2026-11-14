import * as yup from "yup";

export const defaultValues = {
  question: "",
  option_a: "",
  option_b: "",
  option_c: "",
  option_d: "",
  correct_option: "",
  ques_exam_id: "",
};

export const addQuestionSchema = yup.object().shape({
  question: yup.string().required("Question is required"),
  option_a: yup.string().required("Option A is required"),
  option_b: yup.string().required("Option B is required"),
  option_c: yup.string().required("Option C is required"),
  option_d: yup.string().required("Option D is required"),
  correct_option: yup
    .string()
    .oneOf(["A", "B", "C", "D"], "Must be one of A, B, C, or D")
    .required("Correct option is required"),
});
