import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Box,
  BoxProps,
  Group,
  Stack,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { If } from "../If";
import clsx from "clsx";
import React from "react";
import classes from "./InfoPanel.module.scss";

interface InfoPanelProps extends BoxProps {
  content: string;
  icon?: React.ReactNode;
  title?: React.ReactNode;
}

export function InfoPanel({
  title,
  content,
  icon,
  className,
  ...props
}: InfoPanelProps) {
  const theme = useMantineTheme();

  return (
    <Box className={clsx(classes.infoPanel, className)} {...props}>
      <Group gap={30} wrap="nowrap" justify="space-between">
        <Stack gap={10}>
          <If value={!!title}>
            <Text size="sm" fw={700}>
              {title}
            </Text>
          </If>
          <Text size="xs" c="gray">
            {content}
          </Text>
        </Stack>
        {icon ?? (
          <FontAwesomeIcon
            color={theme.colors.gray[0]}
            icon={faInfoCircle}
            size="4x"
          />
        )}
      </Group>
    </Box>
  );
}
