import { post } from '@shared-lib';
import axios from 'axios';
import API_ENDPOINTS from 'mfes/youthNet/src/utils/API/APIEndpoints';
export interface ListParam {
  limit?: number;
  offset?: number;
  controllingfieldfk?: string[];
  fieldName: string;
  optionName?: string;
  sort?: [string, string]; //
}
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

const DISTRICT_DETAILS = {
  DISTRICT_NAME: 'District',
  DISTRICT_OPTIONS: ['Pune', 'District 2', 'District 3', 'District 4'],
};

const BLOCK_DETAILS = {
  BLOCK_NAME: 'Block',
  BLOCK_OPTIONS: ['Shivneri', 'Block 2', 'Block 3', 'Block 4'],
};

export const fetchDistrictData = async (): Promise<any> => {
  if (DISTRICT_DETAILS) {
    return DISTRICT_DETAILS;
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/villageList`);
    return response?.data?.surveyAvailable || false;
  } catch (error) {
    console.error('Error fetching survey data:', error);
    return false;
  }
};
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
export const fetchBlockData = async (): Promise<any> => {
  if (BLOCK_DETAILS) {
    return BLOCK_DETAILS;
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/villageList`);
    return response?.data?.surveyAvailable || false;
  } catch (error) {
    console.error('Error fetching survey data:', error);
    return false;
  }
};
