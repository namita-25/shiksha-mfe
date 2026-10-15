import { experimental_extendTheme as extendTheme } from '@mui/material/styles';

const customTheme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: '#E6873C', // Swadhaar Brand Primary Orange
          light: '#FFA05C',
          dark: '#C66C23',
          contrastText: '#FFFFFF',
          '100': '#FDF3E9',
          '200': '#FBE3CD',
        },
        secondary: {
          main: '#1C2B4A', // Swadhaar Dark Navy
          light: '#2B406B',
          dark: '#101B30',
          contrastText: '#FFFFFF',
          '100': '#F5F5F5',
          '200': '#FFFFFF',
          '300': '#E5E7EB',
          '400': '#D1D5DB',
        },
        success: {
          main: '#1A8825',
          light: '#E8F5E9',
          dark: '#116418',
          contrastText: '#FFFFFF',
        },
        warning: {
          main: '#E65100',
          light: '#FFF3E0',
          dark: '#B23F00',
          contrastText: '#FFFFFF',
        },
        error: {
          main: '#BA1A1A',
          light: '#FFDAD6',
          dark: '#93000A',
          contrastText: '#FFFFFF',
        },
        info: {
          main: '#1C2B4A',
          light: '#EBF3FB',
          dark: '#0D1626',
          contrastText: '#FFFFFF',
        },
        text: {
          primary: '#1F2937',
          secondary: '#4D4639',
        },
        background: {
          default: '#F5F5F5',
          paper: '#FFFFFF',
        },
        divider: '#E5E7EB',
      },
    },
    dark: {
      palette: {
        primary: {
          main: '#FFA05C',
          light: '#FFBE8A',
          dark: '#E6873C',
          contrastText: '#1C2B4A',
        },
        secondary: {
          main: '#8BA6D8',
          light: '#A6BEEC',
          dark: '#1C2B4A',
          contrastText: '#101B30',
        },
        background: {
          default: '#0F172A',
          paper: '#1E293B',
        },
        text: {
          primary: '#F8FAFC',
          secondary: '#94A3B8',
        },
        divider: '#334155',
      },
    },
  },
  typography: {
    fontFamily: "'Inter', 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    h1: {
      fontSize: '28px',
      fontWeight: 700,
      lineHeight: 1.3,
    },
    h2: {
      fontSize: '22px',
      fontWeight: 700,
      lineHeight: 1.35,
    },
    h3: {
      fontSize: '18px',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '16px',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '14px',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '12px',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      fontSize: '14px',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
          },
        },
        containedPrimary: {
          backgroundColor: '#E6873C',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#C66C23',
          },
        },
        containedSecondary: {
          backgroundColor: '#1C2B4A',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#101B30',
          },
        },
        outlinedPrimary: {
          borderColor: '#E6873C',
          color: '#E6873C',
          '&:hover': {
            borderColor: '#C66C23',
            backgroundColor: 'rgba(230, 135, 60, 0.05)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          backgroundImage: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: '16px',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontSize: '13px',
          borderColor: '#E5E7EB',
          padding: '12px 16px',
        },
        head: {
          fontWeight: 600,
          color: '#4D4639',
          backgroundColor: '#F8FAFC',
          textTransform: 'uppercase',
          fontSize: '11px',
          letterSpacing: '0.5px',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#E6873C',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#E6873C',
            borderWidth: '1.5px',
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '14px',
          '&.Mui-selected': {
            color: '#E6873C',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: '#E6873C',
          height: '3px',
          borderRadius: '3px 3px 0 0',
        },
      },
    },
  },
});

export default customTheme;
