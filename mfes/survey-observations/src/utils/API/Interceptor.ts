import axios from 'axios';
import { tenantId } from 'apps/learner-web-app/app.config';

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
    // config.headers.tenantid = '4783a636-1191-487a-8b09-55eca51b5036';
    // config.headers.tenantid = 'fbe108db-e236-48a7-8230-80d34c370800';
    config.headers.tenantid = tenantId;
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
    const originalRequest = error.config;

    if (
      error?.response?.data?.responseCode === 401 &&
      !originalRequest._retry
    ) {
      if (error?.response?.request?.responseURL.includes('/auth/refresh')) {
        window.location.href = '/logout';
      } else {
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
