'use client';

import React from 'react';
import { Box } from '@mui/material';
import Header from '@learner/components/Header/Header';
import dynamic from 'next/dynamic';
import Layout from '@learner/components/Layout';

const ObservationSurvey = dynamic(
  () => import('@survey/app/observations/page'),
  {
    ssr: false,
  }
);

const surveyPage = () => {
  return (
    <Layout>
      <Box
        // height="100vh"
        // width="100vw"
        display="flex"
        flexDirection="column"
        //  overflow="hidden"
        // sx={{
        //   background: 'linear-gradient(to bottom, #fff7e6, #fef9ef)',
        // }}
      >
        <ObservationSurvey />
      </Box>
    </Layout>
  );
};

export default surveyPage;
