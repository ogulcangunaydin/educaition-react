import { useMemo } from "react";
import { useMatches } from "react-router-dom";
import { useNavigationLinksFlat } from "./useNavigationLinksFlat";

export function useNavigationLinkMatched() {
  const matches = useMatches();
  const links = useNavigationLinksFlat();

  return useMemo(() => {
    for (const match of matches) {
      const matchedLink = links.find((link) =>
        match.pathname.includes(link.href || ""),
      );
      if (matchedLink) {
        return matchedLink;
      }
    }

    return null;
  }, [matches, links]);
}
