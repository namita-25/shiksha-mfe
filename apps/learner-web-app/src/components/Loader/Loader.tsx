import { Backdrop, CircularProgress, Typography } from '@mui/material';
import React from 'react';

const Spinner: React.FC<{ loadingText?: string }> = ({ loadingText }) => {
  return (
    <>
      <CircularProgress color="inherit" />
      <br />
      <Typography variant="h2">{loadingText || 'Loading...'}</Typography>
    </>
  );
};

const Loader: React.FC<{ showBackdrop: boolean; loadingText?: string }> = ({
  showBackdrop,
  loadingText,
}) => {
  return (
    <>
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          flexDirection: 'column',
        }}
        open={showBackdrop}
      >
        <Spinner loadingText={loadingText} />
      </Backdrop>
      {!showBackdrop && <Spinner loadingText={loadingText} />}
    </>
  );
};

export default Loader;
