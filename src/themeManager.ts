// theme.ts

import { createTheme, loadTheme } from 'office-ui-fabric-react';

// Define your dark and light themes here
export const darkTheme = createTheme({
  palette: {
    themePrimary: '#1a1a1a',
    neutralPrimary: '#f4f4f4',
    neutralLighter: '#262626',
    neutralLight: '#333333',
    neutralQuaternary: '#444444',
    white: '#121212',
        neutralTertiaryAlt: '#e1e1e1'
  },
  // Add more theme settings if needed
});

export const lightTheme = createTheme({
  palette: {
    themePrimary: '#0078d4',
    neutralPrimary: '#333333',
    neutralLighter: '#f4f4f4',
    neutralLight: '#eaeaea',
    neutralQuaternary: '#dcdcdc',
    white: '#ffffff',
       neutralTertiaryAlt: '#e1e1e1',
  },
});

// Function to apply the theme
export const applyTheme = (theme: string) => {
  if (theme === 'dark') {
    loadTheme(darkTheme);
  } else {
    loadTheme(lightTheme);
  }
};
