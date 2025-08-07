import { URL_CONFIG } from '../utils/url.config';
import { get } from '@shared-lib';
interface ContentSearchResponse {
  ownershipType?: string[];
  publish_type?: string;
  copyright?: string;
  se_gradeLevelIds?: string[];
  keywords?: string[];
  subject?: string[];
  targetMediumIds?: string[];
  channel?: string;
  downloadUrl?: string;
  organisation?: string[];
  language?: string[];
  mimeType?: string;
  variants?: {
    spine?: {
      ecarUrl?: string;
      size?: string;
    };
    online?: {
      ecarUrl?: string;
      size?: string;
    };
  };
  leafNodes?: string[];
  targetGradeLevelIds?: string[];
  objectType?: string;
  se_mediums?: string[];
  appIcon?: string;
  primaryCategory?: string;
  contentEncoding?: string;
  lockKey?: string;
  generateDIALCodes?: string;
  totalCompressedSize?: number;
  mimeTypesCount?: Record<string, number>;
  contentType?: string;
  se_gradeLevels?: string[];
  trackable?: {
    enabled?: string;
    autoBatch?: string;
  };
  identifier?: string;
  audience?: string[];
  se_boardIds?: string[];
  subjectIds?: string[];
  toc_url?: string;
  visibility?: string;
  contentTypesCount?: Record<string, number>;
  author?: string;
  consumerId?: string;
  childNodes?: string[];
  discussionForum?: {
    enabled?: string;
  };
  mediaType?: string;
  osId?: string;
  graph_id?: string;
  nodeType?: string;
  lastPublishedBy?: string;
  version?: number;
  se_subjects?: string[];
  license?: string;
  size?: number;
  lastPublishedOn?: string;
  name?: string;
  attributions?: string[];
  targetBoardIds?: string[];
  status?: string;
  code?: string;
  publishError?: string | null;
  credentials?: {
    enabled?: string;
  };
  prevStatus?: string;
  description?: string;
  posterImage?: string;
  idealScreenSize?: string;
  createdOn?: string;
  se_boards?: string[];
  targetSubjectIds?: string[];
  se_mediumIds?: string[];
  copyrightYear?: number;
  contentDisposition?: string;
  additionalCategories?: string[];
  lastUpdatedOn?: string;
  dialcodeRequired?: string;
  createdFor?: string[];
  creator?: string;
  os?: string[];
  se_subjectIds?: string[];
  se_FWIds?: string[];
  targetFWIds?: string[];
  pkgVersion?: number;
  versionKey?: string;
  migrationVersion?: number;
  idealScreenDensity?: string;
  framework?: string;
  depth?: number;
  s3Key?: string;
  lastSubmittedOn?: string;
  createdBy?: string;
  compatibilityLevel?: number;
  leafNodesCount?: number;
  userConsent?: string;
  resourceType?: string;
  node_id?: number;
}
// Define the payload

export const contentReadAPI = async (doId: string) => {
  try {
    // Ensure the environment variable is defined
    const searchApiUrl = process.env.NEXT_PUBLIC_MIDDLEWARE_URL;
    if (!searchApiUrl) {
      throw new Error('Search API URL environment variable is not configured');
    }

    // Execute the request
    const response = await get(
      `${searchApiUrl}/interface/v1/action/content/v3/read/${doId}`,
      {
        tenantId: localStorage.getItem('tenantId') || '',
        Authorization: `Bearer ${localStorage.getItem('accToken') || ''}`,
      }
    );
    const res = response?.data?.result?.content;

    return res;
  } catch (error) {
    console.error('Error in ContentSearch:', error);
    throw error;
  }
};

export const fetchContent = async (identifier: any) => {
  try {
    const API_URL = `${URL_CONFIG.API.CONTENT_READ}${identifier}`;
    const FIELDS = URL_CONFIG.PARAMS.CONTENT_GET;
    const LICENSE_DETAILS = URL_CONFIG.PARAMS.LICENSE_DETAILS;
    const MODE = 'edit';
    const response = await get(
      `${API_URL}?fields=${FIELDS}&mode=${MODE}&licenseDetails=${LICENSE_DETAILS}`,
      {
        tenantId: localStorage.getItem('tenantId') ?? '',
        Authorization: `Bearer ${localStorage.getItem('accToken') ?? ''}`,
      }
    );
    console.log('response =====>', response);
    return response?.data?.result?.content;
  } catch (error) {
    console.error('Error fetching content:', error);
    throw error;
  }
};
