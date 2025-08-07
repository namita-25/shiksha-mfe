// pages/content-details/[identifier].tsx

import React from 'react';
import dynamic from 'next/dynamic';
import { getMetadata } from '@learner/utils/API/metabaseService';
import Layout from '@learner/components/themantic/layout/Layout';
import { CardComponent } from '@learner/components/themantic/content/List';
import { Box, Container } from '@mui/material';
import SubHeader from '@learner/components/themantic/subHeader/SubHeader';

export async function generateMetadata({ params }: any) {
  return await getMetadata(params.courseId);
}

const CourseUnitDetails = dynamic(() => import('@CourseUnitDetails'), {
  ssr: false,
});
const App = () => {
  return (
    <Layout sx={{ backgroundImage: 'url(/images/energy-background.png)' }}>
      <SubHeader showFilter={false} />
      <Container maxWidth="lg">
        <Box
          sx={{
            '& .css-17kujh3': {
              overflowY: 'unset !important',
            },
          }}
        >
          <CourseUnitDetails
            isShowLayout={false}
            isHideInfoCard={true}
            showBreadCrumbs={{
              prefix: [{ label: 'Home', link: '/themantic' }],
            }}
            _box={{ px: { xs: 0, sm: 0, md: 0 } }}
            _config={{
              contentBaseUrl: '/themantic',
              _grid: {
                xs: 12,
                sm: 6,
                md: 4,
                lg: 4,
                xl: 4,
              },
              _containerGrid: {
                spacing: { xs: 6, sm: 6, md: 6 },
              },
              default_img: '/images/image_ver.png',
              _card: { cardComponent: CardComponent },
              _infoCard: {
                _cardMedia: { maxHeight: { xs: '200px', sm: '280px' } },
                default_img: '/images/unit.png',
              },
            }}
          />
        </Box>
      </Container>
    </Layout>
  );
};

export default App;
