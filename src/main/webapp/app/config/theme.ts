import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface PaletteColor {
    medium?: string;
    background?: string;
  }

  interface SimplePaletteColorOptions {
    medium?: string;
    background?: string;
  }
  interface Palette {
    tertiary: Palette['primary'];
    accent: Palette['primary'];
  }
  interface PaletteOptions {
    tertiary?: PaletteOptions['primary'];
    accent?: PaletteOptions['primary'];
  }
}

const customColors = {
  primary: {
    main: '#800080',
    light: '#eabfff',
    dark: '#3c005a',
    medium: '#d580ff',
    background: '#f2f2f5',
  },
};

export const theme = createTheme({
  palette: customColors,
});
