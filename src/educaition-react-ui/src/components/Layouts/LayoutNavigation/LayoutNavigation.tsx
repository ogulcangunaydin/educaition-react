import { Anchor, Group } from "@mantine/core";
import { EducaitionLogo } from "@educaition-react/ui/components";
import { EducaitionReactRoutes } from "@educaition-react/ui/constants";
import { Link } from "react-router-dom";
import classes from "./LayoutNavigation.module.scss";
import { LayoutNavigationMenu } from "./components";

export function LayoutNavigation() {
  return (
    <Group className={classes.layoutNavigation}>
      <Group gap={20}>
        <Anchor
          className={classes.layoutNavigationLogoLink}
          component={Link}
          to={EducaitionReactRoutes.Dashboard.href}
        >
          <EducaitionLogo
            className={classes.layoutNavigationLogo}
            height={24}
          />
        </Anchor>
      </Group>

      <LayoutNavigationMenu />
    </Group>
  );
}
