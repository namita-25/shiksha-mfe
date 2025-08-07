// src/theme/theme.d.ts
import '@mui/material/Button';

declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    'top-bar-link-button': true;
    'top-bar-link-text': true;
  }
}
