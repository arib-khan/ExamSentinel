import * as yup from "yup";

export const defaultValues = {
  question: "",
  option_a: "",
  option_b: "",
  option_c: "",
  option_d: "",
  option_e: "",
  option_f: "",
  correct_option: "",
  ques_exam_id: "",
  ques_exam_set_id: "",
  answer_key_ref: null,
  answer_key_update_time: null,
  Language: "",
  Mark: "",
  NegativeMark: "",
  Duration: "",
  DifficultyLevel: "",
  Reference: "",
  RandomizeOption: "",
  Group_question_No: "",
  imageRef: "",
  option_a_image: "",
  option_b_image: "",
  option_c_image: "",
  option_d_image: "",
  question_type: "MCQ",
  section: "",
  question_subject: "",
};

export const questionSchema = yup.object().shape({
  question: yup.string().required("Question is required"),
  option_a: yup.string().required("Option A is required"),
  option_b: yup.string().required("Option B is required"),
  option_c: yup.string().required("Option C is required"),
  option_d: yup.string().required("Option D is required"),
  option_e: yup.string(),
  option_f: yup.string(),
  correct_option: yup
    .string()
    .oneOf(["A", "B", "C", "D", "E", "F"], "Must be one of A, B, C, D, E, or F")
    .required("Correct option is required"),
  ques_exam_id: yup.string(),
  ques_exam_set_id: yup.string().nullable(),
  answer_key_ref: yup.string().max(50, "Max 50 characters").nullable(),
  answer_key_update_time: yup.string().nullable(),
  Language: yup.string().max(45, "Max 45 characters"),
  Mark: yup
    .number()
    .typeError("Must be a number")
    .integer("Must be an integer")
    .min(0, "Must be positive"),
  NegativeMark: yup
    .number()
    .typeError("Must be a number"),
  Duration: yup.string().max(20, "Max 20 characters"),
  DifficultyLevel: yup
    .number()
    .typeError("Must be a number")
    .integer("Must be an integer")
    .min(0, "Must be 0 or greater")
    .max(255, "Must be 255 or less"),
  Reference: yup
    .number()
    .typeError("Must be a number")
    .integer("Must be an integer")
    .nullable(),
  // RandomizeOption: yup.string().max(45, "Max 45 characters"),
  RandomizeOption: yup 
    .string()
    .oneOf(["Yes", "No"], "Must be Yes or No")
    .required("Randomize Option is required"),
  Group_question_No: yup.string().max(45, "Max 45 characters").nullable(),
  imageRef: yup.string().max(100, "Max 100 characters").nullable(),
  option_a_image: yup.string().max(45, "Max 45 characters").nullable(),
  option_b_image: yup.string().max(45, "Max 45 characters").nullable(),
  option_c_image: yup.string().max(45, "Max 45 characters").nullable(),
  option_d_image: yup.string().max(45, "Max 45 characters").nullable(),
  question_type: yup
    .string()
    .oneOf(["MCQ", "NUMERICAL"], "Must be MCQ or NUMERICAL")
    .required("Question type is required"),
  section: yup.string().max(45, "Max 45 characters").nullable(),
  question_subject: yup.string().max(100, "Max 100 characters"),
});