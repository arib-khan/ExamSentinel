import * as yup from "yup";

export const defaultValues = {
  iecsm_inst_id: "",
  iecsm_exam_id: "",
  iecsm_centre_id: "",
  iecsm_student_id: "",
  iecsm_room_name: "",
  iecsm_seat_num: "",
  iecsm_date: "",
  iecsm_start_time: "",
  iecsm_end_time: "",
};

export const schema = yup.object().shape({
  iecsm_inst_id: yup.number().required("Institution is required"),
  iecsm_exam_id: yup.number().required("Exam is required"),
  iecsm_centre_id: yup.number().required("Centre is required"),
  iecsm_student_id: yup.number().required("Student is required"),
  iecsm_room_name: yup.string().required("Room name is required"),
  iecsm_seat_num: yup.string().required("Seat number is required"),
  iecsm_date: yup.date().required("Date is required"),
  iecsm_start_time: yup.date().required("Start time is required"),
  iecsm_end_time: yup.date().required("End time is required"),
});
