import { useNavigationLinkMatched } from "@educaition-react/ui/hooks";
import React from "react";
import { LayoutHeader } from "../LayoutHeader";
import { LayoutPage } from "../LayoutPage";
import classes from "./LayoutDashboard.module.scss";

export function LayoutDashboard({ children }: React.PropsWithChildren) {
  const matchedLink = useNavigationLinkMatched();

  return (
    <>
      <div className={classes.layoutDashboard}>
        <div
          className={classes.layoutDashboardContent}
          data-with-border={!matchedLink}
        >
          <LayoutHeader />
          <LayoutPage>{children}</LayoutPage>
        </div>
      </div>
    </>
  );
}
