import { Loader } from "@mantine/core";
import clsx from "clsx";
import classes from "./SplashScreen.module.scss";

export interface SplashScreenProps {
  grow?: boolean;
}

export function SplashScreen({ grow }: SplashScreenProps) {
  return (
    <div
      className={clsx(classes.splashScreen, {
        [classes.splashScreenGrow]: grow,
      })}
    >
      <Loader />
    </div>
  );
}
