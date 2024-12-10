import { em } from "@mantine/core";
import { MEDIA_QUERIES, MediaQuery } from "@educaition-react/theme";

export namespace Breakpoints {
  /*
   * Example:
   *   import { useMediaQuery } from "@mantine/hooks";
   *
   *   const matches = useMediaQuery(Breakpoints.DOWN.XXS); // (max-width: 320px)
   *   const matches = useMediaQuery(Breakpoints.DOWN.XS); // (max-width: 576px)
   *   const matches = useMediaQuery(Breakpoints.DOWN.SM); // (max-width: 992px)
   *   const matches = useMediaQuery(Breakpoints.DOWN.MD); // (max-width: 1200px)
   *   const matches = useMediaQuery(Breakpoints.DOWN.LG); // (max-width: 1366px)
   *   const matches = useMediaQuery(Breakpoints.DOWN.XL); // (max-width: 1600px)
   *   const matches = useMediaQuery(Breakpoints.DOWN.XXL); // (max-width: 1920px)
   *
   *   const matches = useMediaQuery(Breakpoints.UP.XXS); // (min-width: 320px)
   *   const matches = useMediaQuery(Breakpoints.UP.XS); // (min-width: 576px)
   *   const matches = useMediaQuery(Breakpoints.UP.SM); // (min-width: 992px)
   *   const matches = useMediaQuery(Breakpoints.UP.MD); // (min-width: 1200px)
   *   const matches = useMediaQuery(Breakpoints.UP.LG); // (min-width: 1366px)
   *   const matches = useMediaQuery(Breakpoints.UP.XL); // (min-width: 1600px)
   *   const matches = useMediaQuery(Breakpoints.UP.XXL); // (min-width: 1920px)
   * */

  export const UP: Record<MediaQuery, string> = Object.entries(
    MEDIA_QUERIES,
  ).reduce(
    (acc, [key, value]) =>
      ({ ...acc, [key]: `(min-width: ${em(value)})` }) as Record<
        MediaQuery,
        string
      >,
    {} as Record<MediaQuery, string>,
  );

  export const DOWN: Record<MediaQuery, string> = Object.entries(
    MEDIA_QUERIES,
  ).reduce(
    (acc, [key, value]) =>
      ({ ...acc, [key]: `(max-width: ${em(value - 1)})` }) as Record<
        MediaQuery,
        string
      >,
    {} as Record<MediaQuery, string>,
  );
}
