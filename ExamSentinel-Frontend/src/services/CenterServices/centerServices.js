import apiClient from "../apiClient";
import cloudClient from "../cloudClient";

export const createCentreProfile = async (data) => {
  try {
    const response = await apiClient.post("api/center/add", data);
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateCentreProfile = async (id, data) => {
  try {
    const response = await apiClient.put(`api/center/update/${id}`, data);
    return response;
  } catch (error) {
    throw error;
  }
};
export const deleteCentreProfile = async (id) => {
  try {
    const response = await apiClient.delete(`api/center/delete/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};
export const getCenterList = async () => {
  try {
    const response = await cloudClient.get("api/center/list");
    return response;
  } catch (error) {
    throw error;
  }
};

// center list for the local
export const getCenterLists = async () => {
  try {
    const response = await apiClient.get("api/center/list");
    return response;
  } catch (error) {
    throw error;
  }
};
export const getCenterInvetoryList = async () => {
  try {
    const response = await apiClient.get("api/CenterSeat/list");
    return response;
  } catch (error) {
    throw error;
  }
};
export const getCenterInvetoryListByCenter = async (id) => {
  try {
    const response = await apiClient.get(`api/CenterSeat/listByCenter?id=${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};
