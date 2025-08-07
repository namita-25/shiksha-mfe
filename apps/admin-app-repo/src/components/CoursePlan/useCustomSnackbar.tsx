// useCustomSnackbar.tsx
import React, { useState, useCallback } from 'react';
import { Snackbar, Box, Typography } from '@mui/material';

type SnackbarOptions = {
  text: string;
  bgColor?: string;
  textColor?: string;
  icon?: React.ReactNode;
};

export const useCustomSnackbar = () => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [bgColor, setBgColor] = useState('#323232');
  const [textColor, setTextColor] = useState('#fff');
  const [icon, setIcon] = useState<React.ReactNode>(null);

  const showSnackbar = useCallback((options: SnackbarOptions) => {
    setText(options.text);
    setBgColor(options.bgColor || '#323232');
    setTextColor(options.textColor || '#fff');
    setIcon(options.icon || null);
    setOpen(true);

    setTimeout(() => {
      setOpen(false);
    }, 6000);
  }, []);

  const CustomSnackbar = (
    <Snackbar
      open={open}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      onClose={() => setOpen(false)}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 1.5,
          borderRadius: 1,
          bgcolor: bgColor,
          color: textColor,
          boxShadow: 3,
        }}
      >
        {icon && <Box sx={{mt:0.5}}>{icon}</Box>}
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          {text}
        </Typography>
      </Box>
    </Snackbar>
  );

  return { CustomSnackbar, showSnackbar };
};
