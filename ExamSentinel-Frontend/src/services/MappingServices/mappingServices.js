import apiClient from "../apiClient";

export const createExamStudentMap = async (data) => {
  try {
    const response = await apiClient.post("api/student_exam_map/add", data);
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateExamStudentMap = async (data) => {
  try {
    const response = await apiClient.put(`api/student_exam_map/center_map`, data);
    return response;
  } catch (error) {
    throw error;
  }
};
export const deleteExamStudentMap = async (id) => {
  try {
    const response = await apiClient.delete(`api/center/delete/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};
export const getMapList = async (examId, instId) => {
  try {
    const response = await apiClient.get(`api/student_exam_map/map_student/${examId}/${instId}`);
    return response;
  } catch (error) {
    throw error;
  }
};


export const getExamDetailsByCenter = async (center_id) => {
  try {
    const response = await apiClient.get(`api/student_exam_map/exam_details/${center_id}`);
    return response;
  } catch (error) {
    throw error;
  }
  }