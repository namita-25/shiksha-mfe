'use client';
import React from 'react';
import Layout from '../../components/Layout';
import { Button, Grid, Typography } from '@mui/material';
import { gredientStyle } from '@learner/utils/style';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/navigation';
import ContentComponent from '@learner/components/Content/Content';
import { useTranslation } from '@shared-lib'; // Updated import

const InProgress: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const onBackClick = () => {
    router.back();
  };

  return (
    <Layout _children={{ _children: gredientStyle }}>
      <Grid container>
        <Grid item xs={12} sx={{ p: { xs: 2, md: 5 }, pb: { xs: 1, md: 0 } }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={onBackClick}
            sx={{
              textTransform: 'none',
              color: '#1E1B16',
              fontSize: '16px',
            }}
          >
            <Typography
              fontSize={{ xs: '16px', sm: '16px', md: '20px', lg: '24px' }}
              fontWeight={400}
            >
              {t('LEARNER_APP.IN_PROGRESS.ALL_COURSES')}
            </Typography>
          </Button>
        </Grid>
        <Grid item xs={12} sx={{ px: { xs: 2, md: 5 }, pt: 0 }}>
          <ContentComponent limit={8} hasMoreData />
        </Grid>
      </Grid>
    </Layout>
  );
};

export default InProgress;
