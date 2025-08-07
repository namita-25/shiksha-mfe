'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const CourseUnitDetails = dynamic(
  () => import('@content-mfes/components/Content/CourseUnitDetails'),
  {
    ssr: false,
  }
);

const App: React.FC = () => {
  return <CourseUnitDetails />;
};

export default App;
