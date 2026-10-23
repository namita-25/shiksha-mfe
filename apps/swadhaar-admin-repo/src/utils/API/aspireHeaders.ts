export const getAspireHeaders = (customHeaders: Record<string, string> = {}): Record<string, string> => {
  let authToken = process.env.NEXT_PUBLIC_ASPIRE_BEARER_TOKEN || '';

  if (typeof window !== 'undefined') {
    const customAspireToken = localStorage.getItem('aspireToken');
    if (customAspireToken) {
      authToken = customAspireToken;
    } else {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const parts = storedToken.split('.');
          if (parts.length === 3) {
            const decoded = JSON.parse(atob(parts[1]));
            if (decoded.iss && decoded.iss.includes('aspireleaders.org')) {
              authToken = storedToken;
            }
          }
        } catch (e) {
          // ignore parsing error
        }
      }
    }
  }

  const authHeader = authToken
    ? authToken.startsWith('Bearer ')
      ? authToken
      : `Bearer ${authToken}`
    : '';

  return {
    academicyearid: process.env.NEXT_PUBLIC_ACADEMIC_YEAR_ID || '9a9e0daa-50dd-4d0e-8d10-36e7bc808f88',
    tenantid: process.env.NEXT_PUBLIC_TENANT_ID || 'ef99949b-7f3a-4a5f-806a-e67e683e38f3',
    organisationid: process.env.NEXT_PUBLIC_ORG_ID || 'd36d9079-0f42-4ba3-be03-26c9e79509ee',
    Authorization: authHeader,
    accept: 'application/json, text/plain, */*',
    'content-type': 'application/json',
    ...customHeaders,
  };
};
