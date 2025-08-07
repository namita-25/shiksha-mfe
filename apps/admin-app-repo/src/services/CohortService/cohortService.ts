import { CohortMemberList } from '@/utils/Interfaces';
import { get, patch, post, put } from '../RestClient';
import axios from 'axios';
import { showToastMessage } from '@/components/Toastify';
import { API_ENDPOINTS } from '@/utils/API/APIEndpoints';

export interface cohortListFilter {
  type: string;
  status: string[];
  states: string;
  districts: string;
  blocks: string;
}

export interface cohortListData {
  limit?: Number;
  offset?: Number;
  filter?: any;
  status?: any;
}
export interface UpdateCohortMemberStatusParams {
  memberStatus: string;
  statusReason?: string;
  membershipId: string | number;
}
export const getCohortList = async (data: cohortListData): Promise<any> => {
  const apiUrl: string = API_ENDPOINTS.cohortSearch;

  try {
    const response = await post(apiUrl, data);
    return response?.data?.result;
  } catch (error) {
    console.error('Error in Getting cohort List Details', error);
    return error;
  }
};

export const updateCohortUpdate = async (
  userId: string,
  cohortDetails: any
): Promise<any> => {
  // const { name, status, type } = cohortDetails;
  const apiUrl: string = API_ENDPOINTS.cohortUpdateUser(userId);

  try {
    const response = await put(apiUrl, cohortDetails);
    return response?.data;
  } catch (error) {
    console.error('Error in updating cohort details', error);
    // throw error;
    return null;
  }
};

export const updateReassignUser = async (
  userId: string,
  cohortDetails: any
): Promise<any> => {
  const apiUrl = API_ENDPOINTS.userUpdate(userId);

  try {
    const response = await patch(apiUrl, cohortDetails);
    return response?.data;
  } catch (error) {
    console.error('Error in updating user details', error);
    return null;
  }
};

export const getFormRead = async (
  context: string,
  contextType: string
): Promise<any> => {
  const apiUrl: string = API_ENDPOINTS.formReadWithContext(
    context,
    contextType
  );
  try {
    const response = await get(apiUrl);
    const sortedFields = response?.data?.result.fields?.sort(
      (a: { order: string }, b: { order: string }) =>
        parseInt(a.order) - parseInt(b.order)
    );
    const formData = {
      formid: response?.data?.result?.formid,
      title: response?.data?.result?.title,
      fields: sortedFields,
    };
    return formData;
  } catch (error) {
    console.error('error in getting cohort details', error);
    // throw error;
  }
};
export const createUser = async (userData: any): Promise<any> => {
  const apiUrl: string = API_ENDPOINTS.accountCreate;
  try {
    const response = await post(apiUrl, userData);
    return response?.data?.result;
  } catch (error) {
    console.error('error in getting cohort list', error);
    // throw error;
  }
};

export const createCohort = async (userData: any, t?: any): Promise<any> => {
  const apiUrl: string = API_ENDPOINTS.cohortCreate;

  try {
    const response = await post(apiUrl, userData);
    return response?.data;
  } catch (error) {
    console.error('error in getting cohort list', error);

    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 409) {
        showToastMessage(t('COMMON.ALREADY_EXIST'), 'error');
      } else throw error;
    }
  }
};

export const fetchCohortMemberList = async ({
  limit,
  offset,
  filters,
}: CohortMemberList): Promise<any> => {
  const apiUrl: string = API_ENDPOINTS.cohortMemberList;
  try {
    const response = await post(apiUrl, {
      limit,
      offset,
      filters,
      // sort: ["username", "asc"],
    });
    return response?.data;
  } catch (error) {
    console.error('error in cohort member list API ', error);
    // throw error;
    return null;
  }
};

export const bulkCreateCohortMembers = async (payload: any): Promise<any> => {
  const apiUrl: string = API_ENDPOINTS.cohortMemberBulkCreate;
  try {
    const response = await post(apiUrl, payload);
    return response.data;
  } catch (error) {
    console.error('Error in bulk creating cohort members', error);
    // throw error;
    return null;
  }
};

export const updateCohortMemberStatus = async ({
  memberStatus,
  statusReason,
  membershipId,
}: UpdateCohortMemberStatusParams): Promise<any> => {
  const apiUrl: string = API_ENDPOINTS.cohortMemberUpdate(membershipId);
  try {
    const response = await put(apiUrl, {
      status: memberStatus,
      statusReason,
    });
    return response?.data;
  } catch (error) {
    console.error('error in attendance report api ', error);
    // throw error;
  }
};
