'use client';

import React, { useState } from 'react';

//build issue fix for  ⨯ useSearchParams() should be wrapped in a suspense boundary at page
import { Suspense } from 'react';
import ObservationQuestions from './ObservationQuestions';

const ObservationQuestionPage = ({}) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ObservationQuestions />
    </Suspense>
  );
};

export default ObservationQuestionPage;
