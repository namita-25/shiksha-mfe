import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { SxProps, Theme } from '@mui/material/styles';
import { Box } from '@mui/material';

export interface CommonCircularProgressProps {
  variant?: 'determinate' | 'indeterminate';
  value?: number;
  size?: number;
  thickness?: number;
  color?: string;
  color2?: string;
  sx?: SxProps<Theme>;
}

export const Progress: React.FC<CommonCircularProgressProps> = ({
  variant = 'determinate',
  value = 0,
  size = 40,
  thickness = 3.6,
  color = 'primary',
  color2 = 'white',
  sx = {},
}) => {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress
        variant={variant}
        value={100}
        size={size}
        thickness={thickness}
        sx={{
          color: color2,
          position: 'absolute',
        }}
      />
      <CircularProgress
        variant={variant}
        value={value}
        size={size}
        thickness={thickness}
        sx={{
          color,
          ...sx,
        }}
      />
    </Box>
  );
};
