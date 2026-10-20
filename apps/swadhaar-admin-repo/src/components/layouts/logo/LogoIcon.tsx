import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Box, Typography } from '@mui/material';

const LogoIcon = () => {
  return (
    <Link href="/users" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          cursor: 'pointer',
        }}
      >
        {/* Rounded square container with subtle dashed border */}
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: '8px',
            border: '1.5px dashed #D1D5DB',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 0.5,
            flexShrink: 0,
          }}
        >
          <Image
            src="/images/swadhar_logo.png"
            alt="Swadhaar FinAccess"
            width={28}
            height={28}
            style={{ objectFit: 'contain' }}
            priority
          />
        </Box>

        {/* Brand Title and Subtitle */}
        <Box sx={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              fontSize: '15px',
              color: '#1F2937',
              lineHeight: 1.2,
              letterSpacing: '-0.2px',
            }}
          >
            Swadhaar
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontSize: '11px',
              color: '#6B7280',
              fontWeight: 500,
              lineHeight: 1.2,
            }}
          >
            LMS Admin panel
          </Typography>
        </Box>
      </Box>
    </Link>
  );
};

export default LogoIcon;

