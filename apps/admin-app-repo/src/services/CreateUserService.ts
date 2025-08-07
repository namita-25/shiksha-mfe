import { get, post, patch } from './RestClient';
import { createUserParam } from '../utils/Interfaces';
import axios from 'axios';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { TENANT_ID } from '../../app.config';
import TenantService from './TenantService';

import { API_ENDPOINTS } from '@/utils/API/APIEndpoints';

export interface UserDetailParam {
  userData?: object;

  customFields?: any;
}
export const getFormRead = async (
  context: string,
  contextType: string
): Promise<any> => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const token = localStorage.getItem('token');

      // Construct headers conditionally
      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
      };

      if (contextType !== 'TENANT') {
        headers.tenantId = TenantService.getTenantId();
      }

      const response = await axios.get(API_ENDPOINTS.formRead, {
        params: {
          context,
          contextType,
        },
        paramsSerializer: (params) => {
          return Object.entries(params)
            ?.map(([key, value]) => `${key}=${value}`)
            .join('&');
        },
        headers,
      });

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
    }
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
    return null;
  }
};

export const updateUser = async (
  userId: string,
  { userData, customFields }: UserDetailParam
): Promise<any> => {
  const apiUrl: string = API_ENDPOINTS.userUpdate(userId);

  try {
    const response = await patch(apiUrl, { userData, customFields });
    return response;
  } catch (error) {
    console.error('error in fetching user details', error);
    return error;
  }
};
