import {
  getLocalStoredUserId,
  getLocalStoredUserRole,
} from "./LocalStorageService";
import { delApi, get, post, patch } from "./RestClient";
import { MIME_TYPE } from "@workspace/utils/app.config";
import { v4 as uuidv4 } from "uuid";
import { PrimaryCategoryValue, Role } from "@workspace/utils/app.constant";
const userId = getLocalStoredUserId();
console.log('userId ==>', userId);

export const getPrimaryCategory = async (channelId: any) => {
  const apiURL = `/api/channel/v1/read/${channelId}`;
  try {
    const response = await get(apiURL);
    return response?.data?.result;
  } catch (error) {
    throw error;
  }
};

// const PrimaryCategoryData = async () => {
//   const response = await getPrimaryCategory();
//   const collectionPrimaryCategories =
//     response?.channel?.collectionPrimaryCategories;
//   const contentPrimaryCategories = response?.channel?.contentPrimaryCategories;

//   const PrimaryCategory = [
//     ...collectionPrimaryCategories,
//     ...contentPrimaryCategories,
//   ];
//   return PrimaryCategory;
// };

const defaultReqBody = {
  request: {
    filters: {
      createdBy: userId,
    },
    sort_by: {
      lastUpdatedOn: 'desc',
    },
  },
};
const upForReviewReqBody = {
  request: {
    filters: {
      //  createdBy: { userId},
    },
    sort_by: {
      lastUpdatedOn: 'desc',
    },
  },
};
const getReqBodyWithStatus = (
  status: string[],
  query: string,
  limit: number,
  offset: number,
  primaryCategory: any,
  sort_by: any,
  channel: string,
  contentType?: string,
  state?: string
) => {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    var PrimaryCategory =
      JSON.parse(localStorage.getItem('PrimaryCategory') as string) ||
      PrimaryCategoryValue;
  }
  primaryCategory =
    primaryCategory.length === 0 ? PrimaryCategory : primaryCategory;
  if (contentType === 'discover-contents') {
    const userRole = getLocalStoredUserRole();

    if (state) {
      return {
        ...upForReviewReqBody,
        request: {
          ...upForReviewReqBody.request,
          filters: {
            ...upForReviewReqBody.request.filters,
            status,
            primaryCategory,
            createdBy: { '!=': getLocalStoredUserId() },
            state: state,
          },

          query,
          limit,
          offset,
          sort_by,
        },
      };
    }

    return {
      ...upForReviewReqBody,
      request: {
        ...upForReviewReqBody.request,
        filters: {
          ...upForReviewReqBody.request.filters,
          status,
          primaryCategory,
          createdBy: { "!=": getLocalStoredUserId() },
          channel: channel,
        },

        query,
        limit,
        offset,
        sort_by,
      },
    };
  } else if (contentType === 'upReview') {
    return {
      ...upForReviewReqBody,
      request: {
        ...upForReviewReqBody.request,
        filters: {
          ...upForReviewReqBody.request.filters,
          status,
          primaryCategory,
          channel: channel,
        },
        query,
        limit,
        offset,
        sort_by,
      },
    };
  }

  return {
    ...defaultReqBody,
    request: {
      ...defaultReqBody.request,
      filters: {
        ...defaultReqBody.request.filters,
        status,
        primaryCategory,
        channel: channel,
      },
      query,
      limit,
      offset,
      sort_by,
    },
  };
};

export const getContent = async (
  status: string[],
  query: string,
  limit: number,
  offset: number,
  primaryCategory: string[],
  sort_by: any,
  channel: any,
  contentType?: string,
  state?: string
) => {
  const apiURL = '/action/composite/v3/search';
  try {
    const reqBody = getReqBodyWithStatus(
      status,
      query,
      limit,
      offset,
      primaryCategory,
      sort_by,
      channel,
      contentType,
      state
    );
    const response = await post(apiURL, reqBody);
    return response?.data?.result;
  } catch (error) {
    throw error;
  }
};

export const getContentPDF = async ({
  query,
  limit,
  offset,
  sort_by,
  filters,
}: {
  query: string;
  limit: number;
  offset: number;
  sort_by: any;
  filters: {
    status?: string[];
    primaryCategory?: string[];
    channel?: any;
    contentType?: string;
    state?: string;
    [key: string]: any; // Allow additional dynamic filters if needed
  };
}) => {
  const apiURL = "/action/composite/v3/search";

  try {
    const reqBody = {
      request: {
        query,
        filters: {
          ...filters,
          mimeType: "application/pdf",
        },
        sort_by,
        limit,
        offset,
      },
    };

    const response = await post(apiURL, reqBody);
    return response?.data?.result;
  } catch (error) {
    throw error;
  }
};

export const createQuestionSet = async (frameworkId: any) => {
  const apiURL = `/action/questionset/v2/create`;
  const reqBody = {
    request: {
      questionset: {
        name: 'Untitled QuestionSet',
        mimeType: 'application/vnd.sunbird.questionset',
        primaryCategory: 'Practice Question Set',
        code: uuidv4(),
        createdBy: userId,
        framework: frameworkId,
      },
    },
  };

  try {
    const response = await post(apiURL, reqBody);
    return response?.data;
  } catch (error) {
    throw error;
  }
};

