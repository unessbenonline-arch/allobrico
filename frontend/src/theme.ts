import { createTheme, Theme } from '@mui/material/styles';

export const createAppTheme = (mode: 'light' | 'dark'): Theme => {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'dark' ? '#60a5fa' : '#2563eb', // blue-400 for dark, blue-600 for light
      },
      secondary: {
        main: mode === 'dark' ? '#a78bfa' : '#7c3aed', // purple-400 for dark, purple-700 for light
      },
      success: {
        main: mode === 'dark' ? '#4ade80' : '#16a34a',
      },
      warning: {
        main: mode === 'dark' ? '#fbbf24' : '#ca8a04',
      },
      error: {
        main: mode === 'dark' ? '#f87171' : '#dc2626',
      },
      background: {
        default: mode === 'dark' ? '#0f172a' : '#f9fafb', // slate-900 for dark, gray-50 for light
        paper: mode === 'dark' ? '#1e293b' : '#ffffff', // slate-800 for dark, white for light
      },
      text: {
        primary: mode === 'dark' ? '#f1f5f9' : '#1e293b', // slate-100 for dark, slate-800 for light
        secondary: mode === 'dark' ? '#94a3b8' : '#64748b', // slate-400 for dark, slate-500 for light
      },
      divider: mode === 'dark' ? '#334155' : '#e2e8f0', // slate-700 for dark, slate-200 for light
    },
    shape: {
      borderRadius: 12,
    },
    typography: {
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        'Segoe UI',
        'Roboto',
        'Oxygen',
        'Ubuntu',
        'Cantarell',
        'Fira Sans',
        'Droid Sans',
        'Helvetica Neue',
        'sans-serif',
      ].join(','),
      h1: { fontWeight: 700 },
      h2: { fontWeight: 700 },
      h3: { fontWeight: 700 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            backgroundImage: 'none',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 16,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'dark' ? '#1e293b' : '#ffffff',
            color: mode === 'dark' ? '#f1f5f9' : '#1e293b',
            borderBottom: `1px solid ${mode === 'dark' ? '#334155' : '#e2e8f0'}`,
            boxShadow: mode === 'dark'
              ? '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2)'
              : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          size: 'medium',
        },
      },
    },
  });
};

const theme = createAppTheme('light');

export default theme;
