import {
  CoursePlannerMetaData,
  GetSolutionDetailsParams,
  GetTargetedSolutionsParams,
  GetUserProjectTemplateParams,
} from '@/utils/Interfaces';
import { get, post, deleteApi } from './RestClient';
import axios from 'axios';
import { URL_CONFIG } from '@/utils/url.config';
import {
  COURSE_PLANNER_UPLOAD_ENDPOINTS,
  TARGET_SOLUTION_ENDPOINTS,
  COURSE_PLANNER_DELETE,
  COURSE_PLANNER_TOPIC_CREATE,
  COURSE_PLANNER_DELETE_CONTENT,
  COURSE_PLANNER_UPDATE_CONTENT,
} from '@/utils/API/APIEndpoints';
import e from 'cors';

export const getFrameworkDetails = async (frameworkId: any): Promise<any> => {
  const apiUrl: string = `/api/framework/v1/read/${frameworkId}`;

  try {
    const response = await axios.get(apiUrl);
    return response?.data;
  } catch (error) {
    console.error('Error in getting Framework Details', error);
    return error;
  }
};

export const uploadCoursePlanner = async (
  file: File,
  metaData: CoursePlannerMetaData
): Promise<any> => {
  const apiUrl: string = COURSE_PLANNER_UPLOAD_ENDPOINTS;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('metaData', JSON.stringify(metaData));
  try {
    const response = await post(apiUrl, formData, {});
    return response?.data;
  } catch (error) {
    console.error('Error uploading course planner', error);
    throw error;
  }
};

export const getTargetedSolutions = async ({
  subject,
  // state,
  medium,
  class: className,
  board,
  courseType,
}: GetTargetedSolutionsParams): Promise<any> => {
  const apiUrl: string = TARGET_SOLUTION_ENDPOINTS;

  const headers = {
    'X-auth-token': localStorage.getItem('token'),
    'Content-Type': 'application/json',
  };

  const data = {
    subject,
    // state,
    medium,
    class: className,
    board,
    courseType,
  };

  try {
    const response = await axios.post(apiUrl, data, { headers });
    return response?.data;
  } catch (error) {
    console.error('Error in getting Targeted Solutions', error);
    return error;
  }
};
interface GetUserProjectDetailsParams {
  id: string;
}

export const getUserProjectDetails = async ({
  id,
}: GetUserProjectDetailsParams): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_COURSE_PLANNER_API_URL}/userProjects/details/${id}`;

  const headers = {
    Authorization: localStorage.getItem('token'),
    'Content-Type': 'application/json',
    'x-auth-token': localStorage.getItem('token'),
  };

  try {
    const response = await axios.post(apiUrl, {}, { headers });
    return response?.data;
  } catch (error) {
    console.error('Error in getting User Project Details', error);
    return error;
  }
};

export const getSolutionDetails = async ({
  id,
  role,
}: GetSolutionDetailsParams): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_COURSE_PLANNER_API_URL}/solutions/details/${id}`;

  const headers = {
    'X-auth-token': localStorage.getItem('token'),
    'Content-Type': 'application/json',
  };

  const data = {
    role,
  };

  try {
    const response = await axios.post(apiUrl, data, { headers });
    return response?.data;
  } catch (error) {
    console.error('Error in getting Solution Details', error);
    return error;
  }
};

export const getUserProjectTemplate = async ({
  templateId,
  solutionId,
  role,
}: GetUserProjectTemplateParams): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_COURSE_PLANNER_API_URL}/userProjects/details?templateId=${templateId}&solutionId=${solutionId}`;

  const headers = {
    'X-auth-token': localStorage.getItem('token'),
    'Content-Type': 'application/json',
  };

  const data = {
    role,
  };

  try {
    const response = await axios.post(apiUrl, data, { headers });
    return response?.data;
  } catch (error) {
    console.error('Error in getting User Project Details', error);
    throw error;
  }
};

export const getContentHierarchy = async ({
  doId,
}: {
  doId: string;
}): Promise<any> => {
  const apiUrl: string = `${URL_CONFIG.API.CONTENT_HIERARCHY}/${doId}`;

  try {
    const response = await get(apiUrl);
    return response;
  } catch (error) {
    console.error('Error in getContentHierarchy Service', error);
    throw error;
  }
};

export const deletePlanner = async (projectId: any): Promise<any> => {
  const apiUrl: string = `${COURSE_PLANNER_DELETE}${projectId}`;
  const requestBody = {};
  const requestHeaders = {
    'X-auth-token': localStorage.getItem('token'),
    'Content-Type': 'application/json',
  };

  try {
    const response = await deleteApi(apiUrl, requestBody, requestHeaders);
    return response;
  } catch (error) {
    console.error('Error in deletPlanner Service', error);
    return null;
  }
};

export const createTopic = async (
  projectId: any,
  payload: any
): Promise<any> => {
  const apiUrl: string = `${COURSE_PLANNER_TOPIC_CREATE}${projectId}`;
  const requestBody = payload;
  const requestHeaders = {
    'X-auth-token': localStorage.getItem('token'),
    'internal-access-token': 'Fqn0m0HQ0gXydRtBCg5l',
    'Content-Type': 'application/json',
  };

  try {
    const response = await post(apiUrl, requestBody, requestHeaders);
    return response;
  } catch (error) {
    console.error('Error in createTopic Service', error);
    return null;
  }
};

export const deleteContent = async (projectId: any,externalId: any): Promise<any> => {
  const apiUrl: string = `${COURSE_PLANNER_DELETE_CONTENT}${projectId}?externalId=${externalId}`;
  const requestBody = {};
  const requestHeaders = {
    'X-auth-token': localStorage.getItem('token'),
    'internal-access-token': 'Fqn0m0HQ0gXydRtBCg5l',
    'Content-Type': 'application/json',
  };

  try {
    const response = await deleteApi(apiUrl, requestBody, requestHeaders);
    return response;
  } catch (error) {
    console.error('Error in deletPlanner Service', error);
    return null;
  }
};

export const updateContent = async (projectId: any,externalId: any,payload: any): Promise<any> => {
  const apiUrl: string = `${COURSE_PLANNER_UPDATE_CONTENT}${projectId}?externalId=${externalId}`;
  const requestBody = payload;
  const requestHeaders = {
    'X-auth-token': localStorage.getItem('token'),
    'internal-access-token': 'Fqn0m0HQ0gXydRtBCg5l',
    'Content-Type': 'application/json',
  };

  try {
    const response = await post(apiUrl, requestBody, requestHeaders);
    return response;
  } catch (error) {
    console.error('Error in deletPlanner Service', error);
    return null;
  }
};