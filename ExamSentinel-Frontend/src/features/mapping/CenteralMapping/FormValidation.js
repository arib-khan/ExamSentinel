// import * as yup from "yup";

// export const defaultValues = {
//   iecsm_inst_id: "",
//   iecsm_exam_id: "",
//   iecsm_centre_id: "",
//   iecsm_date: "",
// };

// export const schema = yup.object().shape({
//   iecsm_inst_id: yup.number().typeError("Institution is required").required("Institution is required"),
//   iecsm_exam_id: yup.number().typeError("Exam is required").required("Exam is required"),
//   iecsm_centre_id: yup.number().typeError("Centre is required").required("Centre is required"),
//  iecsm_date: yup
//   .date()
//   .typeError("Invalid date") // triggers if invalid value entered
//   .required("Date is required"), // triggers if empty

 
// });

import * as yup from "yup";
import { differenceInMinutes, isSameDay } from "date-fns";

export const defaultValues = {
  iecsm_inst_id: "",
  iecsm_exam_id: "",
  iecsm_centre_id: "",
  iecsm_date: "",
  iecsm_start_time: "",
  iecsm_end_time: "",
};

// ⬇️ schema receives examDuration dynamically
export const schema = (examDuration) =>
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

    // 1️⃣ Exam Date must be today or future
    iecsm_date: yup
      .date()
      .typeError("Invalid date")
      .required("Date is required")
      .min(
        new Date(new Date().setHours(0, 0, 0, 0)),
        "Exam date must be today or future date"
      ),

    // 2️⃣ Start Time Validation
    iecsm_start_time: yup
      .date()
      .typeError("Invalid start time")
      .required("Start time is required")
      .test(
        "start-same-day",
        "Start time must be on the same exam date",
        function (value) {
          const examDate = this.parent.iecsm_date;
          if (!examDate || !value) return true;
          return isSameDay(new Date(examDate), new Date(value));
        }
      ),

    // 3️⃣ End Time Validation
    iecsm_end_time: yup
      .date()
      .typeError("Invalid end time")
      .required("End time is required")
      .test(
        "end-same-day",
        "End time must be on the same exam date",
        function (value) {
          const examDate = this.parent.iecsm_date;
          if (!examDate || !value) return true;
          return isSameDay(new Date(examDate), new Date(value));
        }
      )
      .test(
        "end-after-start",
        "End time must be greater than start time",
        function (value) {
          const start = this.parent.iecsm_start_time;
          if (!start || !value) return true;
          return new Date(value) > new Date(start);
        }
      )
      .test(
        "duration-match",
        `End time must be ${examDuration} minutes after start time`,
        function (value) {
          const start = this.parent.iecsm_start_time;
          if (!start || !value || !examDuration) return true;
          const diff = differenceInMinutes(new Date(value), new Date(start));
          return diff === examDuration;
        }
      ),
  });
