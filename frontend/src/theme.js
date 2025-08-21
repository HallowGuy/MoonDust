import { createTheme } from '@mui/material/styles';

// Global Material UI theme for the MoonDust frontend
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    // Use Roboto as the primary font with common fallbacks
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

export default theme;
