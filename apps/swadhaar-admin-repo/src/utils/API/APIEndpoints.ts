const baseurl = (process.env.NEXT_PUBLIC_MIDDLEWARE_URL || 'https://swadhaar-middleware-qa.tekdinext.com').replace(/\/+$/, '');
const lmsBase = (process.env.NEXT_PUBLIC_LMS_SERVICE_URL || `${baseurl}/lms-service/v1`).replace(/\/+$/, '');
const assessmentBase = (process.env.NEXT_PUBLIC_ASSESSMENT_SERVICE_URL || `${baseurl}/assessment/v1`).replace(/\/+$/, '');
const certificateBase = (process.env.NEXT_PUBLIC_CERTIFICATE_SERVICE_URL || `${baseurl}/importuserspecific/certificate`).replace(/\/+$/, '');

const toQueryString = (queryString = ''): string => {
  if (!queryString) return '';
  return queryString.startsWith('?') ? queryString : `?${queryString}`;
};

export const API_ENDPOINTS = {
  // Base URLs
  baseurl,
  lmsBase,
  assessmentBase,
  certificateBase,

  // Content & Framework
  contentRead: (doId: string, fields?: string) => {
    const fieldsQuery = fields ? `?fields=${fields}` : '';
    return `${baseurl}/api/content/v1/read/${doId}${fieldsQuery}`;
  },
  contentCreate: `${baseurl}/action/content/v3/create`,
  contentUpdate: (doId: string) => `${baseurl}/action/content/v3/update/${doId}`,
  contentRetire: (doId: string) => `${baseurl}/action/content/v3/retire/${doId}`,
  contentHierarchy: (doId: string) => `${baseurl}/action/content/v3/hierarchy/${doId}`,
  compositeSearch: `${baseurl}/action/composite/v3/search`,
  framework: (frameworkId: string) => `${baseurl}/framework/v1/read/${frameworkId}`,
  actionObject: `${baseurl}/action/object/category/definition/v1/read?fields=objectMetadata,forms,name,label`,

  // Academic Years & Forms
  academicYearsList: `${baseurl}/academicyears/list`,
  formRead: `${baseurl}/form/read`,
  formReadWithContext: (context: string, contextType: string) => `${baseurl}/form/read?context=${context}&contextType=${contextType}`,

  // Auth & Account
  accountCreate: `${baseurl}/account/create`,
  accountLogin: `${baseurl}/account/login`,
  authRefresh: `${baseurl}/account/auth/refresh`,
  authLogout: `${baseurl}/account/auth/logout`,
  userAuth: `${baseurl}/user/auth`,
  sendOTP: `${baseurl}/user/send-otp`,
  verifyOTP: `${baseurl}/user/verify-otp`,
  resetPassword: `${baseurl}/user/reset-password`,
  suggestUsername: `${baseurl}/user/suggestUsername`,

  // User Management
  adminUserList: `${baseurl}/user/list`,
  userList: process.env.NEXT_PUBLIC_USER_LIST_URL || `${baseurl}/user/v1/list`,
  userRead: (userId: string | string[], fieldValue: boolean = true) =>
    `${process.env.NEXT_PUBLIC_USER_READ_URL || `${baseurl}/user/v1/read`}/${userId}?fieldvalue=${fieldValue}`,
  userUpdate: (userId: string) => `${baseurl}/user/update/${userId}`,

  // Fields / Master Data
  fieldOptionsRead: `${baseurl}/fields/options/read`,
  fieldOptionDelete: (type: string, option: string) => `${baseurl}/fields/options/delete/${type}?option=${option}`,
  fieldUpdate: (fieldId: string) => `${baseurl}/fields/update/${fieldId}`,

  // Cohorts
  myCohorts: (userId: string | string[]) => `${baseurl}/cohort/mycohorts/${userId}`,
  cohortSearch: process.env.NEXT_PUBLIC_COHORT_SEARCH_URL || `${baseurl}/user/v1/cohort/search`,
  cohortMemberListApplication: process.env.NEXT_PUBLIC_COHORT_MEMBER_APPLICATION_URL || `${baseurl}/user/v1/cohortmember/list-application`,
  cohortContentSearch: `${baseurl}/user/cohortcontent/search`,
  cohortMemberList: `${baseurl}/cohortmember/list`,
  cohortCreate: `${baseurl}/cohort/create`,
  cohortUpdate: (cohortId: string) => `${baseurl}/cohort/update/${cohortId}`,
  cohortUpdateUser: (userId?: string) => `${baseurl}/cohort/update/${userId}`,
  cohortMemberBulkCreate: `${baseurl}/cohortmember/bulkCreate`,
  cohortMemberUpdate: (membershipId: string | number) => `${baseurl}/cohortmember/update/${membershipId}`,

  // Tenants
  tenantRead: `${baseurl}/tenant/read`,
  tenantCreate: `${baseurl}/tenant/create`,
  tenantUpdate: (tenantId: string) => `${baseurl}/tenant/update/${tenantId}`,
  tenantDelete: (tenantId: string) => `${baseurl}/tenant/delete/${tenantId}`,
  tenantSearch: `${baseurl}/tenant/search`,

  // Notifications
  notificationSend: `${baseurl}/notification/send`,
  notificationTemplate: `${baseurl}/notification-templates`,

  // Certificates & DID
  issueCertificate: `${certificateBase}/issue`,
  generateDid: `${certificateBase}/generateDid`,
  credentialSchema: `${baseurl}/credential-schema`,
  didGenerate: `${baseurl}/did/generate`,
  courseStatus: `${baseurl}/tracking/user_certificate/user_course_status`,
  courseWiseLernerList: `${baseurl}/tracking/user_certificate/status/search`,
  getCourseName: `${baseurl}/action/composite/v3/search`,
  trackingIssueCertificate: `${baseurl}/tracking/certificate/issue`,
  renderCertificate: `${baseurl}/tracking/certificate/render`,
  downloadCertificate: `${baseurl}/tracking/certificate/render`,

  // LMS Service
  lmsCoursesSearch: (queryString = '') => `${lmsBase}/courses/search${toQueryString(queryString)}`,
  lmsModulesSearch: (queryString = '') => `${lmsBase}/modules/search${toQueryString(queryString)}`,
  lmsCourseHierarchy: (courseId: string) => `${lmsBase}/courses/${courseId}/hierarchy`,
  lmsEnrollments: (userId: string) => `${baseurl}/enrollments?userId=${userId}`,
  lmsLessonAttempt: (lessonId: string, userId: string) => `${baseurl}/tracking/lesson/attempt/${lessonId}?userId=${userId}`,
  lmsConfig: `${baseurl}/config`,

  // Assessment Service
  assessmentHealth: `${assessmentBase}/health`,
  // Tests
  assessmentTests: `${assessmentBase}/tests`,
  assessmentTestById: (id: string) => `${assessmentBase}/tests/${id}`,
  assessmentTestQuestions: (id: string) => `${assessmentBase}/tests/${id}/questions`,
  assessmentTestQuestionsBulk: (id: string) => `${assessmentBase}/tests/${id}/questions/bulk`,
  assessmentTestHierarchy: (id: string) => `${assessmentBase}/tests/${id}/test-hierarchy`,
  assessmentTestHierarchySimple: (id: string) => `${assessmentBase}/tests/${id}/hierarchy`,
  assessmentTestStructure: (testId: string) => `${assessmentBase}/tests/${testId}/structure`,
  assessmentTestClone: (id: string) => `${assessmentBase}/tests/${id}/clone`,
  assessmentTestUserStatus: (testId: string, userId: string) => `${assessmentBase}/tests/${testId}/users/${userId}/status`,
  assessmentTestUserResult: (testId: string, userId: string) => `${assessmentBase}/tests/${testId}/users/${userId}/result`,

  // Sections
  assessmentSections: `${assessmentBase}/sections`,
  assessmentSectionById: (id: string) => `${assessmentBase}/sections/${id}`,
  assessmentSectionsByTestId: (testId: string) => `${assessmentBase}/sections/test/${testId}`,

  // Questions
  assessmentQuestions: `${assessmentBase}/questions`,
  assessmentQuestionById: (id: string) => `${assessmentBase}/questions/${id}`,
  assessmentQuestionAssociateOption: `${assessmentBase}/questions/associate-option`,
  assessmentQuestionChildQuestions: (id: string) => `${assessmentBase}/questions/${id}/child-questions`,

  // Attempts
  assessmentAttemptStart: (testId: string, userId: string) => `${assessmentBase}/attempts/start/${testId}?userId=${userId}`,
  assessmentAttemptResume: (attemptId: string) => `${assessmentBase}/attempts/${attemptId}/resume`,
  assessmentAttemptAnswers: (attemptId: string) => `${assessmentBase}/attempts/${attemptId}/answers`,
  assessmentAttemptSubmit: (attemptId: string) => `${assessmentBase}/attempts/${attemptId}/submit`,
  assessmentAttemptAnswersheet: (attemptId: string) => `${assessmentBase}/attempts/${attemptId}/answersheet`,
  assessmentAttemptReview: (attemptId: string) => `${assessmentBase}/attempts/review/${attemptId}`,
  assessmentAttemptCheckResultImported: `${assessmentBase}/attempts/check-result-imported`,

  // Rules
  assessmentRules: `${assessmentBase}/rules`,
  assessmentRuleById: (id: string) => `${assessmentBase}/rules/${id}`,
};
