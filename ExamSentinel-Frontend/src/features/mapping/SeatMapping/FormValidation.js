
import * as yup from "yup";

export const defaultValues = {
  iecsm_inst_id: "",
  iecsm_exam_id: "",
  iecsm_centre_id: "",
};

export const schema = () =>
  yup.object().shape({
    iecsm_inst_id: yup
      .number()
      .typeError("Institution is required")
      .required("Institution is required"),

    iecsm_exam_id: yup
      .number()
      .typeError("Exam is required")
      .required("Exam is required"),

    iecsm_centre_id: yup
      .number()
      .typeError("Centre is required")
      .required("Centre is required"),

  });
