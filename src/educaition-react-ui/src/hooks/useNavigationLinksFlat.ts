import { useNavigationLinks } from "./useNavigationLinks";
import { useMemo } from "react";
import { NavigationLink } from "@educaition-react/ui/interfaces";
import { ensureArray } from "@educaition-react/ui/utils";

function flattenNavigationLinksRecursive(
  links: NavigationLink[],
): NavigationLink[] {
  return ensureArray(links).reduce(
    (acc, link) => [
      ...acc,
      link,
      ...flattenNavigationLinksRecursive(link.items || []),
    ],
    [] as NavigationLink[],
  );
}

export function useNavigationLinksFlat(): NavigationLink[] {
  const links = useNavigationLinks();

  return useMemo(() => flattenNavigationLinksRecursive(links), [links]);
}
