import apiClient from "../apiClient";

export const rawResultDownload = async (examid) => {
  try {
    const response = await apiClient.post("api/export/student-data", examid, {
  responseType: "blob",
})
    return response;
  } catch (error) {
    throw error;
  }
};
export const finalResultDownload = async (examid) => {
  try {
    const response = await apiClient.post("api/export/result", examid, {
  responseType: "blob",
})
    return response;
  } catch (error) {
    throw error;
  }
};
export const AuditDataDownload = async (examid) => {
  try {
    const response = await apiClient.post("api/export/student-answers-log", examid, {
  responseType: "blob",
})
    return response;
  } catch (error) {
    throw error;
  }
};
