import apiClient from "../apiClient";

export const createStudentProfile = async (data) => {
  try {
    const response = await apiClient.post("api/student/register", data);
    return response;
  } catch (error) {
    throw error;
  }
};
export const uploadProfilePhoto = async (formdata) => {
  try {
    const response = await apiClient.post("/api/student/students_image", formdata, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response;
  } catch (error) {
    throw error;
  }
};
export const getProfilePhoto = async (data) => {
  try {
    const response = await apiClient.post("/api/student/students_pic", data,{ responseType: "blob" });
    return response;
  } catch (error) {
    throw error;
  }
};
export const updateStudentProfile = async (id, data) => {
  try {
    const response = await apiClient.put(`api/student/update/${id}`, data);
    return response;
  } catch (error) {
    throw error;
  }
};
// Update Student Seat Number
export const updateStudentSeat = async (id, data) => {
  try {
    const response = await apiClient.put(`api/student_exam_map/update/${id}`, data);
    return response;
  } catch (error) {
    throw error;
  }
};
export const deleteStudentProfile = async (id) => {
  try {
    const response = await apiClient.delete(`api/student/delete/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getStudentList = async () => {
  try {
    const response = await apiClient.get("api/student/list");
    return response;
  } catch (error) {
    throw error;
  }
};

//  Biometric Plan APIs
export const getBiometricPlan = async () => {
  try {
    const response = await apiClient.get("api/student_seat_plan/list");
    return response;
  } catch (error) {
    throw error;
  }
};

export const getStudentByExamId = async (examId) => {
  try {
    const response = await apiClient.get(`api/student/listByexam?exam_id=${examId}`);
    return response;
  } catch (error) {
    throw error;
  }
};
export const getLiveExamData = async () => {
  try {
    const response = await apiClient.get(`api/student_exam_map/listByCenter`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const allStudentDelete = async (examId) => {
  try {
    const response = await apiClient.delete(`api/student/deleteAllStudens/${examId}`);
    return response;
  } catch (error) {
    throw error;
  }
};


// Seate Allocation List for the student


export const getStudentSeatList = async () => {
  try {
    const response = await apiClient.get("api/CenterSeat/list");
    return response;
  } catch (error) {
    throw error;
  }
};


// New APIs for the Student Verification Module, Biometric Registration

export const uploadStudentProfile = async ( data) => {
  try {
    const response = await apiClient.post(`api/studentext/student_pic_capture`, data);
    return response;
  } catch (error) {
    throw error;
  }
};
export const uploadStudentFingerPrint = async ( data) => {
  try {
    const response = await apiClient.post(`api/studentext/add`, data);
    return response;
  } catch (error) {
    throw error;
  }
};