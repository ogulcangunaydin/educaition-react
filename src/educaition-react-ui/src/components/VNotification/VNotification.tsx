import {
  Notification,
  NotificationProps as NotificationComponentProps,
} from "@mantine/core";
import { NotificationData, showNotification } from "@mantine/notifications";
import {
  NOTIFICATION_CONTAINER_MAX_WIDTH,
  NotificationType,
  getNotificationColorFromType,
  getNotificationIconFromType,
} from "@educaition-react/theme";
import i18n from "@educaition-react/ui/i18n";
import React from "react";

interface NotificationOptions
  extends Omit<NotificationData, "color" | "icon"> {}

function displayNotification(
  type: NotificationType,
  options: NotificationOptions,
) {
  const icon = getNotificationIconFromType(type);
  const color = getNotificationColorFromType(type);

  const notificationErrorTitles: Record<NotificationType, string> = {
    error: i18n.t("error"),
    info: i18n.t("information"),
    additional: i18n.t("additional"),
    success: i18n.t("success"),
    warning: i18n.t("warning"),
  };

  showNotification({
    ...options,
    color,
    icon,
    message: options.message,
    title: options.title || notificationErrorTitles[type],
  });
}

export function showWarningNotification(options: NotificationOptions) {
  displayNotification("warning", options);
}

export function showErrorNotification(options: NotificationOptions) {
  displayNotification("error", options);
}

export function showSuccessNotification(options: NotificationOptions) {
  displayNotification("success", options);
}

export function showInfoNotification(options: NotificationOptions) {
  displayNotification("info", options);
}

export function showAdditionalNotification(options: NotificationOptions) {
  displayNotification("additional", options);
}

type VNotificationProps = Omit<NotificationComponentProps, "color" | "icon"> & {
  hideIcon?: boolean;
  type: NotificationType;
};

export function VNotification({
  children,
  hideIcon,
  title,
  type,
  ...props
}: React.PropsWithChildren<VNotificationProps>) {
  const color = getNotificationColorFromType(type);
  const icon = getNotificationIconFromType(type);

  return (
    <Notification
      icon={hideIcon ? null : icon}
      color={color}
      title={title}
      maw={NOTIFICATION_CONTAINER_MAX_WIDTH}
      {...props}
    >
      {children}
    </Notification>
  );
}
