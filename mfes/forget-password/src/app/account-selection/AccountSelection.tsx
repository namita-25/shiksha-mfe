'use client';

import React, { useEffect, useState } from 'react';
import SimpleModal from '@forget-password/Components/SimpleModal/SimpleModal';

import AccountSelectionForm from '@forget-password/Components/AccountSelectionForm/AccountSelectionForm';
import OtpVerificationComponent from '@forget-password/Components/OtpVerificationComponent/OtpVerificationComponent';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { userCheck } from '@forget-password/utils/API/userService';
import { showToastMessage } from '@forget-password/Components/ToastComponent/Toastify';
import { sendOTP, verifyOTP } from '@forget-password/utils/API/OtPService';
import { maskMobileNumber } from '@forget-password/utils/Helper/helper';
import { Box } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
type UserAccount = {
  name: string;
  username: string;
};

const AccountSelection = () => {
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [hash, setHash] = useState<string>('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const mobile = searchParams.get('mobile');

  const [usernames, setUsernames] = useState<UserAccount[]>([]);
  const [selectedUserName, setSelectedUserName] = useState('');

  const [otpmodal, setOtpModal] = useState(false);
  const [otp, setOtp] = useState<string[]>(['', '', '', '']);
  useEffect(() => {
    const fetchUsernameByMobile = async () => {
      try {
        if (mobile) {
          const response = await userCheck({ mobile });
          console.log('response', response.result);
          const userList = response.result.map((user: any) => ({
            name: [user.firstName, user.middleName, user.lastName]
              .filter(Boolean)
              .join(' '),
            username: user.username,
          }));
          setUsernames(userList);
        }
      } catch {
        showToastMessage('Please enter correct username', 'info');
      }
    };
    fetchUsernameByMobile();
  }, []);
  const handleNextStep = async (value: string) => {
    const isValidMobileNumber = /^[0-9]{10}$/.test(value);

    if (isValidMobileNumber) {
      //const userList = await fetchUsernamesByMobile(value);
    } else {
      setSelectedUserName(value);
      const mobile = await fetchMobileByUsername(value);

      //  let mobile = '9087'; // currently assume here dummy mob number
      if (mobile) {
        try {
          let reason = 'forgot';
          const response = await sendOTP({ mobile, reason });
          console.log('sendOTP', response);
          setHash(response?.result?.data?.hash);
          setOtpModal(true);
          setMobileNumber(mobile);
        } catch (error) {}
      }
    }

    console.log('User input:', value);
  };

  const onVerify = async () => {
    // const isValid = await verifyOtp(otp);
    try {
      let mobile = mobileNumber;
      let reason = 'forgot';
      let username = selectedUserName;
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
        setOtpModal(false);
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
      showToastMessage('Please enter correct username', 'info');
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
  const handleCloseModal = () => setOtpModal(false);

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
          background: 'linear-gradient(to bottom, #fff7e6, #fef9ef)',
        }}
        onClick={() => router.back()}
      >
        <ArrowBackIcon
          sx={{ color: '#4B5563', '&:hover': { color: '#000' } }}
        />
      </Box>
      <AccountSelectionForm userAccounts={usernames} onNext={handleNextStep} />
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

export default AccountSelection;
