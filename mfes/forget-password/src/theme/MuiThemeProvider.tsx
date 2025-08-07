// app/theme/ThemeRegistry.tsx or MuiThemeProvider.tsx
'use client';

import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import React from 'react';
// import { LanguageProvider } from '@shared-lib';
// import { LanguageProvider } from '@shared-lib';

const theme = createTheme({
  typography: {
    fontFamily: 'Poppins, sans-serif',
  },
  palette: {
    primary: {
      main: '#FDBE16',
      // contrastText: '#fff',
      light: '#FFDEA1',
    },

    secondary: {
      main: '#0D599E',
      light: '#E7F3F8',
      // contrastText: '#fff',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#fff',
          paddingTop: '18px',
          paddingBottom: '18px',
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {},
          // background: '#BA1A1A'
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {},
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '50px',
          color: '#1E1B16',
          textTransform: 'none',
        },
      },
    },
  },
});

export default function MuiThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
