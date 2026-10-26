import axios from 'axios';
import TenantService from './TenantService';
import { SWADHAAR_ACADEMIC_YEAR_ID } from '@/utils/app.constant';

const instance = axios.create();

instance.interceptors.request.use(
  (config) => {
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
    if (!config.headers.tenantid) {
      config.headers.tenantid = tenantId;
    }
    if (!config.headers.tenantId) {
      config.headers.tenantId = tenantId;
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
    const isAuthRoute =
      error.config?.url?.includes('/account/login') ||
      error.config?.url?.includes('/user/send-otp') ||
      error.config?.url?.includes('/user/verify-otp') ||
      error.config?.url?.includes('/user/auth');

    if (error?.response?.status === 401 && typeof window !== 'undefined' && !isAuthRoute) {
      window.location.href = '/logout';
    }
    throw error;
  }
);

export default instance;
