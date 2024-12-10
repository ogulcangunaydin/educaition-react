import { Group } from "@mantine/core";
import { EducaitionReactRoutes } from "@educaition-react/ui/constants";
import { Link } from "react-router-dom";
import { EducaitionLogo } from "../../EducaitionLogo";
import classes from "./LayoutLogin.module.scss";

export function LayoutLogin({ children }: React.PropsWithChildren) {
  return (
    <div className={classes.pageLoginLayout} data-testid="section-login-layout">
      <div className={classes.pageLoginLayoutBg} />

      <Group justify="space-between" align="flex-start">
        <Link to={EducaitionReactRoutes.Login.href} data-testid="link-logo">
          <EducaitionLogo width={110} height={32} />
        </Link>
      </Group>

      <div className={classes.pageLoginLayoutContent}>
        <div className={classes.pageLoginLayoutContentBody}>{children}</div>
      </div>
    </div>
  );
}
