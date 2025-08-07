'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const Player = dynamic(
  () => import('@content-mfes/components/Content/Player'),
  {
    ssr: false,
  }
);

const App: React.FC = () => {
  return <Player />;
};

export default App;
