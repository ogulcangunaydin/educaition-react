/**
 * Theme Configuration
 *
 * Centralized theme settings for consistent styling across the application.
 * Uses MUI's theming system with custom extensions.
 */

import { createTheme } from "@mui/material/styles";

// Brand colors
export const COLORS = {
  primary: {
    main: "#001bc3",
    light: "#3344d4",
    dark: "#0015a0",
    contrastText: "#ffffff",
  },
  secondary: {
    main: "#6c757d",
    light: "#868e96",
    dark: "#495057",
    contrastText: "#ffffff",
  },
  success: {
    main: "#28a745",
    light: "#48c765",
    dark: "#1e7e34",
  },
  error: {
    main: "#dc3545",
    light: "#e4606d",
    dark: "#c82333",
  },
  warning: {
    main: "#ffc107",
    light: "#ffcd39",
    dark: "#e0a800",
  },
  info: {
    main: "#17a2b8",
    light: "#3ab5c6",
    dark: "#117a8b",
  },
  background: {
    default: "#f5f5f5",
    paper: "#ffffff",
    dark: "#1a1a1a",
  },
  text: {
    primary: "#212529",
    secondary: "#6c757d",
    disabled: "#adb5bd",
  },
  grey: {
    50: "#f8f9fa",
    100: "#f1f3f5",
    200: "#e9ecef",
    300: "#dee2e6",
    400: "#ced4da",
    500: "#adb5bd",
    600: "#6c757d",
    700: "#495057",
    800: "#343a40",
    900: "#212529",
  },
};

// Spacing scale (in pixels, will be converted to theme spacing units)
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border radius
export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: "50%",
};

// Box shadows
export const SHADOWS = {
  sm: "0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)",
  md: "0 3px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12)",
  lg: "0 10px 20px rgba(0, 0, 0, 0.15), 0 3px 6px rgba(0, 0, 0, 0.1)",
  xl: "0 15px 25px rgba(0, 0, 0, 0.15), 0 5px 10px rgba(0, 0, 0, 0.05)",
  card: "0 2px 8px rgba(0, 0, 0, 0.1)",
  hover: "0 4px 12px rgba(0, 0, 0, 0.15)",
};

// Typography settings
export const TYPOGRAPHY = {
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  fontFamilyMono: '"Roboto Mono", "Consolas", monospace',
  h1: {
    fontSize: "2.5rem",
    fontWeight: 700,
    lineHeight: 1.2,
  },
  h2: {
    fontSize: "2rem",
    fontWeight: 600,
    lineHeight: 1.3,
  },
  h3: {
    fontSize: "1.75rem",
    fontWeight: 600,
    lineHeight: 1.3,
  },
  h4: {
    fontSize: "1.5rem",
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h5: {
    fontSize: "1.25rem",
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h6: {
    fontSize: "1rem",
    fontWeight: 600,
    lineHeight: 1.5,
  },
  body1: {
    fontSize: "1rem",
    lineHeight: 1.5,
  },
  body2: {
    fontSize: "0.875rem",
    lineHeight: 1.5,
  },
  caption: {
    fontSize: "0.75rem",
    lineHeight: 1.4,
  },
  button: {
    fontSize: "0.875rem",
    fontWeight: 600,
    textTransform: "none",
  },
};

// Breakpoints
export const BREAKPOINTS = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
};

// Z-index scale
export const Z_INDEX = {
  drawer: 1200,
  modal: 1300,
  snackbar: 1400,
  tooltip: 1500,
};

// Transitions
export const TRANSITIONS = {
  short: "150ms",
  standard: "300ms",
  long: "500ms",
  easing: "cubic-bezier(0.4, 0, 0.2, 1)",
};

// Create MUI theme
export const theme = createTheme({
  palette: {
    primary: COLORS.primary,
    secondary: COLORS.secondary,
    success: COLORS.success,
    error: COLORS.error,
    warning: COLORS.warning,
    info: COLORS.info,
    background: COLORS.background,
    text: COLORS.text,
    grey: COLORS.grey,
  },
  typography: {
    fontFamily: TYPOGRAPHY.fontFamily,
    h1: TYPOGRAPHY.h1,
    h2: TYPOGRAPHY.h2,
    h3: TYPOGRAPHY.h3,
    h4: TYPOGRAPHY.h4,
    h5: TYPOGRAPHY.h5,
    h6: TYPOGRAPHY.h6,
    body1: TYPOGRAPHY.body1,
    body2: TYPOGRAPHY.body2,
    caption: TYPOGRAPHY.caption,
    button: TYPOGRAPHY.button,
  },
  breakpoints: {
    values: BREAKPOINTS,
  },
  shape: {
    borderRadius: BORDER_RADIUS.md,
  },
  spacing: 8, // Base spacing unit
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: BORDER_RADIUS.md,
          textTransform: "none",
          fontWeight: 600,
          padding: "8px 16px",
        },
        contained: {
          boxShadow: SHADOWS.sm,
          "&:hover": {
            boxShadow: SHADOWS.md,
          },
        },
      },
      defaultProps: {
        disableElevation: false,
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: BORDER_RADIUS.md,
          },
        },
      },
      defaultProps: {
        variant: "outlined",
        size: "medium",
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: BORDER_RADIUS.lg,
          boxShadow: SHADOWS.card,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: BORDER_RADIUS.md,
        },
        elevation1: {
          boxShadow: SHADOWS.sm,
        },
        elevation2: {
          boxShadow: SHADOWS.md,
        },
        elevation3: {
          boxShadow: SHADOWS.lg,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: BORDER_RADIUS.md,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: BORDER_RADIUS.sm,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          backgroundColor: COLORS.grey[100],
        },
      },
    },
  },
});

export default theme;
