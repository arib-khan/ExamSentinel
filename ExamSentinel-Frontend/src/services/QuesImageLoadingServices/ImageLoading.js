import apiClient from "../apiClient";

export const getImageList = async () => {
  try {
    const response = await apiClient.get("api/question/ques_img_list");
    return response;
  } catch (error) {
    throw error;
  }
};
export const getImagePreview = async ( payload ) => {
  try {
    const response = await apiClient.post("api/question/ques_img", payload);
    return response;
  } catch (error) {
    throw error;
  }
};