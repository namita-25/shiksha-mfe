'use client';

import React from 'react';
import { Box } from '@mui/material';
import { useRouter } from 'next/navigation';

const Header = () => {
  const router = useRouter();
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
        gridTemplateRows: { xs: 'auto auto auto', md: '1fr' },
        alignItems: 'center',
        justifyItems: 'center',
        bgcolor: 'white',
        gap: { xs: 0, md: 0 },
      }}
    >
      {/* Left/Top: Siemens Stiftung Logo */}
      <Box sx={{ justifySelf: { xs: 'center', md: 'start' } }}>
        <img
          src="/images/siemens-stiftung-logo_updated.png"
          alt="Siemens Stiftung Logo"
          style={{
            width: '100%',
            maxWidth: '280px',
            height: 'auto',
            minWidth: '150px',
          }}
        />
      </Box>

      {/* Center/Middle: Pratham Logo with Mascot */}
      <Box
        sx={{ justifySelf: 'center', cursor: 'pointer' }}
        onClick={() => router.push('/themantic')}
      >
        <img
          src="/images/pratham-left1.png"
          alt="Pratham Logo"
          style={{
            width: '100%',
            maxWidth: '89px',
            height: 'auto',
            minWidth: '60px',
          }}
        />
      </Box>

      {/* Right/Bottom: SIEMENS Text */}
      <Box sx={{ justifySelf: { xs: 'center', md: 'end' } }}>
        <img
          src="/images/siemens-logo_updated.png"
          alt="SIEMENS Logo"
          style={{
            width: '100%',
            maxWidth: '178px',
            height: 'auto',
            minWidth: '120px',
          }}
        />
      </Box>
    </Box>
  );
};

export default Header;
