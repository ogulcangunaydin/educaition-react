import { Group } from "@mantine/core";
import { EducaitionReactRoutes } from "@educaition-react/ui/constants";
import clsx from "clsx";
import { useLocation } from "react-router-dom";
import { LayoutNavigation } from "../LayoutNavigation";
import classes from "./LayoutHeader.module.scss";
import { LayoutHeaderProfileMenu } from "./components";

export function LayoutHeader() {
  const { pathname: route } = useLocation();

  return (
    <div
      className={clsx(classes.layoutHeader, {
        [classes.layoutHeaderWithBorder]:
          route === EducaitionReactRoutes.Dashboard.href,
      })}
    >
      <Group
        justify="space-between"
        className={classes.layoutHeaderContent}
        data-with-border={false}
      >
        <LayoutNavigation />

        <Group className={classes.layoutHeaderContentWrapper}>
          <LayoutHeaderProfileMenu />
        </Group>
      </Group>
    </div>
  );
}
