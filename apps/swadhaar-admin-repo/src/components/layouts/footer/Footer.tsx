import React from 'react';
import { Box, Typography } from '@mui/material';

const Footer = () => {
  return (
    <Box
      sx={{
        py: 2.5,
        textAlign: 'center',
        borderTop: '1px solid #E5E7EB',
        mt: 'auto',
      }}
    >
      <Typography variant="body2" sx={{ color: '#6B7280', fontSize: '12px' }}>
        © {new Date().getFullYear()} Swadhaar FinAccess. All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer;
