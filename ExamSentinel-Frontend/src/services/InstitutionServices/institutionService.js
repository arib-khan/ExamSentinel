import apiClient from "../apiClient";

export const createInstitutionProfile = async (data) => {
  try {
    const response = await apiClient.post("api/institute/add", data);
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateInstitutionProfile = async (id, data) => {
  try {
    const response = await apiClient.put(`api/institute/update/${id}`, data);
    return response;
  } catch (error) {
    throw error;
  }
};

export const deleteInstitutionProfile = async (id) => {
  try {
    const response = await apiClient.delete(`api/institute/delete/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getInstitutionList = async () => {
  try {
    const response = await apiClient.get("api/institute/list");
    return response;
  } catch (error) {
    throw error;
  }
};
