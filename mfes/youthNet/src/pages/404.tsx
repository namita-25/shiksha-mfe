// pages/404.js
import { Button, Container, Typography, Box } from '@mui/material';
import { useRouter } from 'next/router';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const Custom404 = () => {
  const router = useRouter();

  const handleGoBack = () => {
    router.back(); // Navigate to previous page
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        textAlign: 'center',
        paddingTop: 8,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '60vh',
        }}
      >
        <Typography variant="h1" sx={{ fontSize: '4rem', fontWeight: 'bold', mb: 2 }}>
          404
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 3 }}>
          Oops! The page you are looking for does not exist.
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={handleGoBack}
          sx={{
            backgroundColor: '#1976d2',
            '&:hover': {
              backgroundColor: '#1565c0',
            },
          }}
        >
          Go Back
        </Button>
      </Box>
    </Container>
  );
};

export default Custom404;