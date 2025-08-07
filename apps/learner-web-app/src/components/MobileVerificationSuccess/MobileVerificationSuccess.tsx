'use client';

import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const MobileVerificationSuccess = () => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      flexDirection={'column'}
    >
      <CheckCircleOutlineIcon sx={{ fontSize: 48, color: 'green', mb: 2 }} />
      <Typography
        variant="h1"
        sx={{
          fontWeight: 400,
          // fontSize: '22px',
          // lineHeight: '28px',
          letterSpacing: '0px',
          textAlign: 'center',
          verticalAlign: 'middle',
          mb: 3,
        }}
      >
        Awesome!
      </Typography>
      <Typography
        variant="h1"
        sx={{
          fontWeight: 200,
          // fontSize: '22px',
          // lineHeight: '28px',
          letterSpacing: '0px',
          textAlign: 'center',
          verticalAlign: 'middle',
          mb: 3,
        }}
      >
        Your phone number has been successfully verified{' '}
      </Typography>
    </Box>
  );
};

export default MobileVerificationSuccess;
