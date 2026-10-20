import { API_ENDPOINTS } from '@/utils/API/APIEndpoints';
import { post } from './RestClient';

export interface CohortCustomField {
  fieldId: string;
  label: string;
  type?: string;
  selectedValues?: Array<{
    id?: number | string;
    value: string;
  }>;
}

export interface CohortItemApi {
  cohortId: string;
  parentId?: string | null;
  name: string;
  type: string;
  status: string;
  image?: string | null;
  referenceId?: string | null;
  metadata?: any;
  tenantId: string;
  programId?: string | null;
  attendanceCaptureImage?: boolean;
  params?: {
    groupOwnerId?: string;
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  customFields?: CohortCustomField[];
  [key: string]: any;
}

export interface CohortSearchParams {
  limit?: number;
  offset?: number;
  filters: {
    type?: string;
    tenantId?: string;
    status?: string;
    name?: string;
    [key: string]: any;
  };
}

export interface CohortSearchResponse {
  responseCode: string | number;
  params?: any;
  result?: {
    count?: number;
    results?: {
      cohortDetails?: CohortItemApi[];
    };
  };
}

export const getCohortSearch = async (
  payload: CohortSearchParams
): Promise<CohortSearchResponse> => {
  try {
    const apiUrl = API_ENDPOINTS.cohortSearch;
    const response = await post(apiUrl, payload);
    return response?.data;
  } catch (error) {
    console.error('Error in getCohortSearch:', error);
    throw error;
  }
};

export interface CohortMemberListParams {
  limit?: number;
  offset?: number;
  filters: {
    cohortId: string;
    role?: string;
    status?: string;
    [key: string]: any;
  };
  sort?: string[];
}

export const getCohortMemberList = async (
  payload: CohortMemberListParams
): Promise<any> => {
  try {
    const apiUrl = API_ENDPOINTS.cohortMemberList;
    const response = await post(apiUrl, payload);
    return response?.data;
  } catch (error) {
    console.error('Error in getCohortMemberList:', error);
    throw error;
  }
};

export interface CohortContentSearchParams {
  filter: {
    cohortId: string;
    [key: string]: any;
  };
}

export const getCohortContentSearch = async (
  payload: CohortContentSearchParams
): Promise<any> => {
  try {
    const apiUrl = API_ENDPOINTS.cohortContentSearch;
    const response = await post(apiUrl, payload);
    return response?.data;
  } catch (error) {
    console.error('Error in getCohortContentSearch:', error);
    throw error;
  }
};
