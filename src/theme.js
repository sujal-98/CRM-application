import { createTheme, responsiveFontSizes } from '@mui/material/styles';

// Base colour palette (Tailwind-inspired)
const basePalette = {
  primary: {
    main: '#6366F1', // indigo-500
    light: '#A5B4FF', // indigo-300
    dark: '#4338CA',  // indigo-700
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#F43F5E', // rose-500
    light: '#FDA4AF',
    dark: '#BE123C',
    contrastText: '#FFFFFF',
  },
  success: {
    main: '#10B981', // emerald-500
    dark: '#047857',
    contrastText: '#FFFFFF',
  },
  warning: {
    main: '#F59E0B', // amber-500
    dark: '#B45309',
    contrastText: '#FFFFFF',
  },
  error: {
    main: '#EF4444', // red-500
    dark: '#991B1B',
    contrastText: '#FFFFFF',
  },
  info: {
    main: '#0EA5E9', // sky-500
    dark: '#0369A1',
    contrastText: '#FFFFFF',
  },
};

// Create base theme then enhance with responsive fonts
let theme = createTheme({
  palette: {
    mode: 'light',
    ...basePalette,
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
    grey: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
  },
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      color: '#1e293b',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.2,
      color: '#1e293b',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.2,
      color: '#1e293b',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.2,
      color: '#1e293b',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.2,
      color: '#1e293b',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.2,
      color: '#1e293b',
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
      color: '#64748b',
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.57,
      color: '#64748b',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
      color: '#1e293b',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.57,
      color: '#64748b',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      fontSize: '0.875rem',
    },
  },
  shape: {
    borderRadius: 10,
  },
  spacing: 8,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          boxSizing: 'border-box',
          margin: 0,
          padding: 0,
        },
        html: {
          MozOsxFontSmoothing: 'grayscale',
          WebkitFontSmoothing: 'antialiased',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100%',
          width: '100%',
        },
        body: {
          display: 'flex',
          flex: '1 1 auto',
          flexDirection: 'column',
          minHeight: '100%',
          width: '100%',
        },
        '#root': {
          display: 'flex',
          flex: '1 1 auto',
          flexDirection: 'column',
          height: '100%',
          width: '100%',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          },
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
        disableRipple: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          minHeight: 40,
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
          },
        },
        contained: {
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(6px)',
          background: 'rgba(255,255,255,0.72)',
          color: '#1e293b',
          boxShadow: '0 2px 12px 0 rgba(0,0,0,0.04)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e2e8f0',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '4px 8px',
          padding: '8px 16px',
          '&.Mui-selected': {
            backgroundColor: basePalette.primary.main,
            color: basePalette.primary.contrastText,
            '&:hover': {
              backgroundColor: basePalette.primary.dark,
            },
            '& .MuiListItemIcon-root': {
              color: basePalette.primary.contrastText,
            },
          },
          '&:hover': {
            backgroundColor: '#EEF2FF',
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: '#64748b',
          minWidth: 40,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: '#4f46e5',
          color: '#ffffff',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
  },
});

theme = responsiveFontSizes(theme);

export default theme; 