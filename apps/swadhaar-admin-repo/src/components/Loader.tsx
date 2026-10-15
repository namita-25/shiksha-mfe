import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoaderProps {
  message?: string;
  minHeight?: string;
}

const Loader: React.FC<LoaderProps> = ({ message = 'Loading...', minHeight = '300px' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight,
        gap: 2,
      }}
    >
      <CircularProgress sx={{ color: '#E6873C' }} size={44} />
      {message && (
        <Typography sx={{ color: '#6B7280', fontSize: '14px', fontWeight: 500 }}>
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default Loader;
