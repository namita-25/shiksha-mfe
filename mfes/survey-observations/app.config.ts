export const tenantId =
  typeof window !== 'undefined' && localStorage.getItem('tenantId');

if (!tenantId && typeof window !== 'undefined') {
  console.warn(
    'NEXT_PUBLIC_TENANT_ID is not set in the environment variables.'
  );
}

export const YOUTHNET_USER_ROLE = {
  MENTOR_LEAD: '',
  LEAD: 'Lead',
  INSTRUCTOR: 'Instructor',
  LEARNER: 'Learner',
};
export enum cohortHierarchy {
  BLOCK = 'BLOCK',
  COHORT = 'COHORT',
  DISTRICT = 'DISTRICT',
  VILLAGE = 'VILLAGE',
  STATE = 'STATE',
}
export enum VolunteerField {
  IS_VOLUNTEER = 'IS_VOLUNTEER',
  YES = 'yes',
  NO = 'no',
}
