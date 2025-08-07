'use client';

import React, { useState } from 'react';

//build issue fix for  ⨯ useSearchParams() should be wrapped in a suspense boundary at page
import { Suspense } from 'react';
import ForgotPassword from './ForgotPassword';

const ForgotPasswordPage = ({}) => {
 
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ForgotPassword />
    </Suspense>
  );
};

export default ForgotPasswordPage;
