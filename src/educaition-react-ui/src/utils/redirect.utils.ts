import { Location, To } from "react-router-dom";

export function getHrefWithSearchParams(href: string, location: Location): To {
  if (location.pathname === href) {
    return {
      pathname: href,
      search: location.search,
    };
  }

  return href;
}
