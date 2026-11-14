import apiClient from "../apiClient";

export const createExamDetails = async (data) => {
  try {
    const response = await apiClient.post("api/exam/add", data);
    return response;
  } catch (error) {
    throw error;
  }
};
export const uploadInstructionImage = async (formdata) => {
  try {
    const response = await apiClient.post("/api/exam/instruction_image", formdata, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateExamDetails = async (id, data) => {
  try {
    const response = await apiClient.put(`api/exam/update/${id}`, data);
    return response;
  } catch (error) {
    throw error;
  }
};

export const deleteExamDetails = async (id) => {
  try {
    const response = await apiClient.delete(`api/exam/delete/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getExamList = async () => {
  try {
    const response = await apiClient.get("api/exam/list");
    return response;
  } catch (error) {
    throw error;
  }
};

export const getExamNotification = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await apiClient.get("api/exam/instruction", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
};

// ✅ NEW: Start Exam API call
export const startExam = async () => {
  try {
    const token = sessionStorage.getItem("authToken"); // ✅ Make sure it's from sessionStorage
    console.log("Token in startExam API:", token);
    const response = await apiClient.get("api/exam/start", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
};

// Rotuse for Exam Set creation
export const createExamSet = async (data) => {
  try {
    const response = await apiClient.post("api/examset/add", data);
    return response;
  } catch (error) {
    throw error;
  }
};
