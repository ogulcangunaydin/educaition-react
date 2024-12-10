import { em, createTheme, MantineThemeOverride } from "@mantine/core";
import {
  MantineFontConfig,
  MantineRadiusConfig,
  NotificationConfig,
  EDUCAITION_DARK_COLORS,
  EDUCAITION_LIGHT_COLORS,
  ButtonConfig,
} from "./mantine";

export type MediaQuery = "XXS" | "XS" | "SM" | "MD" | "LG" | "XL" | "XXL";

export const MEDIA_QUERIES: Record<MediaQuery, number> = {
  XXS: 320,
  XS: 576,
  SM: 768,
  MD: 1024,
  LG: 1280,
  XL: 1440,
  XXL: 1920,
};

const baseTheme: MantineThemeOverride = {
  components: {
    Notification: NotificationConfig,
    Button: ButtonConfig,
  },
  primaryColor: "blue",
  black: "#000000",
  white: "#ffffff",
  cursorType: "pointer",
  lineHeights: {
    xs: "1.5",
    sm: "1.5",
    md: "1.5",
    lg: "1.5",
    xl: "1.5",
  },
  fontFamily: MantineFontConfig.fontFamily,
  fontSizes: MantineFontConfig.fontSizes,
  headings: MantineFontConfig.headings,
  primaryShade: {
    light: 5,
    dark: 8,
  },
  radius: MantineRadiusConfig,
  other: {
    fontFamilySecondary: MantineFontConfig.fontFamily,
  },
  breakpoints: Object.entries(MEDIA_QUERIES).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [key.toLowerCase()]: em(value),
    }),
    {},
  ),
};

export const EDUCAITION_LIGHT_THEME = createTheme({
  ...baseTheme,
  colors: EDUCAITION_LIGHT_COLORS,
});

export const EDUCAITION_DARK_THEME = createTheme({
  ...baseTheme,
  colors: EDUCAITION_DARK_COLORS,
});
