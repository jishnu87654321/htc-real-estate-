/**
 * Typed token exports for JS consumption.
 * Values stay in sync with the CSS custom properties in app/globals.css.
 */

export const colors = {
  white: "#FFFFFF",
  paper: {
    50: "#FDFCFB",
    100: "#F8F6F3",
    200: "#F0EDE8",
    300: "#E4DFD8",
  },
  red: {
    900: "#5E1711",
    800: "#7E1F17",
    700: "#99261C",
    600: "#B52D20",
    500: "#CC3A2B",
    400: "#E05A4A",
    200: "#F4C4BD",
    100: "#FBE6E2",
    50: "#FDF4F2",
  },
  green: {
    800: "#14472F",
    700: "#1B5C3D",
    600: "#24744E",
    500: "#2F9063",
    200: "#BFE0CE",
    100: "#E4F2EA",
  },
  ink: {
    900: "#17140F",
    700: "#2E2820",
    600: "#514A40",
    400: "#7D7568",
    200: "#B8B1A6",
  },
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export const spacing = [4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 160, 192] as const;
