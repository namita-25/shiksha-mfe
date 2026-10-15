import { API_ENDPOINTS } from '@/utils/API/APIEndpoints';
import { get, post, put } from './RestClient';

export const getUserDetailsInfo = async (userId: string): Promise<any> => {
  try {
    const apiUrl = API_ENDPOINTS.userRead(userId, true);
    const response = await get(apiUrl);
    return response?.data;
  } catch (error) {
    console.error('Error in getUserDetailsInfo:', error);
    throw error;
  }
};

export const getUserList = async (payload: any): Promise<any> => {
  try {
    const apiUrl = API_ENDPOINTS.userList;
    const response = await post(apiUrl, payload);
    return response?.data;
  } catch (error) {
    console.error('Error in getUserList:', error);
    throw error;
  }
};

export const getCohortMemberList = async (payload: any): Promise<any> => {
  try {
    const apiUrl = API_ENDPOINTS.cohortMemberList;
    const response = await post(apiUrl, payload);
    return response?.data;
  } catch (error) {
    console.error('Error in getCohortMemberList:', error);
    throw error;
  }
};
