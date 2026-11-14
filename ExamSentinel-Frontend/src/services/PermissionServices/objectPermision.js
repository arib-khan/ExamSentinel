import apiClient from "../apiClient";

export const getObjectPermission = async (data) => {
  try {
    const response = await apiClient.get("api/userpermision/list", data);
    return response;
  } catch (error) {
    throw error;
  }
};
export const getAllObjectPermission = async (data) => {
  try {
    const response = await apiClient.get("api/userpermision/all", data);
    return response;
  } catch (error) {
    throw error;
  }
};
export const updatePermissions = async (data) => {
  try {
    const response = await apiClient.put("api/userpermision/update", data);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getSystemObjectList = async () => {
  try {
    const response = await apiClient.get("api/systemobj/list");
    return response;
  } catch (error) {
    throw error;
  }
};
export const addSystemObjectName = async (data) => {
  try {
    const response = await apiClient.post("api/systemobj/add", data);
    return response;
  } catch (error) {
    throw error;
  }
};
export const addSystemObject = async (data) => {
  try {
    const response = await apiClient.post("api/userpermision/add", data);
    return response;
  } catch (error) {
    throw error;
  }
};


