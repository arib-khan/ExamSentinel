import apiClient from "../apiClient";

export const createQuestion = async (data) => {
  try {
    const response = await apiClient.post("api/question/questions_add", data);
    return response;
  } catch (error) {
    throw error;
  }
};
export const questionUpdate = async (id, data) => {
  try {
    const response = await apiClient.post("api/question/questions_add", data);
    return response;
  } catch (error) {
    throw error;
  }
};
export const questionDelete = async (id) => {
  try {
    const response = await apiClient.delete(`api/question/delete/${id}`,);
    return response;
  } catch (error) {
    throw error;
  }
};
export const allQuestionDelete = async (id) => {
  try {
    const response = await apiClient.delete(`api/question/deleteByExam/${id}`,);
    return response;
  } catch (error) {
    throw error;
  }
};
export const getQuestionList = async () => {
  try {
    const response = await apiClient.get("api/question/questions_list");
    return response;
  } catch (error) {
    throw error;
  }
};
export const getQuestionByExamid = async (examId) => {
  try {
    const response = await apiClient.get(`api/question/quesByExam/${examId}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// ✅ NEW: Save Answer API
export const saveAnswer = async (payload) => {
  try {
    const token = sessionStorage.getItem("authToken");
    const response = await apiClient.post("api/question/next", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
};
