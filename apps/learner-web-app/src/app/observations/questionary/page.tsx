'use client';

import React from 'react';
import { Box } from '@mui/material';
import Header from '@learner/components/Header/Header';
import dynamic from 'next/dynamic';
import Layout from '@learner/components/Layout';

const QuestionarySurvey = dynamic(
  () => import('@survey/app/observations/questionary/page'),
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
        //   overflow="hidden"
      >
        <QuestionarySurvey />
      </Box>
    </Layout>
  );
};

export default surveyPage;
