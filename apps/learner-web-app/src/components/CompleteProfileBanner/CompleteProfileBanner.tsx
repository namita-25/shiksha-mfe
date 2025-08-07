import { Box, Button, Typography, Paper } from '@mui/material';
import { useRouter } from 'next/navigation';
import { Loader, useTranslation } from '@shared-lib'; // Updated import

export const CompleteProfileBanner = () => {
  const router = useRouter();
  const { t } = useTranslation(); // Initialize translation function

  const handleCompleteProfileClick = () => {
    router.push('/profile-complition?isComplition=true');
  };

  return (
    <Paper
      elevation={2}
      sx={{
        backgroundColor: '#FFE08A', // light yellow
        padding: 1.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 2,
        gap: { xs: 1, sm: 2, md: 4 },
      }}
    >
      <Typography
        variant="body1"
        sx={{
          fontWeight: 500,
          fontSize: { md: 14, xs: 12 },
        }}
      >
        {t('LEARNER_APP.COMPLETE_PROFILE_BANNER.MESSAGE')}
        {/* Internationalized message */}
      </Typography>
      <Button
        onClick={handleCompleteProfileClick}
        variant="contained"
        color="primary"
        sx={{
          minWidth: '144px',
          fontWeight: 400,
          lineHeight: '24px',
          fontSize: 14,
          letterSpacing: '0.25px',
          textAlign: 'center',
          verticalAlign: 'middle',
          padding: { xs: '10px 12px', sm: '10px 12px', md: '8px 48px' },
          boxShadow: '0px 3px 5px rgba(0, 0, 0, 0.2)',
          '&:hover': {
            backgroundColor: '#FFB300', // darker on hover
          },
        }}
      >
        {t('LEARNER_APP.COMPLETE_PROFILE_BANNER.BUTTON')}
        {/* Internationalized button text */}
      </Button>
    </Paper>
  );
};
