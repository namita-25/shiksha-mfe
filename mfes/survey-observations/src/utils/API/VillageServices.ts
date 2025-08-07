import { post } from '@shared-lib';
import axios from 'axios';
import { API_ENDPOINTS } from './EndUrls';
export interface ListParam {
  limit?: number;
  offset?: number;
  controllingfieldfk?: string[];
  fieldName: string;
  optionName?: string;
  sort?: [string, string]; //
}


export const getStateBlockDistrictList = async ({
  controllingfieldfk,
  fieldName,
  limit,
  offset,
  optionName,
  sort,
}: ListParam): Promise<any> => {
  const apiUrl = API_ENDPOINTS.fieldOptionsRead;

  const requestBody: ListParam = {
    fieldName,
    limit,
    offset,
    sort,
  };
  if (controllingfieldfk) {
    requestBody.controllingfieldfk = controllingfieldfk;
  }
  if (optionName) {
    requestBody.optionName = optionName;
  }
  try {
    const response = await post(apiUrl, requestBody);
    return response?.data;
  } catch (error) {
    console.error("Error in fetching state, block, and district list", error);
    throw error;
  }
};

