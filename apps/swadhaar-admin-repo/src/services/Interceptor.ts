import axios from 'axios';
import TenantService from './TenantService';

const instance = axios.create();

instance.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const token = localStorage.getItem('token');
      if (token && config.url && !config.url.endsWith('user/v1/auth/login')) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      const academicYearId = localStorage.getItem('academicYearId');
      if (academicYearId) {
        config.headers.academicyearid = academicYearId;
      }
    }
    
    const tenantId = TenantService.getTenantId();
    const channelId = TenantService.getChannelId();

    // Standard headers across Sunbird / Shiksha MFE APIs
    config.headers.tenantid = tenantId;
    config.headers['X-Tenant-Id'] = tenantId;
    config.headers['X-Channel-Id'] = channelId;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error?.response?.status === 401 && typeof window !== 'undefined') {
      window.location.href = '/logout';
    }
    return Promise.reject(error);
  }
);

export default instance;
