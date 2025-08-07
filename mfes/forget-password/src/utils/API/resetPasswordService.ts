import { API_ENDPOINTS } from './EndUrls';
import { post } from './RestClient';

export const resetPassword = async (newPassword: any): Promise<any> => {
  const apiUrl: string = API_ENDPOINTS.resetPassword;
  try {
    const response = await post(apiUrl, { newPassword });
    return response?.data;
  } catch (error) {
    console.error('error in reset', error);
    throw error;
  }
};

export const forgetPassword = async (
  newPassword: any,
  token: any
): Promise<any> => {
  const apiUrl: string = API_ENDPOINTS.forgetPassword;
  try {
    const response = await post(
      apiUrl,
      { newPassword, token },
      {
        Authorization: `Bearer ${token}`,
      }
    );
    return response?.data;
  } catch (error) {
    console.error('error in reset', error);
    throw error;
  }
};
