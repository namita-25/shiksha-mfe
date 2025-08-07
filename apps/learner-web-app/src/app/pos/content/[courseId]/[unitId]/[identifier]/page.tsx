// 'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { getMetadata } from '@learner/utils/API/metabaseService';
import Layout from '@learner/components/pos/Layout';

export async function generateMetadata({ params }: any) {
  return await getMetadata(params.identifier);
}

const Player = dynamic(() => import('@learner/components/Content/Player'), {
  ssr: false,
});

const App: React.FC = () => {
  return (
    <Layout>
      <Player
        userIdLocalstorageName={'did'}
        contentBaseUrl="/pos/content"
        _config={{
          player: {
            trackable: false,
          },
          courseUnitDetails: {
            contentBaseUrl: '/pos/content',
            isEnrollmentRequired: false,
            _card: {
              isHideProgressStatus: true,
            },
          },
        }}
      />
    </Layout>
  );
};

export default App;
