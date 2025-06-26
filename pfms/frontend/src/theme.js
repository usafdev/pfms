// src/theme.js
import { createTheme } from '@mui/material/styles';

const getTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: {
      main: mode === 'dark' ? '#bb86fc' : '#3f51b5',
    },
    secondary: {
      main: mode === 'dark' ? '#03dac6' : '#f50057',
    },
    background: {
      default: mode === 'dark' ? '#121212' : '#f5f5f5',
      paper: mode === 'dark' ? '#1f1f1f' : '#ffffff',
    },
    text: {
      primary: mode === 'dark' ? '#ffffff' : '#000000',
      secondary: mode === 'dark' ? '#e0e0e0' : '#666666',
    },
  },
  typography: {
    allVariants: {
      color: mode === 'dark' ? '#ffffff' : '#000000',
    },
  },
});

export default getTheme;
