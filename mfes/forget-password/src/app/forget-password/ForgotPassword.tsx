'use client';

import React, { useState } from 'react';
import SimpleModal from '@forget-password/Components/SimpleModal/SimpleModal';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import OtpVerificationComponent from '@forget-password/Components/OtpVerificationComponent/OtpVerificationComponent';
import ForgotPasswordComponent from '@forget-password/Components/ForgotPasswordComponent/ForgotPasswordComponent';
import { sendOTP, verifyOTP } from '@forget-password/utils/API/OtPService';
import { maskMobileNumber } from '@forget-password/utils/Helper/helper';
import { userCheck } from '@forget-password/utils/API/userService';
import { showToastMessage } from '@forget-password/Components/ToastComponent/Toastify';
import { Box } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
const ForgotPassword = ({}) => {
  const router = useRouter();
  const pathname = usePathname();

  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [hash, setHash] = useState<string>('');
  const searchParams = useSearchParams();
  const redirectionRoute = searchParams.get('redirectionRoute');
  if (redirectionRoute) {
    localStorage.setItem('redirectionRoute', redirectionRoute);
  }
  const [otpmodal, setOtpModal] = useState(false);
  const [otp, setOtp] = useState<string[]>(['', '', '', '']);
  const [enterdUserName, setEnterdUserName] = useState('');

  const handleNextStep = async (value: string) => {
    const isValidMobileNumber = /^[0-9]{10}$/.test(value);

    if (isValidMobileNumber) {
      let mobile=value;
       const response = await userCheck({ mobile });
      console.log('response', response?.result[0]?.mobile);
      if (response?.result[0]?.mobile) {
       router.push(`/account-selection?mobile=${value}`);
        }
        else{
                  showToastMessage('Please enter valid mobile number', 'error');

        }
    } else {
      setEnterdUserName(value);
      const mobile = await fetchMobileByUsername(value);

      if (mobile) {
        try {
          let reason = 'forgot';
          const response = await sendOTP({ mobile, reason });
          console.log('sendOTP', response);
          setHash(response?.result?.data?.hash);
          setOtpModal(true);
          setMobileNumber(mobile);
        } catch (error: any) {
          showToastMessage('Failed to send otp', 'error');
        }
      }
    }

    console.log('User input:', value);
  };

  const onVerify = async () => {
    try {
      let mobile = mobileNumber;
      let reason = 'forgot';
      let username = enterdUserName;
      const response = await verifyOTP({
        mobile,
        reason,
        otp: otp.join(''),
        hash,
        username,
      });
      console.log('verifyOtp', response);
      const isValid = response.result.success;
      localStorage.setItem('tokenForResetPassword', response.result.token); // temporary assume true

      if (isValid) {
        router.push('/reset-Password');
      } else {
        showToastMessage('Please enter valid otp', 'error');
      }
    } catch (error) {
      showToastMessage('Please enter valid otp', 'error');
    }
  };
  const fetchMobileByUsername = async (username: string) => {
    try {
      const response = await userCheck({ username });
      console.log('response', response?.result[0]?.mobile);
      // response.result[0].mobile = '8793607919'; // temporary hardcoded
      if (response?.result[0]?.mobile) {
        return response?.result[0]?.mobile.toString();
      } else {
        showToastMessage(
          'Unable to find mobile number on given username',
          'error'
        );
      }
    } catch {
      showToastMessage('please enter correct username', 'error');
    }
  };

  const onResend = async () => {
    try {
      let reason = 'forgot';
      const response = await sendOTP({ mobile: mobileNumber, reason });
      console.log('sendOTP', response);
      setHash(response?.result?.data?.hash);
    } catch (error) {}
  };
  const handleCloseModal = () => {
    setOtpModal(false);
    setOtp(['', '', '', '']);
  };

  return (
    <Box
      sx={{
        background: 'linear-gradient(to bottom, #fff7e6, #fef9ef)',
      }}
    >
      <Box
        sx={{
          p: 2,
          cursor: 'pointer',
          width: 'fit-content',
        }}
        onClick={() => {
         if (localStorage.getItem('appMode')) {
      const query = new URLSearchParams({
        tab: 'learnerAndroidApp',

      }).toString();
      router.push(`${pathname}?${query}`);
                 //   window.open("pratham://learnerapp", '_self');

         } 
        else
        {
          router.back();
        }
          
         }}
      >
        <ArrowBackIcon
          sx={{ color: '#4B5563', '&:hover': { color: '#000' } }}
        />
      </Box>
      <ForgotPasswordComponent onNext={handleNextStep} />

      <SimpleModal
        open={otpmodal && mobileNumber ? true : false}
        onClose={handleCloseModal}
        showFooter
        primaryText={'Verify OTP'}
        modalTitle={'Verify Your Phone Number'}
        primaryActionHandler={onVerify}
      >
        <OtpVerificationComponent
          onResend={onResend}
          otp={otp}
          setOtp={setOtp}
          maskedNumber={maskMobileNumber(mobileNumber)}
        />
      </SimpleModal>
    </Box>
  );
};

export default ForgotPassword;
