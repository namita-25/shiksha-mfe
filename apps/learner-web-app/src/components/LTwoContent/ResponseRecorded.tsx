import React from 'react';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Box, Typography } from '@mui/material';
import { Layout as SharedLayout, useTranslation } from '@shared-lib'; // Updated import

const ResponseRecorded: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <Box sx={{ color: '#4CAF50', fontSize: '48px', mb: 2 }}>
        <CheckCircleOutlineIcon fontSize="inherit" />
      </Box>

      <Typography
        variant="h1"
        sx={{
          color: '#1F1B13',
          textAlign: 'center',
        }}
        mb={2}
      >
        {t('LEARNER_APP.RESPONSE_RECORDED.TITLE')}
      </Typography>

      <Typography
        variant="body1"
        mb={2}
        sx={{
          color: '#1F1B13',
          textAlign: 'center',
        }}
      >
        {t('LEARNER_APP.RESPONSE_RECORDED.SUB_TITLE')}
      </Typography>

      <Typography
        variant="body1"
        sx={{
          color: '#1F1B13',
          textAlign: 'center',
        }}
        mb={4}
      >
        {t('LEARNER_APP.RESPONSE_RECORDED.FOOTER_TEXT')}
      </Typography>
    </Box>
  );
};

export default ResponseRecorded;
