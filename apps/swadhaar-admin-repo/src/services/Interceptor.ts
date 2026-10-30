import axios from 'axios';
import TenantService from './TenantService';
import { SWADHAAR_ACADEMIC_YEAR_ID } from '@/utils/app.constant';
import { getValidAspireToken } from '@/utils/API/aspireHeaders';

const instance = axios.create();

instance.interceptors.request.use(
  (config) => {
    const isAspireUrl = Boolean(
      config.url &&
        (config.url.includes('middleware-qa.aspireleaders.org') ||
          config.url.includes('aspireleaders.org'))
    );

    // Aspire QA Cohort APIs use dedicated Aspire tenant & academic year
    if (isAspireUrl) {
      const cohortTenantId =
        process.env.NEXT_PUBLIC_COHORT_TENANT_ID || 'ef99949b-7f3a-4a5f-806a-e67e683e38f3';
      const cohortAcademicYearId =
        process.env.NEXT_PUBLIC_COHORT_ACADEMIC_YEAR_ID || '9a9e0daa-50dd-4d0e-8d10-36e7bc808f88';
      const orgId =
        process.env.NEXT_PUBLIC_ORG_ID || 'd36d9079-0f42-4ba3-be03-26c9e79509ee';

      // Remove conflicting Swadhaar-specific headers that lead to 404 on Aspire middleware
      if (config.headers?.delete) {
        config.headers.delete('x-tenant-id');
        config.headers.delete('x-channel-id');
        config.headers.delete('userid');
      }
      delete config.headers['X-Tenant-Id'];
      delete config.headers['x-tenant-id'];
      delete config.headers['X-Channel-Id'];
      delete config.headers['x-channel-id'];
      delete config.headers['userId'];
      delete config.headers['userid'];

      const token = getValidAspireToken();
      if (token) {
        const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        if (config.headers?.set) {
          config.headers.set('Authorization', authHeader);
        } else {
          config.headers.Authorization = authHeader;
        }
      }
      // Always enforce the correct Aspire tenant & academic year headers
      if (config.headers?.set) {
        config.headers.set('tenantid', cohortTenantId);
        config.headers.set('academicyearid', cohortAcademicYearId);
        config.headers.set('organisationid', orgId);
      } else {
        config.headers.tenantid = cohortTenantId;
        config.headers.academicyearid = cohortAcademicYearId;
        config.headers.organisationid = orgId;
      }

      return config;
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      const token = localStorage.getItem('token');
      if (token && config.url && !config.url.endsWith('user/v1/auth/login') && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      const academicYearId = localStorage.getItem('academicYearId') || process.env.NEXT_PUBLIC_ACADEMIC_YEAR_ID || SWADHAAR_ACADEMIC_YEAR_ID;
      if (academicYearId && !config.headers.academicyearid) {
        config.headers.academicyearid = academicYearId;
      }

      const storedOrgId = localStorage.getItem('organisationId') || process.env.NEXT_PUBLIC_ORG_ID || 'd36d9079-0f42-4ba3-be03-26c9e79509ee';
      if (storedOrgId) {
        if (!config.headers.organisationid) {
          config.headers.organisationid = storedOrgId;
        }
        if (!config.headers.organisationId) {
          config.headers.organisationId = storedOrgId;
        }
      }

      const storedUserId = localStorage.getItem('userId');
      if (storedUserId) {
        if (!config.headers.userId) {
          config.headers.userId = storedUserId;
        }
        if (!config.headers.userid) {
          config.headers.userid = storedUserId;
        }
      }
    } else {
      const defaultAcademicYearId = process.env.NEXT_PUBLIC_ACADEMIC_YEAR_ID || SWADHAAR_ACADEMIC_YEAR_ID;
      if (!config.headers.academicyearid) {
        config.headers.academicyearid = defaultAcademicYearId;
      }
      const defaultOrgId = process.env.NEXT_PUBLIC_ORG_ID || 'd36d9079-0f42-4ba3-be03-26c9e79509ee';
      if (!config.headers.organisationid) {
        config.headers.organisationid = defaultOrgId;
      }
      if (!config.headers.organisationId) {
        config.headers.organisationId = defaultOrgId;
      }
    }

    const tenantId = TenantService.getTenantId();
    const channelId = TenantService.getChannelId();

    // Standard headers across Sunbird / Shiksha / Swadhaar APIs (preserve if already provided)
    if (!config.headers.tenantid && !config.headers.tenantId) {
      config.headers.tenantid = tenantId;
    }
    if (!config.headers['X-Tenant-Id']) {
      config.headers['X-Tenant-Id'] = tenantId;
    }
    if (!config.headers['X-Channel-Id']) {
      config.headers['X-Channel-Id'] = channelId;
    }

    return config;
  },
  (error) => {
    throw error;
  }
);

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const url = error.config?.url || '';
    const isAspireUrl = url.includes('middleware-qa.aspireleaders.org') || url.includes('aspireleaders.org');
    const isCoursesOrLms = url.includes('/courses') || url.includes('/lms-service');
    const isAuthRoute =
      url.includes('/account/login') ||
      url.includes('/user/send-otp') ||
      url.includes('/user/verify-otp') ||
      url.includes('/user/auth');

    // Do NOT redirect to /logout on Aspire, LMS, or non-auth routes
    if (error?.response?.status === 401) {
      console.warn('401 Unauthorized encountered for:', url);
      // Suppress forced logout to allow page rendering without kicking user out
    }
    throw error;
  }
);

export default instance;
