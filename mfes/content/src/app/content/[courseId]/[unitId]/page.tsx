'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const ContentDetails = dynamic(() => import('../page'), {
  ssr: false,
});

const HomePage: React.FC = () => {
  return <ContentDetails />;
};

export default HomePage;
