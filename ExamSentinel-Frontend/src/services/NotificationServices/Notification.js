
import apiClient from "../apiClient";

export const notificationList = async (user_id, role_id) => {
  try {
    const response = await apiClient.get(
      `/api/notifications?user_id=${user_id}&role_id=${role_id}`
    );
    return response.data; // return only data
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};
