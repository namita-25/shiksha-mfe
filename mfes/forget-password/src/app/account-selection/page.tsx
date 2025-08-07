'use client';

import React, { useEffect, useState } from 'react';
type UserAccount = {
  name: string;
  username: string;
};

//build issue fix for  ⨯ useSearchParams() should be wrapped in a suspense boundary at page
import { Suspense } from 'react';
import AccountSelection from './AccountSelection';
import { Box } from '@mui/material';

const AccountSelectionPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Box
        // minHeight="100vh"
        // width="100vw"
        display="flex"
        flexDirection="column"
        sx={{
          overflowY: 'auto', // <-- this adds scroll inside

          background: 'linear-gradient(to bottom, #fff7e6, #fef9ef)',
        }}
      >
        <AccountSelection />
      </Box>{' '}
    </Suspense>
  );
};

export default AccountSelectionPage;
