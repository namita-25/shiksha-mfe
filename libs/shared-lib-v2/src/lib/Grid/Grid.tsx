'use client';
import { Box, BoxProps } from '@mui/material';
import React from 'react';

interface GridProps extends BoxProps {
  children?: React.ReactNode[] | React.ReactNode;
  childWidth?: number;
}

export const CardGrid = React.memo(
  ({ children, childWidth = 230, ...props }: GridProps) => {
    const isArray = Array.isArray(children);

    if (!isArray) {
      return <Box {...props}>{children}</Box>;
    }

    return (
      <Box
        width={'100%'}
        display="grid"
        gridTemplateColumns={`repeat(auto-fill, minmax(${childWidth}px, 1fr))`}
        gap="1rem"
        alignItems="center"
        justifyContent="center"
        {...props}
      >
        {children.map((child, index) => (
          <Box
            key={`key${index}`}
            sx={{
              display: { xs: 'flex', sm: 'block' },
              justifyContent: { xs: 'center', sm: 'initial' },
            }}
          >
            {child}
          </Box>
        ))}
      </Box>
    );
  }
);
