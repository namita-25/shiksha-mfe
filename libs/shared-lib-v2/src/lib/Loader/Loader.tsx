import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import React, { memo, ReactNode } from 'react';

interface LoaderProps {
  isLoading: boolean;
  layoutHeight?: number;
  children?: ReactNode;
  _loader?: React.CSSProperties;
  _children?: React.CSSProperties;
  _childrenBox?: any;
  isHideMaxHeight?: boolean;
}

export const Loader: React.FC<LoaderProps> = memo(
  ({
    isLoading,
    layoutHeight,
    _loader,
    _children,
    _childrenBox,
    children,
    isHideMaxHeight,
  }) => {
    return (
      <>
        {isLoading && (
          <Box
            sx={{
              width: '100%',
              minHeight: `calc(100vh - ${layoutHeight || 0}px)`,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              // position: 'absolute',
              // zIndex: 9999,
              // left: 0,
              // right: 0,
              backgroundColor: 'transparent',
              ..._loader,
            }}
          >
            <CircularProgress />
          </Box>
        )}
        <Box
          {..._childrenBox}
          sx={{
            width: '100%',
            overflowY: 'auto',
            display: isLoading ? 'none' : 'block',
            ...(isLoading || !isHideMaxHeight
              ? { height: `calc(100vh - ${layoutHeight}px)` }
              : {}),
            ..._children,
          }}
        >
          {children}
        </Box>
      </>
    );
  }
);
