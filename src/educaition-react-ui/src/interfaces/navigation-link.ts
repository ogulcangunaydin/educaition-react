import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import React from "react";

export type NavigationLinkApplicationType = "cljs";

export interface NavigationLink {
  application?: NavigationLinkApplicationType;
  description?: string;
  href?: string;
  icon: IconDefinition | React.ReactNode;
  id: string;
  items?: NavigationLink[];
  itemsHidden?: boolean;
  label: string;
  onClick?: VoidFunction;
  parentNavigationLink?: NavigationLink;
  hideFromNavigation?: boolean;
}

export type NavigationLinkSimple = Required<
  Pick<NavigationLink, "href" | "label">
> &
  Partial<Pick<NavigationLink, "application">>;
