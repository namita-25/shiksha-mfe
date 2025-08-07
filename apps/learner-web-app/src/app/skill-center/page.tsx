'use client';
import React, { useState } from 'react';
import { gredientStyle } from '@learner/utils/style';
import Layout from '@learner/components/Layout';
import { Box } from '@mui/material';
import SkillCenter from '@learner/components/SkillCenter/SkillCenter';
import { useTranslation } from '@shared-lib';

const SkillCenterPage = () => {
  const [visibleCenters, setVisibleCenters] = useState<any>([]);
  const { t } = useTranslation();

  return (
    <Layout sx={gredientStyle}>
      <Box sx={{ py: 2 }}>
        <SkillCenter
          title={t('COMMON.SKILLING_CENTERS')}
          isNavigateBack={true}
          isPadding={true}
          viewAll={true}
          visibleCenters={visibleCenters}
          setVisibleCenters={setVisibleCenters}
          hideFilter={false}
        />
      </Box>
    </Layout>
  );
};

export default SkillCenterPage;
