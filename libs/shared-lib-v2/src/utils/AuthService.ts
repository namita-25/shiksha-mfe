import axios from 'axios';
import { API_ENDPOINTS } from './APIEndpoints';

interface InstantIdParam {
  instantId: string;
}

interface StaticFilterContentParam {
  instantFramework: string;
}

interface FilterContentResult {
  framework?: {
    categories?: any[];
  };
}

interface StaticFilterContentResult {
  objectCategoryDefinition?: {
    forms?: {
      create?: {
        properties?: any;
        instantFramework?: string;
      };
    };
  };
}

// Function to fetch filter content
export const filterContent = async ({
  instantId,
}: InstantIdParam): Promise<FilterContentResult | undefined> => {
  const url = API_ENDPOINTS.framework(instantId);

  try {
    const result = await axios.get(url);

    if (result) {
      return result.data?.result as FilterContentResult;
    }
  } catch (e) {
    console.log('No internet available, retrieving offline data...', e);
  }
  return undefined;
};

export const staticFilterContent = async ({
  instantFramework,
}: StaticFilterContentParam): Promise<
  StaticFilterContentResult | undefined
> => {
  const url = API_ENDPOINTS.actionObject;

  const payload = {
    request: {
      objectCategoryDefinition: {
        objectType: 'Collection',
        name: 'Course',
        channel: instantFramework,
      },
    },
  };

  try {
    const result = await axios.post(url, payload);

    if (result) {
      return result.data?.result as StaticFilterContentResult;
    }
  } catch (e) {
    console.log('Error while fetching static filter content', e);
  }
  return undefined;
};

export const checkAuth = (isAuthenticated?: boolean) => {
  if (typeof window === 'undefined') {
    return false;
  }
  if (isAuthenticated === true) {
    return true;
  }
  const userId = localStorage.getItem('userId');
  const tenantId = localStorage.getItem('tenantId');
  const token = localStorage.getItem('token');
  if (userId && tenantId && token) {
    return true;
  } else {
    return false;
  }
};

export const getUserId = (key?: string | null) => {
  const userId = localStorage.getItem('userId');

  if (userId) {
    return userId;
  }

  if (key) return localStorage.getItem(key);

  return userId;
};
