import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import MuiThemeProvider from '@content-mfes/assets/theme/MuiThemeProvider';

export default function MyApp({ Component, pageProps }: AppProps) {
  const URL_LOGIN = process.env.NEXT_PUBLIC_LOGIN;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const accToken = localStorage.getItem('accToken');
      const refToken = localStorage.getItem('refToken');

      if (!accToken || !refToken) {
        if (typeof URL_LOGIN === 'string') {
          window.location.href = URL_LOGIN;
        }
      }
    }
  }, []);

  return (
    // <ThemeProvider theme={customTheme}>
    <MuiThemeProvider>
      <Component {...pageProps} />
    </MuiThemeProvider>
  );
}
