import API_ENDPOINTS from '../utils/API/APIEndpoints';
import { post, patch } from '../services/RestClient';

//     const sortedFields = response?.data?.result.fields?.sort(
//       (a: { order: string }, b: { order: string }) =>
//         parseInt(a.order) - parseInt(b.order)
//     );
//     const formData = {
//       formid: response?.data?.result?.formid,
//       title: response?.data?.result?.title,
//       fields: sortedFields,
//     };
//     return formData;
//   } catch (error) {
//     console.error('error in getting cohort details', error);
//     // throw error;
//   }
// };

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

export const userNameExist = async (userData: any): Promise<any> => {
  const apiUrl: string = API_ENDPOINTS.suggestUsername;
  try {
    const response = await post(apiUrl, userData);
    return response?.data?.result;
  } catch (error) {
    console.error('error in getting in userNme exist', error);
    throw error;
  }
};

export const createCohort = async (userData: any): Promise<any> => {
  const apiUrl: string = API_ENDPOINTS.cohortCreate;
  try {
    const response = await post(apiUrl, userData);
    return response?.data?.result;
  } catch (error) {
    console.error('error in getting cohort list', error);
    // throw error;
  }
};
export interface UserDetailParam {
  userData?: object;

  customFields?: any;
}
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
