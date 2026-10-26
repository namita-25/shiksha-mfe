import TenantService from '@/services/TenantService';
import { SWADHAAR_ACADEMIC_YEAR_ID } from '@/utils/app.constant';

const resolveToken = (): string => {
  const envToken =
    process.env.NEXT_PUBLIC_BEARER_TOKEN ||
    process.env.NEXT_PUBLIC_ASPIRE_BEARER_TOKEN ||
    '';

  if (typeof window === 'undefined') return envToken;

  const storedToken = localStorage.getItem('token') || localStorage.getItem('aspireToken');
  return storedToken || envToken;
};

const toBearerHeader = (token: string): string => {
  if (!token) return '';
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
};

export const getServiceHeaders = (customHeaders: Record<string, string> = {}): Record<string, string> => {
  const academicYearId =
    (typeof window !== 'undefined' ? localStorage.getItem('academicYearId') : null) ||
    process.env.NEXT_PUBLIC_ACADEMIC_YEAR_ID ||
    SWADHAAR_ACADEMIC_YEAR_ID;

  const tenantId =
    process.env.NEXT_PUBLIC_TENANT_ID ||
    TenantService.getTenantId();

  const orgId =
    process.env.NEXT_PUBLIC_ORG_ID ||
    (typeof window !== 'undefined' ? localStorage.getItem('organisationId') : null) ||
    'd36d9079-0f42-4ba3-be03-26c9e79509ee';

  const token = resolveToken();

  return {
    academicyearid: academicYearId,
    tenantid: tenantId,
    tenantId: tenantId,
    organisationid: orgId,
    organisationId: orgId,
    'X-Tenant-Id': tenantId,
    'X-Channel-Id': TenantService.getChannelId(),
    ...(token ? { Authorization: toBearerHeader(token) } : {}),
    accept: 'application/json, text/plain, */*',
    'content-type': 'application/json',
    ...customHeaders,
  };
};

// Backward-compatible alias
export const getAspireHeaders = getServiceHeaders;
