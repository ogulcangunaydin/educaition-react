import { Group, Text, UnstyledButton } from "@mantine/core";
import { useFlexIconRender } from "@educaition-react/ui/hooks";
import { NavigationLink } from "@educaition-react/ui/interfaces";
import { getHrefWithSearchParams } from "@educaition-react/ui/utils";
import clsx from "clsx";
import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import classes from "./LayoutNavigationLink.module.scss";

interface LayoutNavigationLinkProps
  extends Pick<NavigationLink, "application" | "icon">,
    React.ComponentProps<"button"> {
  active?: boolean;
  className?: string;
  fontWeight?: React.CSSProperties["fontWeight"];
  label: string;
  textClassName?: string;
  to?: string;
}

export function LayoutNavigationLink({
  active,
  application,
  children,
  className,
  fontWeight = 500,
  icon,
  label,
  textClassName,
  to,
  ...props
}: React.PropsWithChildren<LayoutNavigationLinkProps>) {
  const location = useLocation();
  const iconComponent = useFlexIconRender(icon);
  const navigationComponent: React.ElementType = !to ? "div" : NavLink;
  const path =
    application === "cljs" ? to : getHrefWithSearchParams(to || "", location);

  return (
    <UnstyledButton
      component={navigationComponent as any}
      className={clsx(classes.layoutNavigationLink, className, {
        active,
      })}
      to={path}
      color="dark"
      {...props}
    >
      <Group gap={10}>
        <div className={classes.layoutNavigationLinkIcon}>{iconComponent}</div>

        <Text
          fw={fontWeight}
          size="sm"
          className={clsx(classes.layoutNavigationLinkText, textClassName)}
        >
          {label}
        </Text>
      </Group>

      {children}
    </UnstyledButton>
  );
}
