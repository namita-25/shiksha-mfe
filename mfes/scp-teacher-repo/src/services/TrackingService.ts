import API_ENDPOINTS from '@/utils/API/APIEndpoints';
import { post } from './RestClient';

export interface ContentStatus {
  userId: string[];
  courseId: string[];
  unitId: string[];
  contentId: string[];
}

export interface ContentCreate {
  userId: string;
  contentId: string;
  courseId: string;
  unitId: string;
  contentType: string;
  contentMime: string;
  lastAccessOn: string;
  detailsObject: any[];
}

export const getContentTrackingStatus = async (reqBody: ContentStatus) => {
  const apiUrl: string = API_ENDPOINTS.contentSearchStatus
  try {
    const response = await post(apiUrl, reqBody);
    return response?.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const createContentTracking = async (reqBody: ContentCreate) => {
  const apiUrl: string = API_ENDPOINTS.contentCreate
  try {
    const response = await post(apiUrl, reqBody);
    return response?.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
