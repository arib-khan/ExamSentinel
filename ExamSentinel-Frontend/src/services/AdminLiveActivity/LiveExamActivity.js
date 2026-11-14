import apiClient from "../apiClient";

export const getLiveExamActivity = async (examid, studentid) => {
  try {
    const response = await apiClient.get(`api/activity-log/listByid/${examid}/${studentid}`);
    return response;
  } catch (error) {
    throw error;
  }
}; 

export const getLiveStudentActivity = async (studentid) => {
  try {
    const response = await apiClient.get(`api/student_answers_log/listbyid/${studentid}`);
    return response;
  } catch (error) {
    throw error;
  }
}; 
