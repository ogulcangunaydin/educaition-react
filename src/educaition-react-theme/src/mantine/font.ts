import { HeadingStyle, MantineFontSizesValues, rem } from "@mantine/core";

// Extend the HeadingStyle type to include custom properties
interface CustomHeadingStyle extends HeadingStyle {
  letterSpacing?: string;
  textTransform?: "none" | "capitalize" | "uppercase" | "lowercase";
}

interface MantineHeadings {
  fontFamily: string;
  fontWeight: string;
  sizes: {
    h1: CustomHeadingStyle;
    h2: CustomHeadingStyle;
    h3: CustomHeadingStyle;
    h4: CustomHeadingStyle;
    h5: CustomHeadingStyle;
    h6: CustomHeadingStyle;
  };
}

const fontName = "Poppins";

const fontFamily = `${fontName}, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif`;

const fontSizes: MantineFontSizesValues = {
  xs: rem(11),
  sm: rem(13),
  md: rem(15),
  lg: rem(17),
  xl: rem(19),
  xxl: rem(21), // Added custom size
};

const headings: MantineHeadings = {
  fontFamily,
  fontWeight: "400",
  sizes: {
    h1: {
      fontSize: rem(36),
      lineHeight: "46px",
      fontWeight: "700", // Custom weight
      letterSpacing: "0.5px", // Custom property
      textTransform: "uppercase", // Custom property
    },
    h2: {
      fontSize: rem(28),
      lineHeight: "38px",
      fontWeight: "600", // Custom weight
      letterSpacing: "0.4px", // Custom property
    },
    h3: {
      fontSize: rem(24),
      lineHeight: "32px",
      fontWeight: "500", // Custom weight
      letterSpacing: "0.3px", // Custom property
    },
    h4: {
      fontSize: rem(20),
      lineHeight: "28px",
      fontWeight: "500", // Custom weight
      letterSpacing: "0.2px", // Custom property
    },
    h5: {
      fontSize: rem(18),
      lineHeight: "26px",
      fontWeight: "400", // Custom weight
      letterSpacing: "0.1px", // Custom property
    },
    h6: {
      fontSize: rem(16),
      lineHeight: "24px",
      fontWeight: "400", // Custom weight
    },
  },
};

export const MantineFontConfig = {
  fontFamily,
  fontName,
  fontSizes,
  headings,
};
