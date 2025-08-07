// @ts-ignore
import { CohortListParam, GetCohortSearchParams } from '@/utils/Interfaces';
import { Role, Status } from '@/utils/app.constant';
import { get, post } from './RestClient';
import API_ENDPOINTS from '@/utils/API/APIEndpoints';
import { flresponsetotl } from '@/utils/Helper';

const getUserRole = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('role');
  }
  return null; // Return a default value for SSR environments
};

const role = getUserRole();

export const cohortList = async ({
  limit,
  offset,
  filters,
}: CohortListParam): Promise<any> => {
  const apiUrl: string = API_ENDPOINTS.cohortSearch;
  try {
    const response = await post(apiUrl, { limit, offset, filters });
    return response?.data?.result;
  } catch (error) {
    console.error('error in getting cohort list', error);
    throw error;
  }
};

export const getCohortDetails = async (cohortId: string): Promise<any> => {
  const apiUrl: string = API_ENDPOINTS.cohortHierarchy(cohortId);
  try {
    const response = await get(apiUrl);
    return response?.data?.result;
  } catch (error) {
    console.error('error in getting cohort details', error);
    // throw error;
  }
};

export const getCohortList = async (
  userId: string,
  filters: { [key: string]: string } = {},
  isCustomFields: boolean = false
): Promise<any> => {
  let apiUrl: string = API_ENDPOINTS.myCohorts(userId);
  filters = { ...filters, children: 'true' };
  const filterParams = new URLSearchParams(filters).toString();
  if (filterParams) {
    apiUrl += `?${filterParams}`;
  }
  try {
    const response = await get(apiUrl);
    if (isCustomFields) {
      return response?.data?.result;
    }
    if (response?.data?.result.length > 0) {
      let res = response?.data?.result;

      res = res.filter((block: any) => {
        if (
          block?.cohortStatus === Status.ACTIVE &&
          //if no center then also show in list only for facilitator
          ((localStorage.getItem('role') === Role.TEACHER &&
            block?.childData.length > 0) ||
            localStorage.getItem('role') !== Role.TEACHER)
          //
        ) {
          return block;
        }
      });

      if (res.length > 0) {
        return res;
      } else {
        //for facilitator response
        res = response?.data?.result.filter((block: any) => {
          if (block?.cohortStatus === Status.ACTIVE) {
            return block;
          }
        });
        //patch for alter response for facilitator
        try {
          if (localStorage.getItem('role') === Role.TEACHER) {
            res = await flresponsetotl(res);
            // console.log('########## response', res);
          }
        } catch (error) {}
        return res;
      }
    }

    return response?.data?.result;
  } catch (error) {
    console.error('Error in getting cohort details', error);
    return [];
  }
};

export const bulkCreateCohortMembers = async (payload: any): Promise<any> => {
  const apiUrl: string = API_ENDPOINTS.cohortMemberBulkCreate;
  try {
    const response = await post(apiUrl, payload);
    return response.data;
  } catch (error) {
    console.error('Error in bulk creating cohort members', error);
    throw error;
  }
};

export const getCohortSearch = async ({
  cohortId,
  limit = 20,
  offset = 0,
}: GetCohortSearchParams): Promise<any> => {
  const apiUrl: string = API_ENDPOINTS.cohortSearch;

  const data = {
    filters: {
      cohortId,
    },
    limit,
    offset,
  };

  try {
    const response = await post(apiUrl, data);
    return response?.data;
  } catch (error) {
    console.error('Error in searching Cohorts', error);
    return error;
  }
};

export const getCentersByBlockId = async (blockId: string): Promise<any[]> => {
  if (!blockId) {
    throw new Error('blockId is required');
  }

  const apiUrl: string = API_ENDPOINTS.cohortSearch;

  const data = {
    limit: 20,
    offset: 0,
    filters: {
      block: [blockId],
      type: 'COHORT',
      status: ['active'],
    },
  };

  try {
    const response = await post(apiUrl, data);
    const result = response?.data?.result?.results;

    if (!result || !result.cohortDetails) {
      return [];
    }
    return result.cohortDetails;
  } catch (error) {
    console.error('Error in searching Cohorts:', error);
    return [];
  }
};

export const getBlocksByCenterId = async (
  centerId: string,
  centerList: any
): Promise<any[]> => {
  if (!centerId) {
    throw new Error('centerId is required');
  }
  if (!centerList) {
    throw new Error('centerList is required');
  }

  console.log('!!!!!', centerList);
  const matchingChildren = getChildDataByParentId(centerList, centerId);
  return matchingChildren;
};

const getChildDataByParentId = (data: any, parentId: string) => {
  let result: any[] = [];

  const search = (items: any[]) => {
    for (const item of items) {
      if (item.childData && item.childData.length > 0) {
        for (const child of item.childData) {
          if (child.parentId === parentId) {
            console.log('######### testing batch', child);
            if (child?.status === Status.ACTIVE) {
              result.push(child);
            }
          }
          // continue searching in case of deeper nesting
          if (child.childData && child.childData.length > 0) {
            search([child]);
          }
        }
      }
    }
  };

  search(data);
  return result;
};

export const getCohortData = async (
  userId: string | string[]
): Promise<any> => {
  const apiUrl: string = API_ENDPOINTS.myCohorts(userId);
  try {
    const response = await get(apiUrl);
    return response?.data;
  } catch (error) {
    console.error('error in fetching user details', error);
    return error;
  }
};
