import { Fab, Typography, useTheme } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import React from 'react';

interface BackToTopProps {
  onClick?: () => void;
}

const BackToTop: React.FC<BackToTopProps> = ({ onClick }) => {
  const theme = useTheme();

  const handleClick = () => {
    onClick?.();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Fab
      color="secondary"
      aria-label="back to top"
      sx={{
        position: 'fixed',
        display: 'table-column',
        bottom: 80,
        right: 16,
        height: '75px',
        borderRadius: '100px',
        bgcolor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        '&:hover': {
          bgcolor: theme.palette.primary.dark,
        },
      }}
      onClick={handleClick}
    >
      <ArrowUpwardIcon />
      <Typography fontSize={'10px'}>Back to Top</Typography>
    </Fab>
  );
};

export default React.memo(BackToTop);
