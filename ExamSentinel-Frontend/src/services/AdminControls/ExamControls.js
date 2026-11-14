// need to call cloud api here 

import apiClient from "../apiClient";

export const generatePassword = async (data) => {
  try {
    const response = await apiClient.post(`api/otp/add`, data);
    return response;
  } catch (error) {
    throw error;
  }
}; 
export const generatedPasswordList = async () => {
  try {
    const response = await apiClient.get(`api/otp/list`);
    return response;
  } catch (error) {
    throw error;
  }
}; 

export const examStartActivity = async (data) =>{
    try {
        const response = await apiClient.post(`api/exam/exam_start`, data);
        return response;
        } catch (error) {
        throw error;
    }
}
