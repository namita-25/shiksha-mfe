import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import React, { memo, ReactNode } from 'react';

interface LoaderProps {
  isLoading: boolean;
  layoutHeight?: number;
  children: ReactNode;
  _loader?: React.CSSProperties;
}

export const Loader: React.FC<LoaderProps> = memo(
  ({ isLoading, layoutHeight, _loader, children }) => {
    return (
      <>
        {isLoading && (
          <Box
            sx={{
              width: 'auto',
              minHeight: `calc(100vh - ${layoutHeight || 0}px)`,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'absolute',
              zIndex: 9999,
              left: 0,
              right: 0,
              backgroundColor: 'white',
              ..._loader,
            }}
          >
            <CircularProgress />
          </Box>
        )}
        <Box
          style={{
            width: '100%',
            // overflowY: 'auto',
            display: isLoading ? 'none' : 'block',
            ...(isLoading
              ? { maxHeight: `calc(100vh - ${layoutHeight}px)` }
              : {}),
          }}
        >
          {children}
        </Box>
      </>
    );
  }
);
