import { MantineSize, rem } from "@mantine/core";

// Define additional sizes
type ExtendedMantineSize = MantineSize | "xxs" | "xxl" | "xxxl";

export const MantineRadiusConfig: Record<ExtendedMantineSize, string> = {
  xxs: rem(1), // Extra extra small
  xs: rem(3), // Extra small
  sm: rem(6), // Small
  md: rem(12), // Medium
  lg: rem(24), // Large
  xl: rem(48), // Extra large
  xxl: rem(64), // Extra extra large
  xxxl: rem(80), // Extra extra extra large
};
