
import { post } from '@shared-lib';
import { API_ENDPOINTS } from './EndUrls';

export const getAcademicYear = async (): Promise<any> => {
  const apiUrl: string = API_ENDPOINTS.academicYearsList;
  try {


    const response = await post(apiUrl, {},); // empty body, headers passed
    return response?.data?.result;
  } catch (error) {
    console.error('error in getting academicYearId', error);
  }
};
