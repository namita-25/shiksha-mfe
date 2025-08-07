import {  post, get } from './RestClient';
import API_ENDPOINTS from '@/utils/API/APIEndpoints';

export interface CohortSearchFilters {
  cohortId?: string;
}

interface CohortListParams {
  limit: number;
  offset: number;
  filters: CohortSearchFilters;
}

interface CohortDetailsParams {
  userId: string;
  children?: boolean;
  customField?: boolean;
}

export const cohortCenterList = async ({
  limit,
  offset,
  filters,
}: CohortListParams): Promise<any> => {
  const apiUrl: string = API_ENDPOINTS.cohortSearch;
  try {
    const response = await post(apiUrl, { limit, offset, filters });
    return response?.data?.result;
  } catch (error) {
    console.error('error in getting cohort list', error);
    throw error;
  }
};

export const getCohortDetails = async ({
  userId,
  children = true,
  customField = true,
}: CohortDetailsParams): Promise<any> => {
  const apiUrl: string = `${API_ENDPOINTS.myCohorts(userId)}?children=${children}&customField=${customField}`;
  try {
    const response = await get(apiUrl);
    return response?.data;
  } catch (error) {
    console.error('error in getting cohort details', error);
    throw error;
  }
};