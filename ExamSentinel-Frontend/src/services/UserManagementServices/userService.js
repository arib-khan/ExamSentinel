import apiClient from "../apiClient";

export const createUserProfile = async (data) => {
  try {
    const response = await apiClient.post("api/user/add", data);
    return response;
  } catch (error) {
    throw error;
  }
};


export const updateUserProfile = async (id, data) => {
  try {
    const response = await apiClient.put(`api/user/update/${id}`, data);
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

export const getUsersList = async () => {
  try {
    const response = await apiClient.get("api/user/list");
    return response;
  } catch (error) {
    throw error;
  }
};
export const getUserRolesList = async () => {
  try {
    const response = await apiClient.get("api/userRole/list");
    return response;
  } catch (error) {
    throw error;
  }
};

export const createUserRole = async (data) => {
  try {
    const response = await apiClient.post("api/userRole/add", data);
    return response;
  } catch (error) {
    throw error;
  }
};


export const updateUserRole = async (id, data) => {
  try {
    const response = await apiClient.put(`api/userRole/update/${id}`, data);
    return response;
  } catch (error) {
    throw error;
  }
};