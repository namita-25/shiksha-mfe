'use client';

import React, { useState } from 'react';

//build issue fix for  ⨯ useSearchParams() should be wrapped in a suspense boundary at page
import { Suspense } from 'react';
import Observation from './Observation';

const ObservationQuestionPage = ({}) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Observation />
    </Suspense>
  );
};

export default ObservationQuestionPage;
