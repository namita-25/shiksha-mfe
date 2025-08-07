import axios from 'axios';
import { API_ENDPOINTS } from './EndUrls';
import { post } from '@shared-lib';

export const getTenantInfo = async (): Promise<any> => {
  const apiUrl = API_ENDPOINTS.program;

  try {
    const response = await axios.get(apiUrl);

    return response?.data;
  } catch (error) {
    console.error('Error in fetching tenant info', error);
    throw null;
  }
};

export const FetchDoIds = async (userId: any[]): Promise<any> => {
  const apiUrl: string = API_ENDPOINTS.fetchCourseId;

  try {
    const response = await post(apiUrl, {
      userId: userId,
    });
    return response?.data;
  } catch (error) {
    console.error('error in login', error);
    throw error;
  }
};
