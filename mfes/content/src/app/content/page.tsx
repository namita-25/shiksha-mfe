import React from 'react';
import dynamic from 'next/dynamic';

const ContentList = dynamic(
  () => import('@content-mfes/components/Content/List'),
  {
    ssr: false,
  }
);

const App: React.FC = () => {
  return <ContentList />;
};

export default App;
