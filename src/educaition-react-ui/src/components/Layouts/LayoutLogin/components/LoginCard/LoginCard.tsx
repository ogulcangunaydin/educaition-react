import { Center, Stack, Text, Title } from "@mantine/core";
import clsx from "clsx";
import React from "react";
import { If } from "../../../../If";
import classes from "./LoginCard.module.scss";

type LoginCardProps = Partial<{
  className: string;
  description: React.ReactNode | string;
  title: string;
  titleChildren: React.ReactNode;
}>;

export function LoginCard({
  className,
  children,
  description,
  title,
  titleChildren,
}: React.PropsWithChildren<LoginCardProps>) {
  const hasTitle = !!title;
  const hasDescription = !!description;
  const isDescriptionString = hasDescription && typeof description === "string";

  return (
    <Center
      className={clsx(classes.loginCardContainer, className)}
      data-testid="section-login-card"
    >
      <div className={classes.loginCard}>
        <If value={hasTitle || hasDescription}>
          <Stack gap={10} mb={50}>
            <If value={hasTitle}>
              <Title fw={700} data-testid="text-login-card-title">
                {title}
                {titleChildren}
              </Title>
            </If>
            <If value={hasDescription}>
              <div data-testid="text-login-card-description">
                <If value={isDescriptionString}>
                  <Text c="gray" size="md">
                    {description}
                  </Text>
                </If>
                <If value={!isDescriptionString}>{description}</If>
              </div>
            </If>
          </Stack>
        </If>

        {children}
      </div>
    </Center>
  );
}
