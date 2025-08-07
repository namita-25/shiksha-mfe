import { sendOTP } from './OtPService';

const baseurl = process.env.NEXT_PUBLIC_MIDDLEWARE_URL;

export const API_ENDPOINTS = {
  userCheck: `${baseurl}/user/check`,
  sendOTP: `${baseurl}/user/send-otp`,
  verifyOTP: `${baseurl}/user/verify-otp`,
  resetPassword: `${baseurl}/user/reset-password`,
  forgetPassword: `${baseurl}/user/forgot-password`,
};
