// pages/content-details/[identifier].tsx

import React from 'react';
import Layout from '@learner/components/pos/Layout';
import dynamic from 'next/dynamic';
import { Box } from '@mui/material';
import { getMetadata } from '@learner/utils/API/metabaseService';

export async function generateMetadata({ params }: any) {
  return await getMetadata(params.identifier);
}
const ContentEnrollDetails = dynamic(() => import('@ContentEnrollDetails'), {
  ssr: false,
});
const App = () => {
  return (
    <Layout>
      <Box sx={{ paddingBottom: '32px' }}>
        <ContentEnrollDetails
          isShowLayout={false}
          _config={{
            isEnrollmentRequired: false,
            userIdLocalstorageName: 'did',
            contentBaseUrl: '/pos/content',
            default_img: '/images/image_ver.png',
            _infoCard: {
              default_img: '/images/image_ver.png',
              _cardMedia: { maxHeight: { xs: '200px', sm: '280px' } },
            },
          }}
        />
      </Box>
    </Layout>
  );
};

export default App;