export const createAIQuestionsSet = async (payload: {
  questionSetId: string;
  framework: string;
  channel: string;
  difficulty_level: string;
  question_types: string[];
  metadata: {
    name: string;
    board: string;
    medium: string[];
    gradeLevel: string[];
    subject: string[];
    courseType: string[];
    program: string[];
    author: string;
    description: string;
    instructions: string;
    contentLanguage: string;
    assessmentType: string;
  };
  questionsDetails: Array<{
    type: string;
    no: number;
  }>;
  content: Array<{
    id: string;
    url: string;
  }>;
  token: string;
}) => {
  const apiURL = `${process.env.NEXT_PUBLIC_MIDDLEWARE_URL}/tracking/ai-assessment/create`;
  try {
    const response = await post(
      apiURL,
      {
        ...payload,
        createdBy: userId,
      },
      {
        "Content-Type": "application/json",
        Authorization: `Bearer ${payload.token}`,
      }
    );
    return response?.data;
  } catch (error) {
    throw error;
  }
};

export const getAIQuestionSetStatus = async (
  questionSetId: string,
  token: string
) => {
  const apiURL = `${process.env.NEXT_PUBLIC_MIDDLEWARE_URL}/tracking/ai-assessment/read/${questionSetId}`;
  try {
    const response = await get(apiURL, {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    });
    return response?.data;
  } catch (error) {
    throw error;
  }
};

export const updateQuestionSet = async ({ identifier, ...metadata }: any) => {
  const apiURL = "/mfe_workspace/action/questionset/v2/hierarchy/update";
  const reqBody = {
    request: {
      data: {
        lastUpdatedBy: userId,
        nodesModified: {
          [identifier]: {
            root: true,
            objectType: "QuestionSet",
            isNew: false,
            metadata,
          },
        },
        hierarchy: {
          [identifier]: {
            name: "Untitled QuestionSet",
            children: [],
            root: true,
          },
        },
      },
    },
  };
  const response = await patch(apiURL, reqBody, {
    Accept: "application/json, text/plain, */*",
    "Content-Type": "application/json",
    // Add more headers if needed, e.g., authorization, channel, etc.
  });
  return response?.data;
};

export const deleteContent = async (identifier: string, mimeType: string) => {
  const questionsetRetireURL = `/action/questionset/v2/retire/${identifier}`;
  const contentRetireURL = `/action/content/v3/retire/${identifier}`;
  let apiURL = '';
  if (mimeType === MIME_TYPE.QUESTIONSET_MIME_TYPE) {
    apiURL = questionsetRetireURL;
  } else if (
    mimeType !== MIME_TYPE.QUESTIONSET_MIME_TYPE
    // mimeType !== MIME_TYPE.COLLECTION_MIME_TYPE
  ) {
    apiURL = contentRetireURL;
  }
  try {
    const response = await delApi(apiURL); // Assuming you have a 'del' method that handles DELETE
    return response?.data?.result;
  } catch (error) {
    throw error;
  }
};

export const createCourse = async (
  userId: any,
  channelId: any,
  contentFW: any,
  targetFW: any
) => {
  const apiURL = `/action/content/v3/create`;

  const reqBody = {
    request: {
      content: {
        code: uuidv4(), // Generate a unique ID for 'code'
        name: 'Untitled Course',
        createdBy: userId,
        createdFor: [channelId],
        mimeType: MIME_TYPE.COURSE_MIME_TYPE,
        resourceType: 'Course',
        primaryCategory: 'Course',
        contentType: 'Course',
        framework: contentFW,
        targetFWIds: [targetFW],
      },
    },
  };

  try {
    const response = await post(apiURL, reqBody);
    return response?.data;
  } catch (error) {
    console.error('Error creating course:', error);
    throw error;
  }
};

export const publishContent = async (
  identifier: any,
  publishChecklist?: any
) => {
  const requestBody = {
    request: {
      content: {
        lastPublishedBy: userId,
        publishChecklist: publishChecklist,
      },
    },
  };

  try {
    const response = await post(
      `/action/content/v3/publish/${identifier}`,
      requestBody
    );
    return response.data;
  } catch (error) {
    console.error('Error during publishing:', error);
    throw error;
  }
};

export const submitComment = async (
  identifier: any,
  comment: any,
  rejectReasons?: any
) => {
  const requestBody = {
    request: {
      content: {
        rejectComment: comment,
        rejectReasons: rejectReasons,
      },
    },
  };

  try {
    const response = await post(
      `/action/content/v3/reject/${identifier}`,
      requestBody
    );
    return response.data;
  } catch (error) {
    console.error('Error submitting comment:', error);
    throw error;
  }
};

export const getContentHierarchy = async ({
  doId,
  contentMode,
}: {
  doId: string;
  contentMode: string;
}): Promise<any> => {
  let apiUrl: string = `/action/content/v3/hierarchy/${doId}`;
  if (contentMode == "edit") {
    // apiUrl = `/action/content/v3/hierarchy/${doId}?mode=edit`;
    apiUrl = `/action/content/v3/hierarchy/${doId}`;
  }

  try {
    console.log('Request data', apiUrl);
    const response = await get(apiUrl);
    // console.log('response', response);
    return response;
  } catch (error) {
    console.error('Error in getContentHierarchy Service', error);
    throw error;
  }
};
export const getFrameworkDetails = async (frameworkId: any): Promise<any> => {
  const apiUrl: string = `/api/framework/v1/read/${frameworkId}`;

  try {
    const response = await get(apiUrl);
    return response?.data;
  } catch (error) {
    console.error('Error in getting Framework Details', error);
    return error;
  }
};
export const getFormFields = async (): Promise<any> => {
  const apiUrl: string = `/action/data/v1/form/read`;

  try {
    const response = await post(apiUrl, {
      request: {
        action: 'publish',
        type: 'content',
        subType: 'resource',
      },
    });
    return response?.data;
  } catch (error) {
    console.error('Error in getting Framework Details', error);
    return error;
  }
};
