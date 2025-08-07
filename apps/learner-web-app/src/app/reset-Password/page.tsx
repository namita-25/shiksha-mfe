'use client';

import React from 'react';
import { Box } from '@mui/material';
import Header from '@learner/components/Header/Header';
import dynamic from 'next/dynamic';

const ResetPassword = dynamic(
  () => import('@forget-password/app/reset-Password/page'),
  {
    ssr: false,
  }
);

const resetPasswordPage = () => {
  return (
    <Box
      height="100vh"
      width="100vw"
      display="flex"
      flexDirection="column"
      overflow="hidden"
      sx={{
        background: 'linear-gradient(to bottom, #fff7e6, #fef9ef)',
      }}
    >
      <Header />

      <ResetPassword />
    </Box>
  );
};

export default resetPasswordPage;
