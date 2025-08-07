import * as React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

interface LoaderProps {
  size?: number;
  color?: 'primary' | 'secondary' | 'inherit';
  overlayColor?: string;
}

export const Circular: React.FC<LoaderProps> = ({
  size = 40,
  color = 'primary',
  overlayColor = 'rgba(255, 255, 255, 0.9)',
}) => {
  const loadingId = 'loading-indicator';
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        width: '100%',
        minHeight: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1300,
        overflow: 'hidden',
        backgroundColor: overlayColor,
      }}
      aria-labelledby={loadingId}
    >
      <CircularProgress
        size={size}
        color={color}
        aria-label="Loading content"
      />
    </Box>
  );
};
