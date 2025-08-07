'use client';

import React, { useState } from 'react';
import SimpleModal from '@forget-password/Components/SimpleModal/SimpleModal';
import ResetPasswordForm from '@forget-password/Components/ResetPasswordForm/ResetPasswordForm';
import PasswordResetSuccess from '@forget-password/Components/PasswordResetSuccess/PasswordResetSuccess';
import { usePathname, useRouter } from 'next/navigation';
import { Box } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { forgetPassword } from '@forget-password/utils/API/resetPasswordService';
const ResetPasswordPage = ({}) => {
  const router = useRouter();
  const pathname = usePathname();

  const [resetPasswordSuccessModal, setResetPasswordSuccessModal] =
    useState(false);

  const onResetPassword = async (newPassword: string) => {
    try {
      let token = localStorage.getItem('tokenForResetPassword');
      if (token) {
        const response = await forgetPassword(newPassword, token);
        console.log(response);
        setResetPasswordSuccessModal(true);
      }
    } catch {}
  };

  const onCloseSuccessModal = () => {
    const route = localStorage.getItem('redirectionRoute');
    const appMode = localStorage.getItem('appMode');
    if (appMode) {
      const query = new URLSearchParams({
        tab: 'learnerAndroidApp',
      }).toString();
      router.push(`${pathname}?${query}`);
   // window.open("pratham://learnerapp", '_self');

    } else if (route) router.push(route);
    else router.push('/login');

    setResetPasswordSuccessModal(false);
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
        onClick={() => router.back()}
      >
        <ArrowBackIcon
          sx={{ color: '#4B5563', '&:hover': { color: '#000' } }}
        />
      </Box>
      <ResetPasswordForm onSubmit={onResetPassword} />

      <SimpleModal
        open={resetPasswordSuccessModal}
        onClose={onCloseSuccessModal}
        showFooter
        primaryText={'Okay'}
        primaryActionHandler={onCloseSuccessModal}
      >
        <PasswordResetSuccess />
      </SimpleModal>
    </Box>
  );
};

export default ResetPasswordPage;
