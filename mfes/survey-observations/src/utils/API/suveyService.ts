import { post, get } from '@shared-lib';
type FileItem = {
  name: string;
  url: string;
  previewUrl?: string;
  request?: any;
  ref?: string;
};

type SubAnswer = {
  fileName?: FileItem[];
  [key: string]: any;
};

type Answer = {
  fileName?: FileItem[];
  value?: any;
  [key: string]: any;
};

type Evidence = {
  answers?: Record<string, Answer>;
};

type DataObject = {
  evidence?: Evidence;
};

const updatePreviewUrls = (obj: DataObject): void => {
  const answers = obj?.evidence?.answers;
  if (!answers) return;

  Object.values(answers).forEach((answer: Answer) => {
    if (Array.isArray(answer.fileName)) {
      answer.fileName.forEach((file: FileItem) => {
        if (file.url) {
          file.previewUrl = file.url;
        }
      });
    }

    // Handle nested participant matrix values
    if (Array.isArray(answer.value)) {
      answer.value.forEach((participant: any) => {
        if (participant && typeof participant === 'object') {
          Object.values(participant).forEach((subAnswer: any) => {
            if (Array.isArray(subAnswer.fileName)) {
              subAnswer.fileName.forEach((file: FileItem) => {
                if (file.url) {
                  file.previewUrl = file.url;
                }
              });
            }
          });
        }
      });
    }
  });
};

export const targetSolution = async ({
  state,
  district,
}: // block,
any): Promise<any> => {
  try {
    const data = {
      state,
      district,
      //  block,
    };
    const apiUrl: string = `${process.env.NEXT_PUBLIC_SURVEY_URL}/solutions/targetedSolutions?type=observation&currentScopeOnly=true`;

    const headers = {
      'X-auth-token': localStorage.getItem('token'),
    };

    const response = await post(apiUrl, data, headers);
    return response?.data;
  } catch (error) {
    console.error('Error in fetching attendance list', error);
  }
};
export const fetchEntities = async ({ solutionId }: any): Promise<any> => {
  try {
    const apiUrl: string = `${process.env.NEXT_PUBLIC_SURVEY_URL}/observations/entities?solutionId=${solutionId}`;

    const headers = {
      'X-auth-token': localStorage.getItem('token'),
    };

    const response = await post(apiUrl, {}, headers);
    return response?.data;
  } catch (error) {
    console.error('Error in fetching attendance list', error);
  }
};
export const fetchQuestion = async ({
  observationId,
  entityId,
  tempSubmissionNumber,
}: any): Promise<any> => {
  try {
    let querySubNum = '';
    if (tempSubmissionNumber) {
      querySubNum = `&submissionNumber=${tempSubmissionNumber}`;
    }
    const apiUrl: string = `${process.env.NEXT_PUBLIC_SURVEY_URL}/observations/assessment/${observationId}?entityId=${entityId}${querySubNum}`;

    const headers = {
      'X-auth-token': localStorage.getItem('token'),
    };

    const response = await post(apiUrl, {}, headers);
    return response?.data?.result;
  } catch (error) {
    console.error('Error in fetching attendance list', error);
  }
};

export const fetchObservSublist = async ({
  observationId,
  entityId,
}: any): Promise<any> => {
  try {
    const apiUrl: string = `${process.env.NEXT_PUBLIC_SURVEY_URL}/observationSubmissions/list/${observationId}?entityId=${entityId}`;

    const headers = {
      'X-auth-token': localStorage.getItem('token'),
    };

    const response = await get(apiUrl, headers);
    return response?.data?.result;
  } catch (error) {
    console.error('Error in fetching attendance list', error);
  }
};

export const createAnotherSubmission = async ({
  observationId,
  entityId,
}: any): Promise<any> => {
  try {
    const apiUrl: string = `${process.env.NEXT_PUBLIC_SURVEY_URL}/observationSubmissions/create/${observationId}?entityId=${entityId}`;

    const headers = {
      'X-auth-token': localStorage.getItem('token'),
    };

    const response = await post(apiUrl, {}, headers);
    return response?.data?.result;
  } catch (error) {
    console.error('Error in fetching attendance list', error);
  }
};

export const addEntities = async ({
  data,
  observationId,
}: any): Promise<any> => {
  try {
    const apiUrl: string = `${process.env.NEXT_PUBLIC_SURVEY_URL}/observations/updateEntities/${observationId}`;

    const headers = {
      'X-auth-token': localStorage.getItem('token'),
    };

    const response = await post(apiUrl, data, headers);
    return response?.data;
  } catch (error) {
    console.error('Error in fetching attendance list', error);
  }
};

export const checkEntityStatus = async ({
  observationId,
  entityId,
}: any): Promise<any> => {
  try {
    const apiUrl: string = `${process.env.NEXT_PUBLIC_SURVEY_URL}/observationSubmissions/list/${observationId}?entityId=${entityId}`;

    const headers = {
      'X-auth-token': localStorage.getItem('token'),
    };

    const response = await post(apiUrl, {}, headers);
    return response?.data;
  } catch (error) {
    console.error('Error in fetching attendance list', error);
  }
};

export const updateSubmission = async ({
  submissionId,
  submissionData,
}: any): Promise<any> => {
  try {
    updatePreviewUrls(submissionData);
    console.log(submissionData);

    // if(submissionData.evidence.answers.fileName)
    const apiUrl: string = `${process.env.NEXT_PUBLIC_SURVEY_URL}/observationSubmissions/update/${submissionId}`;

    const headers = {
      'X-auth-token': localStorage.getItem('token'),
    };

    const response = await post(apiUrl, submissionData, headers);
    return response?.data?.result;
  } catch (error) {
    console.error('Error in fetching attendance list', error);
  }
};
