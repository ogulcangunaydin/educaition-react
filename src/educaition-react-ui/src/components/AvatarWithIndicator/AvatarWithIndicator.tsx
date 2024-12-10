import {
  Avatar,
  AvatarProps,
  Indicator,
  Loader,
  MantineColor,
  useMantineTheme,
} from "@mantine/core";
import { FirstCharString } from "@educaition-react/ui/components";
import { ensureHexColor } from "@educaition-react/ui/utils";
import { useMemo, useState } from "react";
import classes from "./AvatarWithIndicator.module.scss";

interface AvatarWithIndicatorProps {
  avatarColor: string;
  avatarSize: number;
  indicatorSize?: number;
  name: string;
  offset?: number;
  onlineColor?: MantineColor;
  src?: string;
  radius?: AvatarProps["radius"];
}

export function AvatarWithIndicator({
  avatarColor,
  avatarSize,
  indicatorSize,
  name,
  offset,
  src,
  radius = 50,
}: AvatarWithIndicatorProps) {
  const color = useMemo(() => ensureHexColor(avatarColor), [avatarColor]);
  const theme = useMantineTheme();
  const [loading, setLoading] = useState(!!src);

  function handleLoadOrError() {
    setLoading(false);
  }

  return (
    <Indicator
      inline={true}
      size={indicatorSize || avatarSize / 3}
      offset={offset || avatarSize / 7}
      color="white"
      position="bottom-end"
      className={classes.avatarWithIndicator}
    >
      <img
        src={src}
        onError={handleLoadOrError}
        onLoad={handleLoadOrError}
        hidden={true}
      />
      <Avatar
        radius={radius}
        size={avatarSize}
        src={loading ? null : src}
        {...(!loading && {
          styles: {
            placeholder: { backgroundColor: color, color: theme.white },
          },
        })}
      >
        {loading ? (
          <Loader size="xs" />
        ) : (
          <FirstCharString value={name} uppercase={true} />
        )}
      </Avatar>
    </Indicator>
  );
}
