import { API_ENDPOINTS } from './EndUrls';
import { post } from './RestClient';

interface UserCheckParams {
  username?: string;
  mobile?: string;
}

export const userCheck = async ({
  username,
  mobile,
}: UserCheckParams): Promise<any> => {
  const apiUrl: string = API_ENDPOINTS.userCheck;

  try {
    let response;
    if (username) {
      response = await post(apiUrl, { username });
    }
    if (mobile) {
      response = await post(apiUrl, { mobile });
    }
    return response?.data;
  } catch (error) {
    console.error('error in login', error);
    throw error;
  }
};
