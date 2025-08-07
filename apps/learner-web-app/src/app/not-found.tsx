'use client';

import { Box, Button, Container, Typography } from '@mui/material';
import Link from 'next/link';
import Image from 'next/image';
import router from 'next/router';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <Container maxWidth="lg">
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="background.default"
        color="text.primary"
        textAlign="center"
        px={2}
      >
        <Box position="relative" width="100%" mb={4}>
          <img
            src="/404.png"
            alt="404 Error"
            style={{ objectFit: 'contain' }}
          />
        </Box>

        <Box position="relative" width="100%" mb={4}>
          <img
            src="/logo.png"
            alt="404 Error"
            style={{ objectFit: 'contain' }}
          />
        </Box>

        <Typography
          variant="h4"
          fontWeight="bold"
          mb={2}
          sx={{
            fontFamily: 'Poppins',
            fontWeight: 600,
            fontSize: '36px',
            lineHeight: '44px',
            letterSpacing: '0px',
            textAlign: 'center',
            color: '#000000',
          }}
        >
          We've redesigned the site, so the page you're looking for may have
          been moved or no longer exists
        </Typography>

        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => router.back()}
          sx={{
            textTransform: 'none',
            px: 2,
            mt: 2,
            py: 1,
            fontSize: '1.1rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 8px rgba(0,0,0,0.15)',
            },
            transition: 'all 0.2s ease-in-out',
            borderRadius: '100px',
          }}
        >
          Go back
        </Button>
      </Box>
    </Container>
  );
}
