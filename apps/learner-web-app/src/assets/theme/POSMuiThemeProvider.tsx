// app/theme/ThemeRegistry.tsx or MuiThemeProvider.tsx
'use client';

import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import React from 'react';
import { theme as learnerTheme } from './MuiThemeProvider';
const theme = createTheme(learnerTheme, {
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 0,
        },
      },
    },
    MuiButton: {
      variants: [
        {
          props: { variant: 'top-bar-link-text' },
          style: {
            fontWeight: 500,
            fontSize: '16px',
            lineHeight: '24px',
            paddingTop: 8,
            paddingBottom: 8,
            paddingRight: 12,
            paddingLeft: 12,
            borderRadius: 0,
          },
        },
        {
          props: { variant: 'top-bar-link-button' },
          style: {
            fontWeight: 500,
            fontSize: '16px',
            lineHeight: '24px',
            borderBottomStyle: 'solid',
            borderBottomWidth: 3,
            borderBottomColor: '#FDBE16',
            paddingX: 8,
            paddingY: 12,
            borderRadius: 0,
          },
        },
      ],
    },
  },
});

export default function POSMuiThemeProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
