const baseurl = process.env.NEXT_PUBLIC_MIDDLEWARE_URL;

export const API_ENDPOINTS = {
  framework : (frameworkId: string) => `${baseurl}/api/framework/v1/read/${frameworkId}`,
  actionObject : `${baseurl}/action/object/category/definition/v1/read?fields=objectMetadata,forms,name,label`,

};