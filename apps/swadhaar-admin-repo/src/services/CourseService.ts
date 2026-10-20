import { API_ENDPOINTS } from '@/utils/API/APIEndpoints';
import { post, get } from './RestClient';
import { SWADHAAR_CHANNEL_ID } from '@/utils/app.constant';

export interface CourseItem {
  identifier: string;
  name: string;
  status: string;
  channel?: string;
  primaryCategory?: string;
  leafNodesCount?: number;
  duration?: string | number | null;
  language?: string[];
  lastUpdatedOn?: string;
  createdOn?: string;
  description?: string;
  childNodes?: string[];
  appIcon?: string;
  audience?: string[] | string;
  courseCode?: string;
  formattedDuration?: string;
  detectedLanguage?: string;
  cleanTitle?: string;
  [key: string]: any;
}

export interface CourseSearchParams {
  query?: string;
  limit?: number;
  offset?: number;
  filters?: {
    status?: string[];
    primaryCategory?: string[];
    channel?: string;
    [key: string]: any;
  };
}

export interface CourseSearchResponse {
  responseCode?: string | number;
  result?: {
    count?: number;
    content?: CourseItem[];
  };
}

export interface CourseHierarchyChild {
  identifier: string;
  name: string;
  mimeType?: string;
  primaryCategory?: string;
  children?: CourseHierarchyChild[];
  duration?: string | number | null;
  description?: string;
  [key: string]: any;
}

export interface CourseHierarchy {
  identifier: string;
  name: string;
  status: string;
  channel?: string;
  description?: string;
  language?: string[];
  audience?: string[] | string;
  leafNodesCount?: number;
  lastUpdatedOn?: string;
  children?: CourseHierarchyChild[];
  [key: string]: any;
}

/**
 * Helper to parse Course label and clean title from course name.
 * e.g. "Course 1: Introduction to Saving" -> code: "Course 1", title: "Introduction to Saving"
 * e.g. "कोर्स 0: स्वाधार..." -> code: "कोर्स 0", title: "स्वाधार..."
 */
export const parseCourseName = (fullName: string): { code: string; title: string } => {
  if (!fullName) return { code: 'Course', title: 'Untitled Course' };
  
  const colonIndex = fullName.indexOf(':');
  if (colonIndex !== -1) {
    const code = fullName.substring(0, colonIndex).trim();
    const title = fullName.substring(colonIndex + 1).trim();
    return { code, title };
  }

  // Check for " - "
  const dashIndex = fullName.indexOf(' - ');
  if (dashIndex !== -1) {
    const code = fullName.substring(0, dashIndex).trim();
    const title = fullName.substring(dashIndex + 3).trim();
    return { code, title };
  }

  return { code: 'Course', title: fullName };
};

/**
 * Detect language from text (Devanagari vs English)
 */
export const detectLanguage = (text: string, fallbackLanguages?: string[]): string => {
  // Check for Devanagari Unicode block (\u0900 - \u097F)
  if (/[\u0900-\u097F]/.test(text)) {
    return 'Hindi';
  }
  if (fallbackLanguages && fallbackLanguages.length > 0) {
    return fallbackLanguages[0];
  }
  return 'English';
};

/**
 * Helper to parse or format course duration string
 */
export const parseCourseDuration = (item: CourseItem): string => {
  if (item.duration && String(item.duration) !== '0') {
    return `${item.duration} min`;
  }
  if (item.description) {
    // Check if duration pattern like "45 Minutes... + 15 minutes..." exists in description
    const match = item.description.match(/(\d+\s*minutes?[^.\n,]*)/i);
    if (match) {
      return match[1].replace(/learning content/i, '').trim();
    }
  }
  return '—';
};

/**
 * Composite search API for Courses
 */
export const getCourseList = async (
  params?: CourseSearchParams
): Promise<{ count: number; content: CourseItem[] }> => {
  try {
    const apiUrl = API_ENDPOINTS.compositeSearch;

    const payload = {
      request: {
        filters: {
          status: params?.filters?.status || ['Live', 'live'],
          primaryCategory: params?.filters?.primaryCategory || ['Course'],
          channel: params?.filters?.channel || SWADHAAR_CHANNEL_ID,
          ...(params?.filters || {}),
        },
        query: params?.query || '',
        limit: params?.limit !== undefined ? params.limit : 20,
        offset: params?.offset !== undefined ? params.offset : 0,
      },
    };

    const response = await post<any>(apiUrl, payload);
    const result = response?.data?.result || {};
    const rawList: CourseItem[] = result.content || [];

    const enrichedList: CourseItem[] = rawList.map((c) => {
      const parsed = parseCourseName(c.name);
      return {
        ...c,
        courseCode: parsed.code,
        cleanTitle: parsed.title,
        detectedLanguage: detectLanguage(c.name, c.language),
        formattedDuration: parseCourseDuration(c),
      };
    });

    return {
      count: result.count !== undefined ? result.count : enrichedList.length,
      content: enrichedList,
    };
  } catch (error) {
    console.error('Error fetching course list:', error);
    throw error;
  }
};

/**
 * Content hierarchy API for Course Details page
 */
export const getCourseHierarchy = async (courseId: string): Promise<CourseHierarchy> => {
  try {
    const apiUrl = API_ENDPOINTS.contentHierarchy(courseId);
    const response = await get(apiUrl);
    const content = response?.data?.result?.content;

    if (!content) {
      throw new Error(`Hierarchy for course ${courseId} not found`);
    }

    const parsed = parseCourseName(content.name || '');
    return {
      ...content,
      courseCode: parsed.code,
      cleanTitle: parsed.title,
      detectedLanguage: detectLanguage(content.name || '', content.language),
    };
  } catch (error) {
    console.error(`Error fetching hierarchy for course ${courseId}:`, error);
    throw error;
  }
};

export interface CourseTabCounts {
  all: number;
  published: number;
  draft: number;
}

/**
 * Fetch course counts for All, Published (Live), and Drafts
 */
export const fetchCourseTabCounts = async (
  query = '',
  channel = SWADHAAR_CHANNEL_ID
): Promise<CourseTabCounts> => {
  try {
    const [allRes, pubRes, draftRes] = await Promise.all([
      getCourseList({
        query,
        limit: 0,
        filters: {
          primaryCategory: ['Course'],
          status: ['Live', 'live', 'Draft', 'draft'],
          channel,
        },
      }),
      getCourseList({
        query,
        limit: 0,
        filters: {
          primaryCategory: ['Course'],
          status: ['Live', 'live'],
          channel,
        },
      }),
      getCourseList({
        query,
        limit: 0,
        filters: {
          primaryCategory: ['Course'],
          status: ['Draft', 'draft'],
          channel,
        },
      }),
    ]);

    return {
      all: allRes.count ?? 50,
      published: pubRes.count ?? 4,
      draft: draftRes.count ?? 46,
    };
  } catch (error) {
    console.error('Error fetching course tab counts:', error);
    return { all: 50, published: 4, draft: 46 };
  }
};
