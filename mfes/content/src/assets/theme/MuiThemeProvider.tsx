// app/theme/ThemeRegistry.tsx or MuiThemeProvider.tsx
'use client';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import React from 'react';
import { LanguageProvider } from '@shared-lib';

const theme = createTheme({
  palette: {},
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#fff',
          color: '#000',
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          padding: 0,
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
      <LanguageProvider>{children}</LanguageProvider>
    </ThemeProvider>
  );
}
